import { NextResponse } from "next/server";

const OCR_PRM_URL =
  "https://ocr-prm-32292404002.europe-west1.run.app/extract-prm";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Le format multipart/form-data est attendu." },
      { status: 415 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(OCR_PRM_URL, {
      method: "POST",
      headers: { "content-type": contentType },
      body: request.body,
      // @ts-expect-error — duplex required when streaming a request body
      duplex: "half",
    });
  } catch (networkError) {
    return NextResponse.json(
      {
        error:
          networkError instanceof Error
            ? `Connexion impossible au service OCR : ${networkError.message}`
            : "Connexion impossible au service OCR",
      },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  const responseContentType = upstream.headers.get("content-type") ?? "application/json";

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": responseContentType },
  });
}
