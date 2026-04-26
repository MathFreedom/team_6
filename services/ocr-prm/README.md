# PRM OCR Service

Extracts the 14-digit PRM (Point de Référence Mesure) from a photo of a Linky meter screen or an electricity bill. Stateless FastAPI service designed to live behind Google Cloud Run and be called directly by the mobile client.

## Endpoint

```
POST /extract-prm
Content-Type: multipart/form-data
field: image  (jpeg/png/heic, < 8 MB)

200 → { "prm": "07386541234022", "confidence": 0.95, "raw_text": "…" }
413 → image too large
415 → not an image
422 → no PRM detected with sufficient confidence
500 → unexpected error
502 → upstream OCR provider unreachable
```

A health probe is exposed at `GET /health`.

## Local dev

```bash
cd services/ocr-prm
cp .env.example .env  # fill in ANTHROPIC_API_KEY
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8081
```

Smoke test:

```bash
curl -X POST http://localhost:8081/extract-prm \
  -F "image=@./fixtures/sample-bill.jpg"
```

## Deploy on Cloud Run

```bash
gcloud run deploy ocr-prm \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-secrets=ANTHROPIC_API_KEY=anthropic-api-key:latest \
  --set-env-vars=OCR_PROVIDER=anthropic
```

Once deployed, plug the URL into the Next.js proxy at `src/app/api/ocr-prm/route.ts` (TODO).

## Implementation notes

- Default provider is **Anthropic Claude Sonnet 4.5 vision** (~$0.003/image, ~1.5s latency, robust to angle/glare). Swap by setting `OCR_PROVIDER=tesseract` or `google_vision` and implementing the corresponding branch in [`extractor._call_ocr_provider`](extractor.py).
- The extractor prefers a **labeled match** (`N° PRM 12345…`) over a bare 14-digit sequence, because bills contain unrelated 14-digit numbers (contract refs, invoice numbers).
- Confidence is currently a fixed `0.9` for the LLM provider; can be tuned per provider once we have ground-truth data.

## Front-end integration

Mobile client uploads the photo → frontend proxies to `/api/ocr-prm` (Next.js, contourne CORS) → that proxy forwards to this Cloud Run service. The proxy is at `src/app/api/ocr-prm/route.ts` (TODO once URL is known).

Once the PRM is extracted, the front-end stores it in `useJourneyStore.pendingPrm` and triggers `/analyzing`, which calls the Energy Optimizer service with that PRM.
