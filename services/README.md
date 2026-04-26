# Backend services (Cloud Run)

Each subfolder is an independent FastAPI service deployed on Google Cloud Run. They are called by the Next.js app via server-side proxies in `src/app/api/*` (which contournent CORS et abritent l'URL Cloud Run).

## Services

| Folder | Purpose | Status | Frontend proxy |
|---|---|---|---|
| [`energy-optimizer/`](./energy-optimizer/) | Ranks electricity offers by annual savings for a given PRM | Deployed (Cloud Run, europe-west1) | [`/api/recommend`](../src/app/api/recommend/route.ts) |
| [`ocr-prm/`](./ocr-prm/) | Extracts the 14-digit PRM from a photo of a Linky meter or an electricity bill | Skeleton (not deployed yet) | Pending — `/api/ocr-prm` to add |

## Conventions

- Python 3.12, FastAPI, Pydantic v2, single-worker uvicorn (Cloud Run scales by replica).
- Each service exposes a `GET /health` liveness probe and one main `POST` endpoint.
- Secrets injected via Cloud Run Secret Manager, never committed. `.env.example` documents the required variables; `.env` is gitignored.
- French status messages where they bubble up to the user; English in code/comments.

## Local dev all services

```bash
# Energy Optimizer (port 8080)
cd services/energy-optimizer && uvicorn app:app --port 8080 --reload

# PRM OCR (port 8081)
cd services/ocr-prm && uvicorn app:app --port 8081 --reload

# Next.js front-end (port 3000) — proxies hit localhost:8080 / 8081 in dev
cd ../.. && npm run dev
```

For the Next.js proxies to call local Cloud Run services in dev, set the override URLs in `.env.local` (TODO: support `*_BASE_URL` env vars in the proxy routes).
