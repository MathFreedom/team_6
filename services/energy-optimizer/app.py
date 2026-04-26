"""
HTTP surface for the Energy Contract Optimization Service.
==========================================================

Single endpoint, stateless, JSON-in / JSON-out. Designed to live
behind Cloud Run and be called directly by the mobile client.

    POST /recommend
        body = { prm, [zipcode], [kva],
                 [current_provider_id], [current_offer_id],
                 [current_tariff_type] }
        -> { current, ranked[], profile_summary, narrative }

The heavy lifting (Linky fingerprint, catalog cost projection,
LLM narrative) is implemented in `agent.recommend`. This module is
intentionally thin: input validation, exception → HTTP status
translation, and Pydantic response shaping.
"""
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from agent import recommend

app = FastAPI(
    title="Energy Contract Optimization Service",
    description=(
        "Given a French Linky meter PRM, returns the catalog of "
        "available retail electricity offers ranked by annual savings "
        "vs the user's current contract. Linky fingerprint via "
        "conso.boris.sh; tariff costs computed by the Médiateur "
        "national de l'énergie's official comparator (validated <1% "
        "deviation vs the user-facing site)."
    ),
    version="1.0.0",
)


# ──────────────────────────────────────────────────────────────────────────
#  Request / response schemas
# ──────────────────────────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    prm: str = Field(
        ...,
        min_length=14, max_length=14,
        description="14-digit Linky meter identifier (PRM)",
    )
    zipcode: str = Field(
        ...,
        min_length=5, max_length=5,
        description="French zip code (drives the tariff zone). Required — no implicit default.",
    )
    kva: Optional[int] = Field(
        None, ge=1, le=36,
        description=(
            "Subscribed power in kVA. When omitted, auto-derived from the "
            "Linky peak draw via the calibrated tier mapping."
        ),
    )
    current_provider_id: Optional[int] = Field(
        None,
        description=(
            "Optional. Médiateur internal supplier id of the user's "
            "current contract. Required to compute server-side savings "
            "against a baseline."
        ),
    )
    current_offer_id: Optional[int] = Field(
        None,
        description="Optional. Médiateur internal offer id of the current contract.",
    )
    current_tariff_type: int = Field(
        1, ge=1, le=3,
        description="1=Base, 2=HP/HC, 3=Tempo. Must match the current offer's structure.",
    )


class RankedOffer(BaseModel):
    provider: str
    name: str
    annual_cost_eur: int
    savings_eur: Optional[int]
    is_green: bool
    is_fixed_price: bool
    url: Optional[str]
    score_total: Optional[float]
    reasons: list[str]


class CurrentOffer(BaseModel):
    provider: Optional[str]
    annual_cost_eur: int


class ProfileSummary(BaseModel):
    annual_kwh: int
    daily_avg_kwh: float
    hp_share_pct: int
    best_hc_window: str
    weekend_share_pct: int
    peak_power_w: int


class RecommendResponse(BaseModel):
    current: Optional[CurrentOffer]
    ranked: list[RankedOffer]
    profile_summary: ProfileSummary
    narrative: str


# ──────────────────────────────────────────────────────────────────────────
#  Routes
# ──────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict:
    """Liveness probe for Cloud Run / load balancers."""
    return {"status": "ok"}


@app.post(
    "/recommend",
    response_model=RecommendResponse,
    summary="Rank offers by annual savings for a given PRM",
)
def post_recommend(req: RecommendRequest) -> dict:
    """Run the optimization pipeline and return the ranking.

    Status code mapping:
        200 — success
        401 — invalid / expired Bearer token (Linky gateway)
        404 — Enedis returned no_data_found (user has not enabled
               hourly consumption recording on their Enedis account)
        422 — request validation failed (Pydantic), or PRM not numeric
        500 — unexpected error (bubbled up from the pipeline)
        502 — upstream comparator unreachable / unexpected response
    """
    if not req.prm.isdigit():
        raise HTTPException(status_code=422, detail="PRM must be 14 digits")
    try:
        return recommend(
            req.prm,
            req.zipcode,
            kva=req.kva,
            current_provider_id=req.current_provider_id,
            current_offer_id=req.current_offer_id,
            current_tariff_type=req.current_tariff_type,
        )
    except PermissionError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except RuntimeError as e:
        msg = str(e)
        if "no_data_found" in msg or "no measure" in msg:
            raise HTTPException(status_code=404, detail=msg)
        raise HTTPException(status_code=502, detail=msg)
    except Exception as e:  # pragma: no cover — defensive, never expected in prod
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")
