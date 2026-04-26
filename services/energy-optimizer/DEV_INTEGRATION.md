# Energy Optimizer — Intégration mobile

Backend qui recommande les meilleures offres d'électricité pour un PRM Linky.
Déjà déployé sur Cloud Run, accessible publiquement.

## URLs

| | |
|---|---|
| Endpoint | `POST https://energy-optimizer-32292404002.europe-west1.run.app/recommend` |
| Swagger  | https://energy-optimizer-32292404002.europe-west1.run.app/docs |
| Health   | https://energy-optimizer-32292404002.europe-west1.run.app/health |

## Request

```json
{
  "prm":     "07386541234022",   // REQUIRED — 14 chiffres du compteur Linky
  "zipcode": "75001",            // REQUIRED — 5 chiffres
  "kva":      6,                 // optional — auto-déduit du pic de conso si absent
  "current_provider_id":  159,   // optional — id Médiateur du fournisseur actuel (ex: 159 = EDF)
  "current_offer_id":    6887,   // optional — id de l'offre actuelle
  "current_tariff_type":    2    // optional — 1=Base, 2=HP/HC, 3=Tempo (défaut 1)
}
```

- **Strict minimum** : `{ "prm", "zipcode" }` → ranking par prix ASC, pas de calcul d'économie
- **Avec `current_provider_id` + `current_offer_id`** → ranking par économie DESC, et la baseline du contrat actuel est calculée par le serveur

## Response

```json
{
  "current": { "provider": "EDF", "annual_cost_eur": 1030 },
  "ranked": [
    {
      "provider": "Primeo Energie",
      "name": "Offre Fixe Confort+",
      "annual_cost_eur": 903,
      "savings_eur": 127,
      "is_green": false,
      "is_fixed_price": true,
      "url": "https://particuliers.primeo-energie.fr",
      "score_total": 91.0,
      "reasons": [
        "Tarif Base : structure simple, aucune contrainte horaire",
        "Bonus stabilité : prix fixé sur la durée du contrat"
      ]
    }
    // ~77 entries au total
  ],
  "profile_summary": {
    "annual_kwh": 4315,
    "daily_avg_kwh": 11.82,
    "hp_share_pct": 77,
    "best_hc_window": "Méridienne 13h-15h + 2h-7h",
    "weekend_share_pct": 31,
    "peak_power_w": 2540
  },
  "narrative": "Avec 4 315 kWh par an et seulement 23 % en heures creuses, ..."
}
```

`current` et `savings_eur` valent `null` si l'utilisateur ne déclare pas son contrat actuel.

## Exemple curl

```bash
curl -X POST https://energy-optimizer-32292404002.europe-west1.run.app/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "prm": "07386541234022",
    "zipcode": "75001",
    "current_provider_id": 159,
    "current_offer_id": 6887,
    "current_tariff_type": 2
  }'
```

## Status codes

| Code | Cause |
|------|-------|
| `200` | succès |
| `401` | token Enedis expiré côté backend (ping le mainteneur) |
| `404` | Enedis renvoie `no_data_found` — l'utilisateur n'a pas activé la collecte horaire sur https://mon-compte-particulier.enedis.fr/donnees |
| `422` | payload invalide (PRM pas 14 chiffres, zipcode manquant, etc.) |
| `502` | upstream Médiateur down |

## À savoir

- **Latence** : ~14 s par requête (cold start jusqu'à +6 s sur la 1re après idle).
  Le pipeline fait 3 appels upstream séquentiels (Linky 12 mois → catalogue Médiateur 77 offres → narration LLM Sonnet). Affiche un loader.
- **Mono-utilisateur (V1)** : le token Enedis est partagé pour l'instant. N'importe quel PRM du même compte Enedis fonctionne, pour la démo. Multi-user nécessite le flow OAuth Enedis Data Connect (4-8 semaines de homologation partenaire).
- **`provider_id` et `offer_id`** : viennent du Médiateur national de l'énergie et sont stables. Liste exhaustive (78 offres × 23 fournisseurs) côté backend si besoin d'un selector dans l'app.
- **Précision** : calculs validés <1 % d'écart vs le site officiel comparateur-offres.energie-info.fr sur Base / HP-HC / Tempo (testé sur 6 offres EDF). La baseline est calculée serveur — on hérite directement de la précision du Médiateur.
- **Pas d'auth, pas de rate limit côté mobile.** Tape directement sur l'URL.
