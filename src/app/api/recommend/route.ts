import { NextResponse } from "next/server";

const RECOMMEND_URL =
  "https://energy-optimizer-32292404002.europe-west1.run.app/recommend";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Payload JSON invalide" },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(RECOMMEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    return NextResponse.json(
      {
        error:
          networkError instanceof Error
            ? `Connexion impossible au service: ${networkError.message}`
            : "Connexion impossible au service",
      },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") ?? "application/json";

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": contentType },
  });
}
