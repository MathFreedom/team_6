"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Zap } from "lucide-react";
import { ProgressStepper } from "@/components/layout/progress-stepper";
import { ConnectAuthCard } from "@/components/onboarding/connect-auth-card";
import { PathChoiceCard } from "@/components/onboarding/path-choice-card";
import { UploadZone } from "@/components/onboarding/upload-zone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourneyStore } from "@/lib/store/journey-store";

const checklist = [
  "We start from your real data",
  "No long form to fill out",
  "Actionable result right after the analysis",
];

export default function ConnectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const setPendingSource = useJourneyStore((state) => state.setPendingSource);
  const setPendingFile = useJourneyStore((state) => state.setPendingFile);
  const setComparison = useJourneyStore((state) => state.setComparison);
  const setSwitchState = useJourneyStore((state) => state.setSwitchState);

  const launchAnalysis = (source: "enedis" | "ocr", file?: File) => {
    startTransition(() => {
      setComparison(null);
      setSwitchState(null);
      setPendingSource(source);
      setPendingFile(file ?? null);
      router.push("/analyzing");
    });
  };

  return (
    <div className="app-screen space-y-4">
      <ProgressStepper currentPath="/connect" />
      <ConnectAuthCard />

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3 pb-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/85 px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Zap className="size-3.5" />
            Quick mobile step
          </div>
          <CardTitle className="text-2xl">Connect your energy data</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick the simplest path. As soon as the data lands, Nova takes over to structure your profile and guide you to the decision.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[20px] border border-border bg-white/70 px-4 py-3 text-sm">
                <CheckCircle2 className="size-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <PathChoiceCard
              title="Enedis connection"
              description="The fastest way to start with a simulated Linky profile and skip manual entry."
              cta="Connect"
              recommended
              disabled={isPending}
              onClick={() => launchAnalysis("enedis")}
            />
            <PathChoiceCard
              title="Import a bill"
              description="Take a photo or pick a PDF. Ideal if you already have a bill on hand."
              cta="Choose a document"
              disabled={isPending}
              onClick={() => uploadInputRef.current?.click()}
            />
          </div>

          <UploadZone
            inputRef={uploadInputRef}
            disabled={isPending}
            fileName={fileName}
            title="Drop the bill here"
            description="PDF, photo or mobile screenshot. The document is read and turned into a comparison profile."
            onFileSelected={(file) => {
              setFileName(file.name);
              launchAnalysis("ocr", file);
            }}
          />

          <div className="flex items-start gap-3 rounded-[24px] border border-primary/15 bg-primary/6 p-4 text-sm text-muted-foreground">
            <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>The journey is built for mobile. Buttons stay big, the action order is unique, and nothing forces you through a long form.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
