"""
Energy contract optimization pipeline.
======================================

Stateless, idempotent function `recommend(prm, ...)` that orchestrates
the full Linky-to-recommendation pipeline. Designed to be the single
entry point of the FastAPI route in `app.py`.

Pipeline stages
---------------

    1. Linky fingerprint extraction        (enedis_gateway.ConsoBorisClient)
    2. Behavioural decision: Base vs HP/HC, hp_ratio derivation
    3. Catalog cost projection              (scrape_mediateur)
    4. Pattern-aware offer scoring          (recommender.score_offers)
    5. LLM-driven narrative synthesis       (CrewAI advisor agent)
    6. Flat ranked output                   (sorted by `savings_eur` DESC)

Why CrewAI and not just a single LLM call ?
-------------------------------------------

In this pipeline the LLM is bounded to one job: write a 50-80 word
French recommendation that *uses* the structured data we collected
deterministically. CrewAI gives us, for free, structured Agent / Task /
Crew abstractions, retry on transient errors, and an upgrade path: if
later we want to broaden the agent's scope (multi-step decision,
real-time tool use to evaluate "what if I downgrade kVA"), we add
tools and tasks without changing the call site here.

Failure mode is graceful: missing `ANTHROPIC_API_KEY` or any LLM-side
exception causes the pipeline to fall back to a deterministic
templated narrative and continue serving — the structured ranking is
always returned even if the natural-language gloss is missing.
"""
from __future__ import annotations

import json
import os
from typing import Optional

from dotenv import load_dotenv

from enedis_gateway import ConsoBorisClient, LinkyProfile, infer_kva_from_peak_power
from recommender import score_offers
from scrape_mediateur import EnergieInfoScraper

load_dotenv()


# ──────────────────────────────────────────────────────────────────────────
#  Stage 1 — Linky fingerprint extraction
# ──────────────────────────────────────────────────────────────────────────

def _fetch_linky(prm: str) -> LinkyProfile:
    token = os.getenv("CONSO_BORIS_TOKEN")
    if not token:
        raise RuntimeError("CONSO_BORIS_TOKEN missing from environment")
    return ConsoBorisClient(token=token).extract_full_profile(prm=prm)


# ──────────────────────────────────────────────────────────────────────────
#  Stage 3 — Catalog cost projection
# ──────────────────────────────────────────────────────────────────────────

def _fetch_offers(
    *,
    zipcode: str,
    kva: int,
    annual_kwh: int,
    hp_hc: bool,
    hp_ratio: int,
    current_provider_id: Optional[int] = None,
    current_offer_id: Optional[int] = None,
    current_tariff_type: int = 1,
) -> tuple[list[dict], Optional[dict]]:
    """Walk the Médiateur wizard with this profile and return:

        (catalog, current_offer)

    where `current_offer = {provider, total_eur}` if the caller
    declared a current contract, or `None` otherwise.
    """
    sc = EnergieInfoScraper.from_profile(
        zipcode=zipcode,
        kva=kva,
        annual_kwh=annual_kwh,
        hp_hc=hp_hc,
        hp_ratio=hp_ratio,
        has_linky=True,
        current_provider_id=current_provider_id,
        current_offer_id=current_offer_id,
        current_tariff_type=current_tariff_type,
    )
    offers = sc.fetch_all_offers(rate_limit_seconds=0.3)
    current = (
        sc.get_current_offer()
        if current_provider_id and current_offer_id
        else None
    )
    return offers, current


# ──────────────────────────────────────────────────────────────────────────
#  Stage 5 — LLM-driven narrative synthesis
# ──────────────────────────────────────────────────────────────────────────

def _generate_narrative(
    profile: LinkyProfile,
    top3: list[dict],
    baseline: Optional[int],
) -> str:
    """Render a 50-80 word French narrative grounded in the structured
    ranking and the user profile.

    Routing logic:
      • If `ANTHROPIC_API_KEY` is set → CrewAI advisor agent (Sonnet).
      • Otherwise, or on any LLM-side exception → deterministic template.

    The template fallback is intentional. Marketing copy is nice-to-have
    but the structured numbers are load-bearing for the consumer-facing
    decision. We refuse to fail the entire request on an LLM hiccup.
    """
    if not os.getenv("ANTHROPIC_API_KEY"):
        return _templated_narrative(top3, baseline, profile)

    try:
        from crewai import Agent, Crew, Process, Task, LLM

        llm = LLM(
            model="anthropic/claude-sonnet-4-5-20250929",
            temperature=0.3,
        )
        advisor = Agent(
            role="Retail electricity contract advisor for French residential consumers",
            goal=(
                "Explain in 2-3 short, factual French sentences why the "
                "top recommendation fits this consumption profile."
            ),
            backstory=(
                "You are an expert on the French residential electricity "
                "market: legacy and alternative suppliers (EDF, Octopus, "
                "OHM, Mint, Primeo, TotalEnergies, ENGIE, Enercoop, "
                "Vattenfall, ...), tariff structures (Base, HP/HC, Tempo, "
                "weekend), and how to read a Linky consumption profile "
                "(annual kWh, off-peak share, peak power, weekend share)."
            ),
            llm=llm,
            verbose=False,
            allow_delegation=False,
        )

        ctx = {
            "profile": {
                "annual_kwh":        profile.annual_kwh,
                "best_hc_window":    profile.best_hc_window,
                "best_hc_share_pct": round(profile.best_hc_share * 100),
                "weekend_share_pct": round(profile.weekend_share * 100),
                "peak_power_w":      profile.peak_power_w,
            },
            "top3_offers":             top3,
            "current_offer_total_eur": baseline,
        }

        task = Task(
            description=(
                "User profile and top-3 offers (in French market):\n\n"
                f"```json\n{json.dumps(ctx, ensure_ascii=False, indent=2)}\n```\n\n"
                "Produce ONLY 2-3 short French sentences that:\n"
                "  1. summarise the consumption pattern (annual kWh, daytime "
                "vs. off-peak tendency, weekend load if relevant)\n"
                "  2. recommend offer #1 with one factual justification "
                "(€/year saved, fixed price, structural fit, ...)\n"
                "  3. optionally mention a relevant alternative.\n\n"
                "Plain text only. No markdown, no bullet points, no "
                "greeting, no padding. Around 50-80 words."
            ),
            agent=advisor,
            expected_output="2-3 sentences in French.",
        )

        crew = Crew(
            agents=[advisor],
            tasks=[task],
            process=Process.sequential,
            verbose=False,
        )
        return str(crew.kickoff()).strip()
    except Exception as e:
        # Network blip, quota, schema drift — anything goes wrong on the
        # LLM side, we still return a meaningful response.
        return _templated_narrative(
            top3, baseline, profile,
            llm_failure=f"{type(e).__name__}",
        )


def _templated_narrative(
    top3: list[dict],
    baseline: Optional[int],
    profile: LinkyProfile,
    llm_failure: Optional[str] = None,
) -> str:
    """Deterministic fallback narrative."""
    if not top3:
        return "No matching offer for this profile."
    best = top3[0]
    suffix = f" (LLM unavailable: {llm_failure})" if llm_failure else ""
    if baseline:
        saved = baseline - best["annual_cost_eur"]
        return (
            f"L'offre {best['provider']} - {best['name']} économise "
            f"{saved} €/an vs ton contrat actuel ({baseline} €/an).{suffix}"
        )
    return (
        f"L'offre la moins chère pour ton profil ({profile.annual_kwh} kWh/an) "
        f"est {best['provider']} - {best['name']} à "
        f"{best['annual_cost_eur']} €/an.{suffix}"
    )


# ──────────────────────────────────────────────────────────────────────────
#  Public entry point
# ──────────────────────────────────────────────────────────────────────────

def recommend(
    prm: str,
    zipcode: str,
    *,
    kva: Optional[int] = None,
    current_provider_id: Optional[int] = None,
    current_offer_id: Optional[int] = None,
    current_tariff_type: int = 1,
) -> dict:
    """Run the full pipeline and return the API response payload.

    Args:
        prm: 14-digit PRM identifying the Linky meter to optimise.
        zipcode: 5-digit French zip code, drives the tariff zone. Required.
        kva: optional subscribed power in kVA. When omitted, the value is
            inferred from the Linky peak draw via the calibrated tier
            mapping in `infer_kva_from_peak_power`, eliminating the need
            for the user to provide it.
        current_provider_id: (optional) Médiateur internal id of the
            user's current supplier; required to compute server-side
            savings against a baseline.
        current_offer_id: (optional) Médiateur internal id of the
            user's current offer.
        current_tariff_type: 1 = Base, 2 = HP/HC, 3 = Tempo. Must
            match the tariff structure of the declared current offer.

    Returns:
        {
            "current": {provider, annual_cost_eur} | None,
            "ranked": [
                {provider, name, annual_cost_eur, savings_eur,
                 is_green, is_fixed_price, url, score_total, reasons},
                ...
            ],   # sorted by savings_eur DESC if baseline known,
                 # else by annual_cost_eur ASC
            "profile_summary": {
                annual_kwh, daily_avg_kwh, hp_share_pct,
                best_hc_window, weekend_share_pct, peak_power_w,
            },
            "narrative": "...",
        }
    """
    # ── 1. Linky fingerprint
    profile = _fetch_linky(prm)

    # ── 1b. Derive contract kVA from the peak draw if the caller did
    #        not supply it. The estimator resolves to the canonical
    #        Enedis tier in O(1) and is calibrated to match the user's
    #        actual subscription on residential profiles.
    if kva is None:
        kva = infer_kva_from_peak_power(profile.peak_power_w)

    # ── 2. Behavioural decision: derive the parameters we send to the
    #       comparator. The comparator only takes one tariff structure
    #       and one HP/HC ratio per session, so we have to pick one.
    #       Heuristic: enable HP/HC if the user's best HC window
    #       captures at least 20 % of consumption (below that, paying
    #       a higher HP rate doesn't pay off). The `hp_ratio` we send
    #       is the complement of the measured best HC share, which
    #       the comparator interprets as "% of consumption in HP".
    hp_ratio = round((1 - profile.best_hc_share) * 100)
    hp_hc_mode = profile.best_hc_share >= 0.20

    # ── 3. Catalog cost projection
    offers, current = _fetch_offers(
        zipcode=zipcode,
        kva=kva,
        annual_kwh=profile.annual_kwh,
        hp_hc=hp_hc_mode,
        hp_ratio=hp_ratio,
        current_provider_id=current_provider_id,
        current_offer_id=current_offer_id,
        current_tariff_type=current_tariff_type,
    )
    baseline = (
        int(current["total_eur"])
        if current and current.get("total_eur")
        else None
    )

    # ── 4. Pattern-aware scoring
    scored = score_offers(offers, profile=profile)

    # ── 5. Flatten into the API shape, computing savings on the fly.
    ranked: list[dict] = []
    for s in scored:
        sd = s.to_dict()
        annual = sd.pop("total_eur")
        ranked.append({
            "provider":         sd["provider"],
            "name":             sd["name"],
            "annual_cost_eur":  annual,
            "savings_eur":      (baseline - annual) if baseline is not None else None,
            "is_green":         sd["is_green"],
            "is_fixed_price":   sd["is_fixed_price"],
            "url":              sd.get("url"),
            "score_total":      sd.get("score_total"),
            "reasons":          sd.get("reasons", []),
        })

    # ── 6. Sort by the metric the consumer actually cares about.
    #       Falls back to absolute price when no baseline is available.
    if baseline is not None:
        ranked.sort(key=lambda x: x["savings_eur"], reverse=True)
    else:
        ranked.sort(key=lambda x: x["annual_cost_eur"])

    # ── 7. Narrative synthesis (LLM with deterministic fallback)
    narrative = _generate_narrative(profile, ranked[:3], baseline)

    # ── 8. Final response envelope
    return {
        "current": (
            {
                "provider":        current["provider"],
                "annual_cost_eur": baseline,
            }
            if baseline is not None
            else None
        ),
        "ranked": ranked,
        "profile_summary": {
            "annual_kwh":        profile.annual_kwh,
            "daily_avg_kwh":     profile.daily_avg_kwh,
            "hp_share_pct":      hp_ratio,
            "best_hc_window":    profile.best_hc_window,
            "weekend_share_pct": round(profile.weekend_share * 100),
            "peak_power_w":      profile.peak_power_w,
        },
        "narrative": narrative,
    }
