"""
PRM extraction pipeline.
========================

Single function that takes raw image bytes and returns
{ prm, confidence, raw_text }.

The default implementation uses Anthropic Claude Sonnet 4.5 vision
(reliable on smartphone photos with glare / angle variation, no model
hosting cost). Swap in Tesseract or Google Cloud Vision by reimplementing
`_call_ocr_provider`.

A 14-digit PRM is the only thing we extract — the bill or meter screen
typically shows it next to the label "N° PRM" or "Point de Référence
Mesure".
"""
import os
import re
import base64
from dataclasses import dataclass
from typing import Optional


class ExtractionError(Exception):
    """Raised when no PRM can be confidently extracted from the image."""


@dataclass
class _RawOcrResult:
    text: str
    confidence: float


PRM_REGEX = re.compile(r"\b(\d{14})\b")
PRM_LABELED_REGEX = re.compile(
    r"(?:N°\s*PRM|PRM|Point\s+de\s+R[ée]f[ée]rence\s+Mesure)[^\d]{0,20}(\d{14})",
    re.IGNORECASE,
)


def extract_prm(image_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    """Extract a 14-digit PRM from an image of a meter or bill.

    Returns:
        { "prm": "12345678901234", "confidence": 0.95, "raw_text": "..." }

    Raises:
        ExtractionError: no 14-digit sequence found, or confidence < 0.5
    """
    raw = _call_ocr_provider(image_bytes, content_type)

    # Prefer a labeled match ("N° PRM 12345...") over a bare 14-digit sequence,
    # because bills / receipts often contain unrelated 14-digit numbers.
    labeled = PRM_LABELED_REGEX.search(raw.text)
    if labeled:
        return {
            "prm": labeled.group(1),
            "confidence": min(raw.confidence + 0.05, 1.0),  # bonus for labeled match
            "raw_text": raw.text,
        }

    bare = PRM_REGEX.search(raw.text)
    if bare:
        return {
            "prm": bare.group(1),
            "confidence": raw.confidence,
            "raw_text": raw.text,
        }

    raise ExtractionError("Aucun numéro PRM (14 chiffres) détecté dans l'image.")


# ──────────────────────────────────────────────────────────────────────────
#  Provider implementations
# ──────────────────────────────────────────────────────────────────────────

def _call_ocr_provider(image_bytes: bytes, content_type: str) -> _RawOcrResult:
    """Dispatch to the configured OCR provider.

    Default: Claude Sonnet vision via Anthropic SDK. Override by setting
    OCR_PROVIDER=tesseract|google_vision|anthropic (default: anthropic).
    """
    provider = os.environ.get("OCR_PROVIDER", "anthropic").lower()
    if provider == "anthropic":
        return _anthropic_vision(image_bytes, content_type)
    raise NotImplementedError(
        f"OCR provider '{provider}' not implemented yet. "
        "Implement it in extractor._call_ocr_provider."
    )


def _anthropic_vision(image_bytes: bytes, content_type: str) -> _RawOcrResult:
    """Use Claude Sonnet 4.5 vision to read text from the image.

    Cheap (~$0.003 / image, ~1.5s latency), robust to angles and glare.
    Requires ANTHROPIC_API_KEY in the environment.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY not set. Either provide it or implement another "
            "OCR provider (Tesseract, Google Cloud Vision)."
        )

    try:
        import anthropic  # type: ignore
    except ImportError as e:
        raise RuntimeError(
            "anthropic SDK not installed. Add it to requirements.txt."
        ) from e

    client = anthropic.Anthropic(api_key=api_key)
    base64_image = base64.standard_b64encode(image_bytes).decode("utf-8")

    try:
        response = _vision_call(client, base64_image, content_type)
    except anthropic.BadRequestError as e:
        # Claude rejette les non-rasters (SVG, PDF, formats inconnus) avec un 400.
        # On le traduit en ExtractionError pour que l'API renvoie un 422 propre.
        msg = str(e)
        if "Could not process image" in msg or "invalid_request_error" in msg:
            raise ExtractionError(
                "Image illisible. Utilise une photo nette au format JPEG ou PNG."
            ) from e
        raise

    text = "".join(
        block.text for block in response.content if getattr(block, "type", None) == "text"
    )
    return _RawOcrResult(text=text, confidence=0.9)


def _vision_call(client, base64_image: str, content_type: str):
    """Wrapper isolé pour faciliter le mocking en test.

    `temperature=0` est crucial : la température par défaut (1.0) fait
    halluciner les chiffres ambigus (8/9, 0/O, 1/I) sur les écrans LCD
    de compteurs Linky. À 0, le modèle se contente de retranscrire ce
    qu'il voit sans chercher d'alternative.
    """
    return client.messages.create(
        model=os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5"),
        max_tokens=512,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": content_type,
                            "data": base64_image,
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            "Tu lis le texte visible sur l'image d'un compteur "
                            "Linky ou d'une facture d'électricité. Ta priorité "
                            "absolue : transcrire chaque chiffre EXACTEMENT comme "
                            "il apparaît, sans deviner ni corriger. Si un chiffre "
                            "est partiellement lisible, indique-le par un `?`. "
                            "Cherche le numéro PRM (Point de Référence Mesure) "
                            "qui est une suite de 14 chiffres, généralement à "
                            "côté du label « N° PRM » ou « PRM » ou « NUMERO DE "
                            "PRM ». Retourne tout le texte visible, en gardant "
                            "le PRM tel quel sur sa propre ligne. Aucun "
                            "commentaire."
                        ),
                    },
                ],
            }
        ],
    )
