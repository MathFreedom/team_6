"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Smartphone, Sparkles, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection() {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/connect?src=qr`);
    }
  }, []);

  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="animate-rise-in overflow-hidden border-primary/10 bg-[linear-gradient(160deg,rgba(216,255,114,0.35),rgba(255,255,255,0.9)_38%,rgba(255,255,255,0.82))]">
        <CardContent className="flex h-full flex-col justify-between gap-8 p-6 sm:p-10">
          <div className="space-y-6">
            <Badge variant="accent" className="w-fit">
              <Sparkles className="size-3.5" />
              Nova · energy agent
            </Badge>
            <h1 className="max-w-2xl font-[var(--font-display)] text-4xl font-semibold leading-tight sm:text-6xl">
              Your electricity bill, optimized in 3 minutes from your phone.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Nova reads your bill, compares French offers against your preferences, then prepares the switch.
              You stay in control: <strong>Alert</strong>, <strong>Assistant</strong> or <strong>Autopilot</strong>.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "Linky connection", body: "Or import a bill via photo / PDF." },
              { title: "Neutral comparison", body: "French offers scored on your criteria." },
              { title: "Guided switch", body: "Clear decision, action in one tap." },
            ].map((item) => (
              <div key={item.title} className="rounded-[22px] border border-white/70 bg-white/75 px-4 py-3">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.body}</div>
              </div>
            ))}
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-white/70 px-4 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            No commitment · encrypted data · offline demo available
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/15 bg-primary text-primary-foreground">
        <CardContent className="flex h-full flex-col items-center gap-5 p-6 text-center sm:p-8">
          <Badge variant="outline" className="w-fit border-white/25 bg-white/10 text-white">
            <Smartphone className="size-3.5" />
            Start on mobile
          </Badge>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold sm:text-3xl">
            Scan this QR code
          </h2>
          <p className="max-w-xs text-sm text-primary-foreground/85">
            Point your phone&apos;s camera at it. The Nova journey opens directly in your mobile browser.
          </p>
          <div className="rounded-[28px] border border-white/20 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.55)]">
            {url ? (
              <QRCodeSVG value={url} size={232} level="M" includeMargin={false} />
            ) : (
              <div className="size-[232px] animate-pulse rounded-2xl bg-muted" />
            )}
          </div>
          {url ? (
            <div className="w-full break-all rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-[11px] text-primary-foreground/80">
              {url}
            </div>
          ) : null}
          <div className="inline-flex items-center gap-2 text-xs text-primary-foreground/75">
            <Wifi className="size-3.5" />
            Phone and computer on the same Wi-Fi
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
