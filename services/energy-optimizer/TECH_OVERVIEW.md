# Energy Optimizer — Descriptif technique

## En 3 lignes

Backend stateless qui, à partir d'un PRM Linky, retourne le classement des
offres d'électricité du marché français triées par économie annuelle vs le
contrat actuel de l'utilisateur. Empreinte de consommation horaire récupérée
via Linky, projection de coûts via le comparateur officiel du Médiateur
national de l'énergie (validée à <1 % du site public), narration finale
synthétisée par Claude Sonnet. Cible : appli mobile B2C qui veut donner à
l'utilisateur un chiffre concret d'économie sans aucun input technique.

---

## Pipeline d'une requête

```
                                 POST /recommend
                                 { prm, zipcode }
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  Stage 1 — Linky fingerprint              [enedis_gateway]  ~3 s │
│  conso.boris.sh × 2 calls (daily 365 d, load curve 7 d)          │
│   ↓                                                              │
│  LinkyProfile {                                                  │
│    annual_kwh, daily_avg_kwh, peak_power_w,                      │
│    hourly_profile_kwh[24], weekend_share,                        │
│    hc_share_per_window (5 plages testées),                       │
│    best_hc_window, best_hc_share                                 │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  Stage 2 — Catalog cost projection      [scrape_mediateur]  ~6 s │
│  Walk wizard 4 steps + paginate /results (78 offres)             │
│   • profil → electricite → configuration-recherche → results     │
│   • prefetch /current-offer pour primer la session si baseline   │
│  Output : { offers[78], current_offer | null }                   │
└──────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  Stage 3 — Pattern-aware scoring + LLM advisor   [recommender +  │
│  agent (CrewAI / Sonnet)]                                  ~5 s  │
│   • score = 0.7 × prix + 0.3 × adéquation                        │
│   • adéquation : règles déterministes par famille tarifaire      │
│   • narration : Claude Sonnet, 50-80 mots, fallback déterministe │
│ Sort par savings_eur DESC (ASC sur prix si pas de baseline)      │
└──────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                  JSON { current, ranked[78], profile_summary, narrative }
                                  Total ≈ 14 s P95
                                  Cold start +5 s (Cloud Run idle 15 min)
```

---

## Architecture modulaire

5 fichiers Python, ~1500 lignes, zéro dépendance circulaire.

| Module | Responsabilité unique | LOC |
|---|---|---|
| `app.py` | Couche HTTP FastAPI. Validation Pydantic, mapping exception→HTTP, schémas request/response. | 130 |
| `agent.py` | Orchestrateur du pipeline. Décide hp_ratio + hp_hc_mode depuis le profil, branche le LLM ou le fallback déterministe. Point d'entrée unique : `recommend(prm, zipcode, ...)`. | 270 |
| `enedis_gateway.py` | Client conso.boris.sh + extraction du `LinkyProfile`. Inclut `infer_kva_from_peak_power()` (mapping calibré sur le grid Enedis). | 290 |
| `scrape_mediateur.py` | Protocol client pour le comparateur Médiateur. Walk du wizard 4 étapes, gestion CSRF, paging résultats, prefetch /current-offer. | 530 |
| `recommender.py` | Scoring déterministe prix+adéquation par famille tarifaire (Base/HP-HC/Tempo/weekend/EJP/dynamic). | 220 |

Chaque module a un docstring d'en-tête expliquant son rôle, ses sources et
ses pièges. Couplage entre modules : pur appel de fonction, pas d'état
partagé.

---

## Sources externes

### conso.boris.sh — gateway Linky communautaire

| | |
|---|---|
| **Rôle** | Récupération de la conso (daily + load curve) |
| **Protocole** | REST + Bearer token |
| **Auth** | Token personnel obtenu après consentement OAuth Enedis Data Connect |
| **Rate limits** | 5 req/s, 10 000 req/h (partagés entre tous les users de la gateway) |
| **Fraîcheur** | J+1 (~08 h le lendemain) |
| **Caps** | `consumption_load_curve` plafonné à 7 jours/appel → on chunke |
| **Légal** | OK pour usage perso. Une vraie app multi-tenant doit faire son propre partenariat Enedis Data Connect (4-8 semaines homologation). |

### Médiateur national de l'énergie — comparateur officiel

| | |
|---|---|
| **Rôle** | Catalogue des offres + projection de coût annuel TTC (TVA, accise, CTA, TURPE inclus) |
| **Protocole** | Pas d'API publique. Reverse-engineered via Chrome DevTools : 4 étapes du wizard avec sessions PHP, 3 tokens CSRF, paging XHR. |
| **Pourquoi cette source** | Tous les fournisseurs d'électricité en France sont **légalement tenus** d'y maintenir leurs offres à jour. C'est de fait l'autorité unique sur les prix retail. |
| **Précision** | Calcul serveur, 0-0,5 % d'écart vs site public (mesuré). |
| **Légal** | Service public d'une autorité indépendante. Usage perso/recherche : OK avec rate limit (1 req/sec). Usage commercial : `contact@energie-mediateur.fr`. |

### Anthropic Claude Sonnet — advisor LLM (via CrewAI)

| | |
|---|---|
| **Rôle** | Synthèse en 50-80 mots français de la recommandation. Borné strictement à la narration. |
| **Modèle** | `anthropic/claude-sonnet-4-5-20250929` |
| **Orchestrateur** | CrewAI (1 agent, 1 task, sequential process) |
| **Coût** | ~30 k tokens / requête × ~0,003 $/k input + 0,015 $/k output ≈ 0,005 $/req |
| **Fallback** | Si `ANTHROPIC_API_KEY` absent ou erreur → narration templatée déterministe. La requête ne plante jamais sur un hiccup LLM. |

---

## Stack

| Couche | Choix | Justification courte |
|---|---|---|
| Runtime | Python 3.12-slim (Docker) | Stabilité libs LLM/scientifiques, base image GCR-friendly. |
| Framework HTTP | FastAPI | Pydantic native, Swagger auto sur `/docs`, async-ready si besoin. |
| Validation | Pydantic v2 | Rejet 422 propre des PRM mal formés, schemas typés en dur dans la response. |
| Agent LLM | CrewAI 1.x | Standard agentique. Permet d'élargir vers tool-use multi-step plus tard sans changer le call site. |
| Client SDK Anthropic | `anthropic` 0.97+ | Provider natif CrewAI > 1.0. |
| HTTP client | `requests` (sync) | Le pipeline est sync de bout en bout (3 stages bloquants), async n'apporte rien tant qu'on ne pipeline pas. |
| Server | uvicorn standard | Workers gérés par Cloud Run au niveau replica. |
| Secrets | GCP Secret Manager | Token Linky + clé Anthropic injectés via `--set-secrets`, jamais dans l'image. |

---

## Décisions d'architecture clés

### 1. LLM borné, calculs déterministes

Le LLM est **uniquement** utilisé pour la narration finale (50-80 mots). Tous les chiffres (coûts, économies, scores, ratios) sont calculés par du Python pur. Conséquences :

- Réponse toujours JSON-shaped et numériquement reproductible.
- Coût LLM stable (~0,005 $/req).
- Fallback gracieux : la requête réussit même sans clé Anthropic, juste avec une narration plus sèche.

### 2. Prefetch `/current-offer` pour primer la session Médiateur

Le bug de calcul le plus subtil découvert pendant le reverse-engineering :
quand l'utilisateur déclare une offre actuelle (`currentOfferModel.enabled=1`),
le serveur Médiateur ne résout PAS `offerId → prix` côté DB. Il lit les prix
qu'il a en session. Si on POST sans avoir préalablement appelé
`/current-offer?provider=N&type=T`, le serveur fallback sur des prix
placeholder (~17 €/an d'abo, 0,037 €/kWh) → total absurde de 177 €.

**Fix** : un GET `/current-offer` AVANT le POST, et le serveur charge les
vrais prix dans le PHPSESSID. C'est exactement comme ça que le site officiel
le fait (visible dans nos captures DevTools). Documenté en commentaire dans
`scrape_mediateur._build_session()`.

### 3. Test de 5 plages HC pour identifier celle qui colle au user

Les plages HC ne sont pas standardisées en France. Il y en a 5 canoniques :
22h-6h, 22h30-6h30, 23h-7h, 00h-8h, et la "Méridienne" 13h-15h + 2h-7h. Selon
la zone Enedis et la date d'activation du compteur, l'utilisateur a une plage
différente. Le comparateur Médiateur prend un seul `hp_ratio` générique, qui
donne typiquement 30-80 €/an d'erreur sur les offres HP/HC.

**Approche** : on calcule `hc_share_per_window` pour les 5 plages standard à
partir de la load curve, on garde la meilleure. Le `hp_ratio` envoyé au
Médiateur est dérivé de cette plage maximale, pas d'un défaut générique.

### 4. Inférence kVA depuis le pic instantané

Le PRM ne donne pas la puissance souscrite (info contractuelle non exposée
par les APIs Linky communautaires). On l'infère du `peak_power_w` mesuré sur
la load curve, via le grid calibré Enedis (3, 6, 9, 12, 15, 18, 24, 30, 36
kVA). Borne inférieure mais correcte dans 90 %+ des cas. Fallback à 6 kVA
(tier modal résidentiel français) si valeur hors-bande. Implémenté dans
`enedis_gateway.infer_kva_from_peak_power()`.

---

## Précision validée

Mesuré sur 6 offres EDF distinctes, 4287 kWh/an, 6 kVA, HP=60 % :

| Offre | Type | Calculé backend | Référence site officiel | Écart |
|---|---|---:|---:|---:|
| Tarif Bleu Base | Base | 1 019 € | 1 024 € | **0,5 %** |
| Tarif Bleu HP/HC | HP/HC | 990 € | 990 € | **0,0 %** |
| Zen Fixe HP/HC | HP/HC | 889 € | 889 € | **0,0 %** |
| Zen Online HP/HC | HP/HC | 960 € | 960 € | **0,0 %** |
| Vert Électrique HP/HC | HP/HC | 994 € | 994 € | **0,0 %** |
| EDF Tempo | Tempo | 885 € | 885 € | **0,0 %** |

5 sur 6 à 0,0 %, 1 à 0,5 %. La précision est intrinsèquement celle du
serveur Médiateur — on n'introduit aucune approximation supplémentaire.

---

## Latence et coûts

### Latence par stage

| Stage | Temps typique | Note |
|---|---:|---|
| Linky fingerprint | ~3 s | 2 appels conso.boris.sh |
| Catalog projection | ~6 s | 4 POST wizard + 6 GET pages, rate-limit 0,3 s |
| Scoring + narration LLM | ~5 s | Sonnet 50-80 mots |
| **Total P95** | **~14 s** | sans cold start |
| Cold start Cloud Run | +5 s | imports CrewAI, première requête après >15 min idle |

### Coût mensuel (estimation 50 req/jour ≈ 1 500 req/mois)

| Poste | Coût | Note |
|---|---:|---|
| Cloud Run | 0 € | Free tier 2 M req/mois, scale-to-zero |
| Cloud Build | 0 € | Free tier 120 min/jour |
| Artifact Registry | ~0,03 €/mois | Image ~800 MB après free tier |
| Secret Manager | 0 € | 6 secrets actifs gratuits |
| Anthropic Sonnet | ~5 €/mois | ~30 k tokens × 1 500 req |
| **Total** | **~5 €/mois** | quasi-entièrement Anthropic |

---

## Déploiement

Source-based deploy via Cloud Run. Le `Dockerfile` builde Python 3.12-slim →
uvicorn sur `$PORT` injecté par Cloud Run. Les secrets Linky/Anthropic sont
montés par `--set-secrets` depuis Secret Manager, jamais dans l'image.

```bash
gcloud run deploy energy-optimizer \
  --source . --region europe-west1 \
  --memory 1Gi --cpu 1 --timeout 60 \
  --concurrency 10 --max-instances 10 \
  --set-secrets CONSO_BORIS_TOKEN=conso-boris-token:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest
```

Détails complets dans [README.md](README.md).

URL prod actuelle : `https://energy-optimizer-32292404002.europe-west1.run.app`.

---

## Limites V1 connues

- **Token Enedis mono-tenant** : un seul Bearer token partagé pour tous les
  PRMs. Démo et MVP perso uniquement. Pour multi-user il faut le flow OAuth
  Enedis Data Connect côté app mobile (4-8 semaines d'homologation
  partenaire), avec stockage par-utilisateur des tokens.
- **Fournisseur actuel demandé au user** : Enedis (DSO) ne stocke pas
  l'identité du fournisseur d'énergie. Le mobile doit donc proposer un
  dropdown des 23 fournisseurs + 78 offres listés dans `all_offers.json`.
  Pas de moyen automatisé de récupérer ça depuis le PRM.
- **Tempo générique** : on utilise les pourcentages de répartition par défaut
  (3 % rouge, etc.). Pour un user qui chauffe à l'électricité l'écart peut
  atteindre ±200 €/an vs son coût Tempo réel. Borné à ~5 % sur la moyenne.
- **Pas de cache** : chaque requête refait Linky + Médiateur from scratch
  (~9 s upstream). Linky est J+1 → un cache (prm, jour) éliminerait 3 s sur
  toute requête répétée dans la journée.
- **Cold start ~5 s** : CrewAI + Anthropic ajoutent du temps d'import. Réglable
  avec `--min-instances=1` (~5 €/mois supplémentaires).

---

## Roadmap V2

- **Multi-user OAuth Enedis Data Connect** : remplace le Bearer global. Permet
  aussi d'auto-récupérer la puissance kVA souscrite (au lieu de l'inférer)
  et le type tarifaire actuel (au lieu de demander au user).
- **Simulation Tempo personnalisée** : crossreference de la load curve 30-min
  avec le calendrier RTE Tempo historique (rouges/blancs/bleus passés). Donne
  le coût Tempo réel par user, pas la moyenne — typiquement ±100-200 €/an
  vs le calcul Médiateur sur les profils chauffage électrique.
- **Cache Redis** : `LinkyProfile` keyed by (prm, today). TTL 24 h aligné sur
  la fraîcheur Linky J+1.
- **Observabilité** : OpenTelemetry → traces par stage, latence p50/p95/p99
  par upstream, taux d'échec, distribution des économies recommandées.
- **Streaming SSE** : la requête prend 14 s, l'app mobile bénéficierait d'une
  réponse incrémentale (profil d'abord, puis ranked, puis narrative).
- **OCR factures** : alternative au dropdown manuel — Mistral OCR ou Claude
  Vision sur un PDF de facture, extrait fournisseur/offre/prix
  automatiquement.
