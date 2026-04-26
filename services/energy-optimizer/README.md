# Energy Contract Optimization Service

Stateless backend that recommends the cheapest electricity contract for a
French residential consumer, ranked by **annual savings** vs the user's
current contract. Mobile clients call a single endpoint and receive a
flat list ordered from largest savings to smallest.

```
POST /recommend
{ "prm":     "07386541234022",     # required, 14 digits
  "zipcode": "75001",              # required, 5 digits
  "kva":      6,                   # optional — auto-inferred from peak draw if omitted
  "current_provider_id":  159,     # optional
  "current_offer_id":    6887,     # optional
  "current_tariff_type":    2 }    # 1=Base, 2=HP/HC, 3=Tempo
```

## Pipeline

```
PRM ──► Linky consumption fingerprint  (conso.boris.sh, ~3s)
     ──► Tariff cost projection over the full provider catalog
         (Médiateur national de l'énergie, ~6s, validated <1% error
          vs the official site)
     ──► Pattern-aware offer scorer (Base / HP-HC / Tempo / weekend)
     ──► CrewAI advisor synthesizes the narrative recommendation
     ──► JSON: {current, ranked[], profile_summary, narrative}
```

End-to-end latency: **~14 s** per request. The Linky data is J+1, so
caching profiles by `prm + day` would reduce repeat calls to ~6 s.

## Local development

```bash
cp .env.example .env
# fill in CONSO_BORIS_TOKEN and ANTHROPIC_API_KEY
pip install -r requirements.txt
uvicorn app:app --port 8080
```

```bash
curl -X POST http://localhost:8080/recommend \
  -H "Content-Type: application/json" \
  -d "{\"prm\": \"$(grep DEFAULT_PRM .env | cut -d= -f2)\", \"zipcode\": \"75001\"}" | jq
```

Swagger / ReDoc available at `/docs` and `/redoc`.

## Deployment to Google Cloud Run

```bash
# One-time setup
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>
gcloud config set run/region europe-west1

# Store secrets in Secret Manager (do this once; rotate as needed)
echo -n "$CONSO_BORIS_TOKEN" | gcloud secrets create conso-boris-token --data-file=-
echo -n "$ANTHROPIC_API_KEY" | gcloud secrets create anthropic-api-key --data-file=-

# Deploy from source. Cloud Run builds the Dockerfile and rolls out.
gcloud run deploy energy-optimizer \
  --source . \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60 \
  --concurrency 10 \
  --max-instances 10 \
  --set-secrets CONSO_BORIS_TOKEN=conso-boris-token:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest
```

The deploy command prints a URL like
`https://energy-optimizer-xxxxx-ew.a.run.app`. The mobile app calls
`POST <URL>/recommend`.

### Cold start mitigation

CrewAI imports add ~3-5 s to the first request after idle. Two options:

- **Accept it** — first call after 15 min idle is ~18 s, subsequent ~14 s.
- `--min-instances 1` — keep one container warm at all times. Adds ≈ €5/month
  but flat 14 s on every request.

## Repository layout

```
pet/
├── Dockerfile               # Cloud Run runtime image
├── app.py                   # FastAPI HTTP layer (POST /recommend)
├── agent.py                 # End-to-end optimization pipeline + CrewAI advisor
├── enedis_gateway.py        # Linky consumption fingerprint extraction
├── scrape_mediateur.py      # Reverse-engineered Médiateur protocol client
├── recommender.py           # Pattern-aware offer scoring engine
├── all_offers.json          # Snapshot catalog (78 offers × 23 providers)
├── requirements.txt
├── .env.example
└── README.md
```

## Authoritative sources

- Linky consumption — `https://conso.boris.sh` (community Enedis Data
  Connect gateway, free for personal use)
- Tariff cost projection — `https://comparateur-offres.energie-info.fr`
  (the Médiateur national de l'énergie official comparator; legally
  required to keep all retail offers in France up to date)
- LLM provider — Anthropic Claude Sonnet 4.5
