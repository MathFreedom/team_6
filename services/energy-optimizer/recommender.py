"""
Pattern-aware offer scoring engine.
===================================

The cost projection from `scrape_mediateur` answers a precise question:
"how much would this offer cost this user over twelve months?". That is
necessary but not sufficient. A user-facing recommendation also needs
to weigh *structural fit*: a tariff with mathematically lower cost is
not always the right choice if its structure punishes the user's
behavioural pattern.

Concrete examples this scorer captures:

    * Two near-identical Base offers, one of which is fixed-price for
      24 months → the fixed-price one wins (small adequation bonus).
    * An HP/HC tariff that comes out 30 €/year cheaper than the user's
      current Base offer, but the user only consumes 22 % in HC →
      bigger HP price punishes them on the (much larger) HP fraction
      and the cheaper sticker is fragile.
    * A Tempo offer that would be optimal for a customer with strong
      load-shifting flexibility but disastrous for someone who heats
      with electricity and cannot avoid red days.

Rather than re-simulate against the load curve (which we plan to do
later), this scorer applies fast deterministic rules on top of the
already-validated cost projections to deliver an actionable ranking.

Scoring algebra
---------------

    score_total = price_weight × score_price + (1 − price_weight) × score_adequation

    score_price        ∈ [0, 100]   100 = cheapest, 0 = most expensive,
                                    linear interpolation over the
                                    candidate pool.

    score_adequation   ∈ [0, 100]   structure-fit, computed by
                                    `score_adequation()` per tariff family.

    +5 bonus on score_adequation if `is_fixed_price=True` (price
    stability is a real value to the consumer, capped at 100).

Default `price_weight = 0.7` privileges the wallet but doesn't ignore
fit. Push it to 1.0 to fall back to a pure cheapest-first ranking;
push it to 0.0 to optimise structure regardless of cost.

Output rationale
----------------

Each `ScoredOffer` carries a `reasons[]` list — short bullet strings
describing why this offer scored as it did. These feed the LLM advisor
agent (`agent.py`) for the final natural-language synthesis, and they
can be surfaced verbatim in the mobile UI as transparency labels.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from enedis_gateway import LinkyProfile


@dataclass
class ScoredOffer:
    """Compact, JSON-serializable scoring record for one offer."""

    id: str
    provider: str
    name: str
    total_eur: int
    is_green: bool
    is_fixed_price: bool
    url: Optional[str]
    score_price: float       # ∈ [0, 100]
    score_adequation: float  # ∈ [0, 100]
    score_total: float       # ∈ [0, 100]
    reasons: list[str]       # human-readable trace of the scoring decision

    def to_dict(self) -> dict:
        return {
            "id":               self.id,
            "provider":         self.provider,
            "name":             self.name,
            "total_eur":        self.total_eur,
            "is_green":         self.is_green,
            "is_fixed_price":   self.is_fixed_price,
            "url":              self.url,
            "score_price":      round(self.score_price, 1),
            "score_adequation": round(self.score_adequation, 1),
            "score_total":      round(self.score_total, 1),
            "reasons":          self.reasons,
        }


def detect_offer_type(name: str) -> str:
    """Classify an offer into one of seven structural families based on
    its name. The Médiateur catalog does not expose a structural label
    field directly; the offer name is the most reliable signal in
    practice, with extremely low false-positive rates on the keywords
    we use here.
    """
    n = name.lower()
    if "tempo" in n:
        return "tempo"
    if "week-end" in n or "weekend" in n or "week end" in n:
        return "weekend"
    if "ejp" in n:
        return "ejp"
    if any(k in n for k in ["heures creuses", "hp/hc", "hp-hc", "/hc", "creuse"]):
        return "hp_hc"
    if "spot" in n or "dynamique" in n or "indexée" in n or "indexe" in n:
        return "dynamic"
    return "base"


def score_adequation(
    offer_type: str, profile: LinkyProfile
) -> tuple[float, list[str]]:
    """Score how well a tariff *structure* fits a measured behavioural
    pattern. Pure deterministic logic, no LLM.

    The decision boundaries below were calibrated on documented retail
    energy advisor heuristics (HC ≥ 35 % to break even on HP/HC, etc.).
    They are intentionally conservative: rather than pretend to predict
    €/year impact, we produce a coarse 30-90 score and leave the price
    component to do the heavy lifting on absolute savings.
    """
    reasons: list[str] = []
    hc = profile.best_hc_share
    we = profile.weekend_share
    we_natural = we > 0.30  # baseline is 5/7 ≈ 0.286

    if offer_type == "base":
        # Base is structurally neutral. Penalise only if the user has
        # a large unused HC potential.
        if hc > 0.45:
            score = 40
            reasons.append(
                f"Base tariff but {hc:.0%} of consumption falls in HC — unused saving potential"
            )
        else:
            score = 65
            reasons.append("Base: simple structure, no time-of-use constraint")
        return score, reasons

    if offer_type == "hp_hc":
        # Sweet spot: HC ≥ 35-40 %. Below 30 %, HP/HC actively hurts.
        if hc >= 0.40:
            score = 90
            reasons.append(
                f"Strong HP/HC fit: {hc:.0%} of energy in off-peak window ({profile.best_hc_window})"
            )
        elif hc >= 0.32:
            score = 70
            reasons.append(f"Acceptable HP/HC fit: {hc:.0%} in off-peak window")
        else:
            score = 35
            reasons.append(
                f"Insufficient HC volume ({hc:.0%}) — HP/HC will overpay on the HP fraction"
            )
        return score, reasons

    if offer_type == "tempo":
        # Tempo punishes inflexible users on the 22 red days. We use
        # off-peak share as a proxy for flexibility (proper version
        # would crossreference the actual load curve with the historical
        # RTE Tempo calendar — a planned upgrade).
        if hc >= 0.40 and profile.daily_avg_kwh < 25:
            score = 80
            reasons.append(
                "Tempo: nocturnal usage + frugal household, ideal to absorb red days"
            )
        elif hc >= 0.35:
            score = 60
            reasons.append(
                "Tempo: borderline fit, viable if water heater and dishwasher can shift to blue HC"
            )
        else:
            score = 30
            reasons.append(
                "Tempo risky: low observed flexibility, the 22 red days would dominate"
            )
        return score, reasons

    if offer_type == "weekend":
        if we_natural:
            score = 80
            reasons.append(
                f"Weekend-loaded household ({we:.0%} sat-sun) — week-end tariff is well aligned"
            )
        else:
            score = 45
            reasons.append(
                f"Light weekend ({we:.0%}) — paying a weekday premium has little upside"
            )
        return score, reasons

    if offer_type == "ejp":
        score = 30
        reasons.append("EJP: 22 mobile expensive days, largely superseded by Tempo")
        return score, reasons

    if offer_type == "dynamic":
        if profile.peak_power_w < 4500 and hc >= 0.35:
            score = 75
            reasons.append("Dynamic: bounded peak load + flexibility, can ride hourly prices")
        else:
            score = 50
            reasons.append("Dynamic: hourly volatility exposure, handle with care")
        return score, reasons

    return 50, ["Unrecognised tariff structure"]


def score_offers(
    offers: list[dict],
    profile: Optional[LinkyProfile] = None,
    *,
    price_weight: float = 0.7,
) -> list[ScoredOffer]:
    """Return the candidate set ranked by `score_total` descending.

    When `profile` is None, adequation is fixed at 50 and the ranking
    reduces to a price-only sort.
    """
    if not offers:
        return []
    prices = [o["total_eur"] for o in offers]
    p_min, p_max = min(prices), max(prices)
    span = (p_max - p_min) or 1  # guard against the all-same-price degenerate case

    out: list[ScoredOffer] = []
    for o in offers:
        # Linear price score over the candidate pool. The cheapest is
        # always 100; the most expensive is always 0.
        sp = 100 * (1 - (o["total_eur"] - p_min) / span)
        if profile is None:
            sa = 50
            reasons = ["No Linky profile — score derived from price only"]
        else:
            otype = detect_offer_type(o.get("name", ""))
            sa, reasons = score_adequation(otype, profile)
        # Stability bonus: a contract-locked price is worth ~5 pts of
        # adequation in expectation, since it caps wholesale-driven
        # downside risk over the contract term.
        if o.get("is_fixed_price"):
            sa = min(100, sa + 5)
            reasons.append("Stability bonus: price locked for the contract duration")

        st = price_weight * sp + (1 - price_weight) * sa
        out.append(
            ScoredOffer(
                id=str(o.get("id", "")),
                provider=o.get("provider", "?"),
                name=o.get("name", "?"),
                total_eur=int(o["total_eur"]),
                is_green=bool(o.get("is_green", False)),
                is_fixed_price=bool(o.get("is_fixed_price", False)),
                url=o.get("url"),
                score_price=sp,
                score_adequation=sa,
                score_total=st,
                reasons=reasons,
            )
        )
    out.sort(key=lambda x: x.score_total, reverse=True)
    return out
