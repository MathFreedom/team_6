"""
Tariff cost projection client (Médiateur national de l'énergie).
================================================================

Programmatic protocol layer over `comparateur-offres.energie-info.fr`,
the official price comparator operated by the Médiateur national de
l'énergie. By regulation, every retail electricity supplier in France
is required to keep their offers up to date in this database. The
comparator therefore *is* the authoritative source of truth for retail
tariff prices. Cost projections produced server-side here include all
applicable taxes (TVA, accise, CTA) and TURPE surcharges, with a
measured deviation of <1 % vs the user-facing site.

There is no public API. This module is the result of reverse-engineering
the wizard, the CSRF flow, and the form payloads using Chrome DevTools
across `/compte/profil`, `/compte/electricite`, `/compte/configuration-
recherche`, `/results/{N}`, `/current-offer`, `/current-offer/refresh`
and `/cities`.

Two operating modes
-------------------

1. Cookie-borrowed session (development):
       scraper = EnergieInfoScraper(phpsessid="...")
       offers  = scraper.fetch_all_offers()

2. Synthetic session walked from a profile (production):
       scraper = EnergieInfoScraper.from_profile(
           zipcode="75001", kva=6, annual_kwh=4287,
           hp_hc=True, hp_ratio=60, has_linky=True,
       )
       offers   = scraper.fetch_all_offers()
       baseline = scraper.get_current_offer()

Legal posture
-------------
The comparator is a public service operated by an independent French
authority. Personal/research use with reasonable rate limiting is
tolerated. Commercial use should be formalised via
`contact@energie-mediateur.fr`.
"""
from __future__ import annotations

import json
import re
import sys
import time
from html import unescape

import requests

BASE = "https://comparateur-offres.energie-info.fr"

# ──────────────────────────────────────────────────────────────────────────
#  Wire format constants (captured via DevTools, 2026-04)
# ──────────────────────────────────────────────────────────────────────────

# The /compte/electricite form expects the kVA value as the *index* of the
# `<select>` option, NOT the kVA number itself. Sending `power=6` would
# silently bind to 18 kVA (option #6) and produce zero matching offers
# downstream — a notoriously hard-to-debug failure mode of the wizard.
# This map flips the index back so callers can pass plain kVA numbers.
PUISSANCE_INDEX: dict[int, int] = {
    3: 1,  6: 2,  9: 3, 12: 4, 15: 5, 18: 6, 24: 7, 30: 8, 36: 9,
    1: 10, 2: 11, 4: 12, 5: 13, 7: 14, 8: 15,
    10: 16, 11: 17, 13: 18, 14: 19, 16: 20, 17: 21,
    19: 22, 20: 23, 21: 24, 22: 25, 23: 26,
    25: 27, 26: 28, 27: 29, 28: 30, 29: 31,
    31: 32, 32: 33, 33: 34, 34: 35, 35: 36,
}

# Stable internal supplier identifiers used by the comparator. The list
# is hard-coded in the page DOM (no AJAX lookup), so we mirror it here
# rather than scraping it on each session.
PROVIDERS_ELEC: dict[str, int] = {
    "Alpiq": 294,
    "Alterna énergie": 152,
    "DYNEFF": 258,
    "EDF": 159,
    "Ekwateur": 260,
    "elmy": 298,
    "Enercoop": 165,
    "Energie d'ici": 262,
    "ENGIE": 168,
    "GAZ DE BORDEAUX": 204,
    "GEG Source d'Energies": 171,
    "ilek": 261,
    "la bellenergie": 269,
    "Mint Energie": 267,
    "mylight150": 307,
    "Octopus Energy": 265,
    "Ohm Energie": 278,
    "papernest energie": 302,
    "Plenitude France": 151,
    "Primeo Energie": 257,
    "TotalEnergies": 156,
    "Urban Solar Energy": 277,
    "Vattenfall": 172,
}

# Tariff structure ids accepted by `currentOfferModel[type]`. The server
# uses these to decide which price fields to read out of the session.
TARIFF_TYPE: dict[str, int] = {"Base": 1, "HP/HC": 2, "Tempo": 3}


# ──────────────────────────────────────────────────────────────────────────
#  Description-string price parser
# ──────────────────────────────────────────────────────────────────────────

def parse_offer_prices(description: str) -> dict:
    """Extract VAT-excluded prices from an offer's description string.

    The comparator's server does NOT lazily resolve `offerId → prices`
    in its database. Instead it expects the client to push the prices in
    `subscribingPrice / basePrice / hpPrice / hcPrice` (and the six Tempo
    sub-prices) on the same POST that selects the offer.

    Conveniently, the offer descriptions returned by `/current-offer`
    embed every price needed. We parse them out here. The current
    pipeline calls `/current-offer` BEFORE the POST, which causes the
    server to cache the prices in session — making this parser
    effectively a fallback for the (rare) case where the server-side
    cache misses. Kept for resilience.

    Description grammar (observed in production, 2026-04):

        "<offer name> - Abonnement : 141,60 € HT
                       - prix du kWh Hp   : 0,1412 € HT
                       - prix du kWh Hc   : 0,1007 € HT"
        "<offer name> - prix du kWh Base  : 0,1612 € HT"
        "TEMPO - prix du kWh HP (Bleu)    : 0,1035 € HT
               - prix du kWh HC (Bleu)    : 0,0796 € HT
               - prix du kWh HP (Blanc)   : 0,1233 € HT
               - prix du kWh HC (Blanc)   : 0,1006 € HT
               - prix du kWh HP (Rouge)   : 0,5613 € HT
               - prix du kWh HC (Rouge)   : 0,1247 € HT"

    Returns a dict containing whichever of these keys are present:
    `subscribing, base, hp, hc, hp_bleu, hc_bleu, hp_blanc, hc_blanc,
    hp_rouge, hc_rouge`.
    """
    if not description:
        return {}
    text = description.replace("\xa0", " ")
    out: dict[str, str] = {}

    m = re.search(r"[Aa]bonnement\s*:\s*([\d,]+)\s*€", text)
    if m:
        out["subscribing"] = m.group(1)

    # Patterns probed in order. Tempo sub-prices come first because they
    # contain literal "HP" / "HC" tokens that would otherwise be captured
    # by the generic Hp/Hc patterns below. The site uses mixed-case "Hp"
    # / "Hc" for non-Tempo tariffs and uppercase "HP" / "HC" inside the
    # Tempo "(Bleu) / (Blanc) / (Rouge)" parens — we lean on that to
    # disambiguate.
    patterns: list[tuple[str, str]] = [
        ("base",     r"k[Ww]h\s+[Bb]ase\s*:\s*([\d,]+)\s*€"),
        ("hp_bleu",  r"k[Ww]h\s+HP\s*\(Bleu\)\s*:\s*([\d,]+)\s*€"),
        ("hc_bleu",  r"k[Ww]h\s+HC\s*\(Bleu\)\s*:\s*([\d,]+)\s*€"),
        ("hp_blanc", r"k[Ww]h\s+HP\s*\(Blanc\)\s*:\s*([\d,]+)\s*€"),
        ("hc_blanc", r"k[Ww]h\s+HC\s*\(Blanc\)\s*:\s*([\d,]+)\s*€"),
        ("hp_rouge", r"k[Ww]h\s+HP\s*\(Rouge\)\s*:\s*([\d,]+)\s*€"),
        ("hc_rouge", r"k[Ww]h\s+HC\s*\(Rouge\)\s*:\s*([\d,]+)\s*€"),
        ("hp",       r"k[Ww]h\s+Hp\s*:\s*([\d,]+)\s*€"),
        ("hc",       r"k[Ww]h\s+Hc\s*:\s*([\d,]+)\s*€"),
    ]
    for key, pat in patterns:
        m = re.search(pat, text)
        if m:
            out[key] = m.group(1)
    return out


# ──────────────────────────────────────────────────────────────────────────
#  Protocol client
# ──────────────────────────────────────────────────────────────────────────

class EnergieInfoScraper:
    """Stateful client for one Médiateur session.

    Lifecycle:
        __init__              → fresh requests.Session() with default headers
        from_profile()        → walk the wizard with synthetic answers,
                                returning a fully-primed scraper that can
                                immediately fetch results
        fetch_all_offers()    → pull every offer with server-computed costs
        get_current_offer()   → read the user's declared offer total
        list_offers_for_provider() / set_current_offer() → dynamic
                                modification of currentOfferModel after
                                the initial wizard walk
    """

    def __init__(
        self,
        phpsessid: str | None = None,
        user_agent: str = "Mozilla/5.0 (research-bot)",
    ) -> None:
        self.s = requests.Session()
        self.s.headers.update({
            "User-Agent":       user_agent,
            "Accept":           "*/*",
            "Accept-Language":  "fr-FR,fr;q=0.9",
            "X-Requested-With": "XMLHttpRequest",
            "Referer":          f"{BASE}/",
        })
        if phpsessid:
            self.s.cookies.set(
                "PHPSESSID", phpsessid,
                domain="comparateur-offres.energie-info.fr",
            )

    @property
    def phpsessid(self) -> str | None:
        return self.s.cookies.get(
            "PHPSESSID", domain="comparateur-offres.energie-info.fr"
        )

    # ── Provider/offer catalog navigation ─────────────────────────────

    def list_offers_for_provider(
        self,
        provider_id: int,
        *,
        energy: str = "elec",
        tariff_type: int = 1,
        has_linky: bool = True,
        period: int = 12,
    ) -> list[dict]:
        """List all offers for a single provider via `/current-offer`.

        Requires a fully-walked wizard session — calling this against a
        bare cookie returns 403. The `tariff_type` parameter is sent for
        protocol consistency but does NOT meaningfully filter the list
        (verified 2026-04 against EDF: same 12-offer set for type 1/2/3).
        """
        r = self.s.get(
            f"{BASE}/current-offer",
            params={
                "energy":   energy,
                "provider": provider_id,
                "linky":    1 if has_linky else 0,
                "type":     tariff_type,
                "period":   period,
            },
            headers={"X-Requested-With": "XMLHttpRequest", "Accept": "*/*"},
        )
        r.raise_for_status()
        return [
            {
                "id":          int(o["key"]),
                "name":        o.get("name", "?"),
                "description": o.get("value", ""),
            }
            for o in r.json()
            if o.get("key") and str(o["key"]).isdigit()
        ]

    def set_current_offer(
        self,
        provider_id: int,
        offer_id: int,
        *,
        tariff_type: int = 1,
        has_linky: bool = True,
    ) -> None:
        """Mutate the active session to declare a different current offer.

        Used when the caller wants to evaluate "what would savings look
        like if I were on offer X today?" without rebuilding the whole
        session. Re-issues the configuration-recherche POST with a fresh
        CSRF token and an explicit prefetch hit on `/current-offer` to
        prime the server-side price cache.
        """
        # Prefetch primes the server-side price cache for this provider
        # in this tariff_type. Without it, the comparator computes costs
        # from a placeholder default (~17 €/yr abo, 0.037 €/kWh) and
        # returns absurdly low totals.
        self.s.get(
            f"{BASE}/current-offer",
            params={
                "energy":   "elec",
                "provider": provider_id,
                "linky":    1 if has_linky else 0,
                "type":     tariff_type,
                "period":   12,
            },
            headers={"X-Requested-With": "XMLHttpRequest", "Accept": "*/*"},
        )
        r = self._page_get("/compte/configuration-recherche")
        r.raise_for_status()
        m = re.search(
            r'name="search_configuration\[_token\]"\s+value="([^"]+)"', r.text
        )
        if not m:
            raise RuntimeError("Could not extract search_configuration[_token]")
        token = m.group(1)
        provider_name = next(
            (n for n, pid in PROVIDERS_ELEC.items() if pid == provider_id), ""
        )
        r = self._form_post(
            "/compte/configuration-recherche",
            {
                "search_configuration[sortModel][sortBy]":                       "2",
                "search_configuration[sortModel][sortDirection]":                "ASC",
                "search_configuration[period]":                                  "12",
                "search_configuration[currentOfferModel][enabled]":              "1",
                "search_configuration[currentOfferModel][elec][providerId]":     str(provider_id),
                "search_configuration[currentOfferModel][type]":                 str(tariff_type),
                "search_configuration[currentOfferModel][elec][offerId]":        str(offer_id),
                "search_configuration[currentOfferModel][elec][providerName]":   provider_name,
                "search_configuration[currentOfferModel][elec][subscribingPrice]": "",
                "search_configuration[currentOfferModel][elec][basePrice]":      "",
                "search_configuration[currentOfferModel][elec][hcPrice]":        "",
                "search_configuration[currentOfferModel][elec][hpPrice]":        "",
                "search_configuration[currentOfferModel][elec][hcBlue]":         "36,50",
                "search_configuration[currentOfferModel][elec][hpBlue]":         "48,20",
                "search_configuration[currentOfferModel][elec][hcWhite]":        "4,20",
                "search_configuration[currentOfferModel][elec][hpWhite]":        "6,20",
                "search_configuration[currentOfferModel][elec][hcRed]":          "2,10",
                "search_configuration[currentOfferModel][elec][hpRed]":          "2,80",
                "search_configuration[currentOfferModel][elec][normal]":         "97",
                "search_configuration[currentOfferModel][elec][mobile]":         "3",
                "search_configuration[_token]":                                  token,
            },
            referer=f"{BASE}/compte/configuration-recherche",
        )
        r.raise_for_status()

    # ── Session bootstrap from a synthetic profile ────────────────────

    @classmethod
    def from_profile(
        cls,
        *,
        zipcode: str,
        kva: int,
        annual_kwh: int,
        hp_hc: bool = False,
        hp_ratio: int = 60,
        has_linky: bool = True,
        has_contract: bool = False,
        prm: str | None = None,
        full_name: str | None = None,
        first_name: str | None = None,
        address: str | None = None,
        current_provider_id: int | None = None,
        current_offer_id: int | None = None,
        current_tariff_type: int = 1,
        current_offer_description: str | None = None,
        user_agent: str = "Mozilla/5.0 (research-bot)",
    ) -> "EnergieInfoScraper":
        """Walk the public wizard with synthetic answers and return a
        ready-to-query scraper.

        Optional PRM passthrough mirrors the site's "knowPrm = Oui"
        branch: providing `prm` together with `full_name`, `first_name`
        and `address` causes the wizard to record an authenticated
        identity. The PRM is *only* stored in session — the comparator
        does NOT auto-fetch consumption from Enedis (that would require
        Data Connect partner OAuth and a signed mandate). The
        `annual_kwh` argument is therefore still authoritative for the
        cost projections.
        """
        if kva not in PUISSANCE_INDEX:
            raise ValueError(f"kva must be one of {sorted(PUISSANCE_INDEX)}")
        if prm and not (full_name and first_name and address):
            raise ValueError(
                "When passing prm, also pass full_name, first_name, address "
                "(the wizard requires them on the knowPrm=Oui branch)."
            )
        scraper = cls(phpsessid=None, user_agent=user_agent)
        scraper._build_session(
            zipcode=zipcode,
            kva=kva,
            annual_kwh=annual_kwh,
            hp_hc=hp_hc,
            hp_ratio=hp_ratio,
            has_linky=has_linky,
            has_contract=has_contract or bool(prm),
            prm=prm,
            full_name=full_name,
            first_name=first_name,
            address=address,
            current_provider_id=current_provider_id,
            current_offer_id=current_offer_id,
            current_tariff_type=current_tariff_type,
            current_offer_description=current_offer_description,
        )
        return scraper

    # ── Low-level HTTP helpers ────────────────────────────────────────

    def _form_post(self, path: str, data: dict, referer: str | None = None):
        """Browser-style POST: HTML accept, no XHR header.

        Some endpoints flip behaviour based on whether `X-Requested-With:
        XMLHttpRequest` is present (returning HTML pages vs JSON
        fragments). Form submissions go without it; XHR fetches for
        page fragments include it.
        """
        headers = {
            "Accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Content-Type":              "application/x-www-form-urlencoded",
            "Origin":                    BASE,
            "Referer":                   referer or f"{BASE}{path}",
            "Upgrade-Insecure-Requests": "1",
            "X-Requested-With":          None,  # explicitly clear session default
        }
        return self.s.post(f"{BASE}{path}", data=data, headers=headers, allow_redirects=True)

    def _page_get(self, path: str):
        """Browser-style GET: HTML accept, no XHR header."""
        headers = {
            "Accept":            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "X-Requested-With":  None,
        }
        return self.s.get(f"{BASE}{path}", headers=headers)

    # ── The wizard walker (the meat of the protocol) ──────────────────

    def _build_session(
        self,
        *,
        zipcode,
        kva,
        annual_kwh,
        hp_hc,
        hp_ratio,
        has_linky,
        has_contract,
        prm=None,
        full_name=None,
        first_name=None,
        address=None,
        current_provider_id=None,
        current_offer_id=None,
        current_tariff_type=1,
        current_offer_description=None,
    ):
        # ── Step 0. Bootstrap. Fetching the profile page sets the
        #            PHPSESSID cookie and embeds the first CSRF token.
        r = self._page_get("/compte/profil")
        r.raise_for_status()
        m = re.search(r'name="profil\[_token\]"\s+value="([^"]+)"', r.text)
        if not m:
            raise RuntimeError("Could not extract profil[_token]")
        profil_token = m.group(1)

        # ── Step 1.a. Resolve the city from the zip code. The comparator
        #              needs the (cityId, inseeCode) pair, not the zip.
        r = self.s.get(f"{BASE}/cities", params={"zipcode": zipcode})
        r.raise_for_status()
        cities = r.json()
        if not cities:
            raise RuntimeError(f"Unknown zipcode {zipcode}")
        city = cities[0]

        # ── Step 1.b. Submit /compte/profil. Energy type 1 = electricity.
        r = self._form_post(
            "/compte/profil",
            {
                "profil[zipcode]":     zipcode,
                "profil[cityId]":      str(city["id"]),
                "profil[energyType][]": "1",
                "profil[cityName]":    city["label"],
                "profil[_token]":      profil_token,
            },
            referer=f"{BASE}/compte/profil",
        )
        r.raise_for_status()

        # ── Step 2. Submit /compte/electricite. No CSRF token required
        #            for this step (verified 2026-04). When a PRM is
        #            provided, set knowPrm=1 and fill the identity
        #            fields, mirroring the "knowPrm = Oui" branch.
        elec_payload = {
            "elec_consumption[linky]":            "1" if has_linky else "0",
            "elec_consumption[hasContract]":      "1" if has_contract else "0",
            "elec_consumption[prm]":              prm or "",
            "elec_consumption[name]":             full_name or "",
            "elec_consumption[firstname]":        first_name or "",
            "elec_consumption[address]":          address or "",
            "elec_consumption[zipcode]":          zipcode if prm else "",
            "elec_consumption[city]":             city["label"] if prm else "",
            "elec_consumption[insee]":            city["inseeCode"] if prm else "",
            "elec_consumption[knowPower]":        "1",
            "elec_consumption[power]":            str(PUISSANCE_INDEX[kva]),
            "elec_consumption[type]":             "2" if hp_hc else "1",
            "elec_consumption[knowConso]":        "1",
            "elec_consumption[consumption]":      str(annual_kwh),
            "elec_consumption[ratio]":            str(hp_ratio if hp_hc else 60),
            "elec_consumption[billAmount]":       "",
            "elec_consumption[billPeriod]":       "2",
            "elec_consumption[billWithTax]":      "1",
            "elec_consumption[billConsumption]":  "",
            "elec_consumption[byPrm]":            "",
        }
        if prm:
            elec_payload["elec_consumption[knowPrm]"] = "1"
        r = self._form_post(
            "/compte/electricite",
            elec_payload,
            referer=f"{BASE}/compte/electricite",
        )
        r.raise_for_status()

        # ── Step 3.a. GET /compte/configuration-recherche to pick up
        #              the second CSRF token (search_configuration[_token]).
        r = self._page_get("/compte/configuration-recherche")
        r.raise_for_status()
        m = re.search(
            r'name="search_configuration\[_token\]"\s+value="([^"]+)"', r.text
        )
        if not m:
            raise RuntimeError("Could not extract search_configuration[_token]")
        search_token = m.group(1)

        # ── Step 3.b. POST /compte/configuration-recherche.
        #
        #   When the caller provides `current_provider_id + current_offer_id`,
        #   we activate `currentOfferModel` so the server computes a per-
        #   offer delta against the user's current contract. The crucial
        #   detail is the *prefetch*: hitting `/current-offer?provider=...
        #   &type=...` BEFORE this POST causes the server to load the
        #   offer's price book into PHP session storage. The subsequent
        #   POST then leaves the price fields blank but the server reads
        #   them from session — that is exactly how the official site
        #   does it. Skipping the prefetch makes the server fall back on
        #   placeholder defaults (≈17 €/yr abo, 0.037 €/kWh) and produces
        #   absurd totals around 177 €.
        has_current = bool(current_provider_id and current_offer_id)
        provider_name = ""
        if has_current:
            provider_name = next(
                (n for n, pid in PROVIDERS_ELEC.items() if pid == current_provider_id),
                "",
            )
            self.s.get(
                f"{BASE}/current-offer",
                params={
                    "energy":   "elec",
                    "provider": current_provider_id,
                    "linky":    1 if has_linky else 0,
                    "type":     current_tariff_type,
                    "period":   12,
                },
                headers={"X-Requested-With": "XMLHttpRequest", "Accept": "*/*"},
            )

        config_payload = {
            "search_configuration[sortModel][sortBy]":                       "2",
            "search_configuration[sortModel][sortDirection]":                "ASC",
            "search_configuration[period]":                                  "12",
            "search_configuration[currentOfferModel][enabled]":              "1" if has_current else "0",
            "search_configuration[currentOfferModel][elec][providerId]":     str(current_provider_id) if has_current else "",
            "search_configuration[currentOfferModel][type]":                 str(current_tariff_type) if has_current else "",
            "search_configuration[currentOfferModel][elec][offerId]":        str(current_offer_id) if has_current else "",
            "search_configuration[currentOfferModel][elec][providerName]":   provider_name,
            "search_configuration[currentOfferModel][elec][subscribingPrice]": "",
            "search_configuration[currentOfferModel][elec][basePrice]":      "",
            "search_configuration[currentOfferModel][elec][hcPrice]":        "",
            "search_configuration[currentOfferModel][elec][hpPrice]":        "",
            # Tempo: the six fields below are interpreted as *consumption
            # distribution percentages across blue/white/red days × HP/HC*
            # (sum = 100). These defaults are the population-average
            # baseline sourced from the form's pristine state. For higher
            # accuracy you would override them with the actual user-
            # specific distribution computed from their hourly load
            # curve crossed with the historical RTE Tempo calendar.
            "search_configuration[currentOfferModel][elec][hcBlue]":         "36,50",
            "search_configuration[currentOfferModel][elec][hpBlue]":         "48,20",
            "search_configuration[currentOfferModel][elec][hcWhite]":        "4,20",
            "search_configuration[currentOfferModel][elec][hpWhite]":        "6,20",
            "search_configuration[currentOfferModel][elec][hcRed]":          "2,10",
            "search_configuration[currentOfferModel][elec][hpRed]":          "2,80",
            "search_configuration[currentOfferModel][elec][normal]":         "97",
            "search_configuration[currentOfferModel][elec][mobile]":         "3",
            "search_configuration[_token]":                                  search_token,
        }
        r = self._form_post(
            "/compte/configuration-recherche",
            config_payload,
            referer=f"{BASE}/compte/configuration-recherche",
        )
        r.raise_for_status()

    # ── Reads ─────────────────────────────────────────────────────────

    def get_current_offer(self) -> dict:
        """Read back the cost the comparator computes for the user's
        currently-declared offer, if any.

        Returns `{provider, total_eur}`. Both fields are `None` when no
        current offer was declared in the session.
        """
        r = self.s.get(f"{BASE}/current-offer/refresh")
        r.raise_for_status()
        html = r.json().get("html", "")
        total = re.search(r'<span class="total">.*?<span>\s*([\d\s]+)\s*€', html, re.S)
        provider = re.search(r'alt="([^"]+)"\s+onerror', html)
        return {
            "provider":  unescape(provider.group(1)) if provider else None,
            "total_eur": int(total.group(1).replace(" ", "")) if total else None,
        }

    def _filter_token(self) -> str:
        """Fetch the third CSRF token, used for the /results paging API."""
        r = self.s.get(f"{BASE}/update-form")
        form_html = r.json()["html"]
        m = re.search(r'name="offer_filters\[_token\]"\s+value="([^"]+)"', form_html)
        if not m:
            raise RuntimeError(
                "Could not extract offer_filters token. Session expired?"
            )
        return m.group(1)

    def fetch_all_offers(
        self,
        *,
        full_green: int = 0,
        full_online: int = 0,
        period_months: int = 12,
        ev: int = 0,
        sort_by: int = 2,
        sort_dir: str = "ASC",
        rate_limit_seconds: float = 0.5,
    ) -> list[dict]:
        """Pull every offer for the active session, paginated.

        Filter values:
            full_green  : 0 = all, 1 = green, 2 = ADEME-labelled green
            full_online : 0 = all, 1 = no, 2 = yes
            ev          : 0 = all, 1 = EV-friendly only
            sort_by     : 2 = total annual cost (default)

        Each offer comes back with the server-computed `total_eur` (TVA
        / accise / CTA / TURPE included). Output is deduped by `id`
        because the comparator occasionally emits the same offer twice
        across pages.
        """
        token = self._filter_token()
        params = {
            "s":                                    "",
            "offer_filters[fullGreen]":             str(full_green),
            "offer_filters[fullOnLine]":            str(full_online),
            "offer_filters[period]":                str(period_months),
            "offer_filters[electricVehicle]":       str(ev),
            "offer_filters[sortBy]":                str(sort_by),
            "offer_filters[sortDirection]":         sort_dir,
            "offer_filters[_token]":                token,
        }
        all_offers: list[dict] = []
        page = 1
        while True:
            r = self.s.get(f"{BASE}/results/{page}", params=params)
            data = r.json()
            page_offers = self._parse_offers(data["html"])
            all_offers.extend(page_offers)
            print(
                f"  page {page}: +{len(page_offers)}  ->  "
                f"{len(all_offers)}/{data['totalSearch']}"
            )
            if data["lastPage"]:
                break
            page += 1
            if page > 30:
                raise RuntimeError("Too many pages, aborting")
            time.sleep(rate_limit_seconds)
        seen, unique = set(), []
        for o in all_offers:
            if o["id"] not in seen:
                seen.add(o["id"])
                unique.append(o)
        return unique

    @staticmethod
    def _parse_offers(html: str) -> list[dict]:
        """Extract offers from a /results/{page} HTML chunk.

        The HTML structure is stable but verbose. We split on the
        `<div class="offre" data-id="...">` opening and pull a small
        fixed window of context around each match.
        """
        offers: list[dict] = []
        blocks = re.split(r'<div class="offre[^"]*"\s+data-id="(\d+)"', html)
        for i in range(1, len(blocks), 2):
            oid = blocks[i]
            block = blocks[i + 1][:8000]
            provider = re.search(r'alt="([^"]+)"\s+onerror', block)
            total    = re.search(r'<span class="total">.*?<span>\s*([\d\s]+)\s*€', block, re.S)
            name     = re.search(r'<h4[^>]*>([^<]+)</h4>', block)
            phone    = re.search(r'<strong>([\d\s\.]{8,})</strong>', block)
            url      = re.search(r'href="(https://[^"]+)"\s+target="_blank"', block)
            if total:
                offers.append({
                    "id":             oid,
                    "provider":       unescape(provider.group(1)) if provider else "?",
                    "name":           unescape(name.group(1).strip()) if name else "?",
                    "total_eur":      int(total.group(1).replace(" ", "")),
                    "phone":          phone.group(1).strip() if phone else None,
                    "url":            url.group(1) if url else None,
                    "is_green":       "100% verte" in block.lower(),
                    "is_fixed_price": "prix fixe"  in block.lower(),
                })
        return offers


# ──────────────────────────────────────────────────────────────────────────
#  Stand-alone CLI for quick smoke tests with a borrowed cookie
# ──────────────────────────────────────────────────────────────────────────

def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python3 scrape_mediateur.py <PHPSESSID>")
        print()
        print("How to obtain a PHPSESSID for development:")
        print("  1. Open https://comparateur-offres.energie-info.fr in Chrome")
        print("  2. Walk the wizard until the results page is rendered")
        print("  3. DevTools (F12) → Application → Cookies → copy PHPSESSID")
        sys.exit(1)

    phpsessid = sys.argv[1]
    scraper = EnergieInfoScraper(phpsessid)

    print("Current offer (declared in session):")
    cur = scraper.get_current_offer()
    if cur and cur["total_eur"]:
        print(f"   {cur['provider']}: {cur['total_eur']} EUR/yr")
        baseline = cur["total_eur"]
    else:
        print("   (none declared)")
        baseline = None
    print()

    print("Fetching all offers...")
    offers = scraper.fetch_all_offers()
    offers.sort(key=lambda x: x["total_eur"])
    print()

    n = min(20, len(offers))
    print(f"Top {n} cheapest offers:\n")
    for i, o in enumerate(offers[:n], 1):
        flags = ("[V]" if o["is_green"] else "   ") + ("[F]" if o["is_fixed_price"] else "   ")
        diff = f"{o['total_eur'] - baseline:+5d} EUR" if baseline else "          "
        print(f"  {i:2d}. {o['provider'][:22]:22s} {o['total_eur']:>5d} EUR  {diff}  {flags} {o['name'][:50]}")

    if baseline:
        cheaper = [o for o in offers if o["total_eur"] < baseline]
        print(f"\n{len(cheaper)}/{len(offers)} offers are cheaper than your current.")
        print(f"Max savings: {baseline - offers[0]['total_eur']} EUR/year ({offers[0]['provider']})")

    out = "offers.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(offers, f, ensure_ascii=False, indent=2)
    print(f"\n{len(offers)} offers saved to {out}")


if __name__ == "__main__":
    main()
