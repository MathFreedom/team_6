"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, ChevronRight, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import { useJourneyStore } from "@/lib/store/journey-store";

const DEMO_PRM = "07386541234022";

function formatPrm(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 14);
  const parts: string[] = [];
  if (d.length > 0) parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 6));
  if (d.length > 6) parts.push(d.slice(6, 10));
  if (d.length > 10) parts.push(d.slice(10, 14));
  return parts.join(" ");
}

export default function ScanPrmPage() {
  const router = useRouter();
  const setPendingSource = useJourneyStore((s) => s.setPendingSource);
  const setPendingFile = useJourneyStore((s) => s.setPendingFile);
  const setPendingPrm = useJourneyStore((s) => s.setPendingPrm);
  const setComparison = useJourneyStore((s) => s.setComparison);
  const setSwitchState = useJourneyStore((s) => s.setSwitchState);

  const [manualValue, setManualValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const display = useMemo(() => formatPrm(manualValue), [manualValue]);
  const count = manualValue.length;
  const isManualValid = count === 14;

  const launchAnalysis = (prm: string) => {
    setComparison(null);
    setSwitchState(null);
    setPendingFile(null);
    setPendingSource("enedis");
    setPendingPrm(prm);
    router.push("/analyzing");
  };

  const handleManualSubmit = () => {
    if (isManualValid) launchAnalysis(manualValue);
  };

  const handlePhotoSelected = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch("/api/ocr-prm", {
        method: "POST",
        body: form,
      });
      const payload = await response.json();
      if (!response.ok) {
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : typeof payload?.detail === "string"
            ? payload.detail
            : "The PRM could not be read from the photo.";
        throw new Error(message);
      }
      const prm = String(payload?.prm ?? "");
      if (!/^\d{14}$/.test(prm)) {
        throw new Error("The OCR service did not return a valid PRM.");
      }
      setManualValue(prm);
      toast.success("PRM detected. Check the number before launching the analysis.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to read the PRM.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handlePhotoSelected(file);
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <header className="sticky top-0 z-20 w-full bg-white pt-safe">
        <div className="app-screen page-gutter flex items-center gap-3 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#0a1628] transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <span className="flex-1 text-center text-sm font-medium text-[#5a6b80]">
            Meter connection
          </span>
          <span className="-mr-2 h-10 w-10 shrink-0" aria-hidden />
        </div>
      </header>

      <div className="app-screen page-gutter page-bottom-safe flex flex-col pb-10">
        <div className="mt-4">
          <MascotBubble
            gecko="/mascot/Scan-PRM.svg"
            size={72}
            message="Take a photo of your Linky meter screen showing the PRM number or your EDF bill. I'll read the 14 digits for you. You can also type them manually."
          />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Connect your meter
        </h1>

        <div className="mt-6 flex flex-col gap-3">
          <ActionLabel
            htmlFor="prm-camera"
            icon={<Camera className="h-6 w-6 text-[#1e40af]" strokeWidth={2} />}
            title="Take a photo"
            subtitle="Open your phone camera"
            disabled={isUploading}
          />
          <input id="prm-camera" type="file" accept="image/*" capture="environment" className="absolute h-px w-px overflow-hidden opacity-0" style={{ clip: "rect(0 0 0 0)", clipPath: "inset(50%)" }} tabIndex={-1} disabled={isUploading} onChange={handleFileChange} />
          <ActionLabel
            htmlFor="prm-upload"
            icon={<ImagePlus className="h-6 w-6 text-[#1e40af]" strokeWidth={2} />}
            title="Upload a photo"
            subtitle="Choose from your gallery or files"
            disabled={isUploading}
          />
          <input id="prm-upload" type="file" accept="image/*" className="absolute h-px w-px overflow-hidden opacity-0" style={{ clip: "rect(0 0 0 0)", clipPath: "inset(50%)" }} tabIndex={-1} disabled={isUploading} onChange={handleFileChange} />
        </div>

        {isUploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#1e40af]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Reading your PRM number...</span>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[rgba(10,22,40,0.08)]" />
          <span className="text-xs text-[#5a6b80]">or enter it manually</span>
          <div className="h-px flex-1 bg-[rgba(10,22,40,0.08)]" />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="prm" className="text-sm font-medium text-[#0a1628]">
              PRM number
            </label>
            <span className="text-xs font-medium tabular-nums transition-colors" style={{ color: count === 14 ? "#1e40af" : "#5a6b80" }}>
              {count}/14
            </span>
          </div>
          <Input id="prm" type="text" inputMode="numeric" autoComplete="off" placeholder="Ex: 12345678901234" maxLength={17} value={display} disabled={isUploading} onChange={(e) => setManualValue(e.target.value.replace(/\D/g, "").slice(0, 14))} className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base tracking-wider" />

          <Button type="button" onClick={handleManualSubmit} disabled={!isManualValid || isUploading} className="mt-3 h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40">
            Start analysis
          </Button>

          <button type="button" onClick={() => !isUploading && launchAnalysis(DEMO_PRM)} disabled={isUploading} className="mt-2 self-center text-xs font-medium text-[#1e40af] hover:underline disabled:opacity-40">
            Use demo PRM
          </button>
        </div>
      </div>
    </main>
  );
}

function ActionLabel({
  htmlFor,
  icon,
  title,
  subtitle,
  disabled,
}: {
  htmlFor: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      aria-disabled={disabled}
      className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 text-left transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-md aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
      style={{
        border: "1px solid rgba(10, 22, 40, 0.08)",
        boxShadow: "0 1px 2px rgba(10,22,40,0.04)",
        minHeight: 80,
      }}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: "#dbeafe" }}>
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-base font-medium text-[#0a1628]">{title}</span>
        <span className="text-xs text-[#5a6b80]">{subtitle}</span>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#5a6b80]" />
    </label>
  );
}
