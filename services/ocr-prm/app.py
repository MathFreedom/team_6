"""
HTTP surface for the PRM OCR Service.
=====================================

Single endpoint, stateless, multipart-in / JSON-out. Designed to live
behind Cloud Run and be called directly by the mobile client.

    POST /extract-prm
        body = multipart/form-data with field "image" (jpeg/png/heic, < 8 MB)
        -> { prm: "07386541234022", confidence: 0.95 }

The PRM is a 14-digit identifier visible:
- on the user's Linky meter screen ("N° PRM" after pressing the + button)
- on any EDF / TotalEnergies / Engie bill, top-right corner

The OCR pipeline (Vision LLM, Tesseract, or Google Cloud Vision)
lives in `extractor.extract_prm`. This module is intentionally thin.
"""
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from extractor import extract_prm, ExtractionError

app = FastAPI(
    title="PRM OCR Service",
    description=(
        "Given a photo of a Linky meter screen or an electricity bill, "
        "returns the 14-digit PRM (Point de Référence Mesure) detected "
        "in the image."
    ),
    version="0.1.0",
)


# ──────────────────────────────────────────────────────────────────────────
#  Response schemas
# ──────────────────────────────────────────────────────────────────────────

class ExtractPrmResponse(BaseModel):
    prm: str = Field(
        ...,
        min_length=14,
        max_length=14,
        description="14-digit Linky meter identifier extracted from the image.",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="OCR confidence score in [0, 1].",
    )
    raw_text: Optional[str] = Field(
        None,
        description="Optional: full text extracted from the image (debug).",
    )


# ──────────────────────────────────────────────────────────────────────────
#  Routes
# ──────────────────────────────────────────────────────────────────────────

MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8 MB
ALLOWED_MIME_PREFIXES = ("image/",)


@app.get("/health")
def health() -> dict:
    """Liveness probe for Cloud Run / load balancers."""
    return {"status": "ok"}


@app.post(
    "/extract-prm",
    response_model=ExtractPrmResponse,
    summary="Extract a 14-digit PRM from a meter / bill image",
)
async def post_extract_prm(image: UploadFile = File(...)) -> dict:
    """Run the OCR pipeline and return the detected PRM.

    Status code mapping:
        200 — success, PRM detected with confidence > threshold
        413 — image exceeds MAX_IMAGE_BYTES
        415 — unsupported media type (only images allowed)
        422 — image is valid but no PRM was detected with sufficient confidence
        500 — unexpected error in the OCR pipeline
        502 — upstream OCR provider (Vision API / LLM) unreachable
    """
    if not image.content_type or not image.content_type.startswith(ALLOWED_MIME_PREFIXES):
        raise HTTPException(
            status_code=415,
            detail=f"Type de fichier non supporté: {image.content_type}",
        )

    contents = await image.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image trop volumineuse (> {MAX_IMAGE_BYTES // (1024 * 1024)} Mo)",
        )

    try:
        result = extract_prm(contents, content_type=image.content_type)
    except ExtractionError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except ConnectionError as e:
        raise HTTPException(status_code=502, detail=f"OCR upstream unreachable: {e}")
    except Exception as e:  # pragma: no cover — defensive
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")

    return result
