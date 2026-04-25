"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function QrCta() {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/connect?src=qr`);
    }
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="w-full justify-center sm:w-auto">
          <QrCode className="size-4" />
          Scan with my phone
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Smartphone className="size-3.5" />
            Mobile demo
          </div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold">
            Scan to start the journey
          </h2>
          <p className="text-sm text-muted-foreground">
            Point your phone&apos;s camera at the QR code. The Nova funnel opens directly in your mobile browser.
          </p>
          <div className="rounded-3xl border border-border bg-white p-5 shadow-inner">
            {url ? (
              <QRCodeSVG value={url} size={224} level="M" includeMargin={false} />
            ) : (
              <div className="size-56 animate-pulse rounded-2xl bg-muted" />
            )}
          </div>
          {url ? (
            <p className="break-all text-xs text-muted-foreground">{url}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Tip: your phone must be on the same Wi-Fi network as this computer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
