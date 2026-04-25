"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnalysisTimeline } from "@/components/onboarding/analysis-timeline";
import { ProgressStepper } from "@/components/layout/progress-stepper";
import { ErrorState } from "@/components/feedback/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourneyStore } from "@/lib/store/journey-store";

export default function AnalyzingPage() {
  const router = useRouter();
  const pendingSource = useJourneyStore((state) => state.pendingSource);
  const pendingFile = useJourneyStore((state) => state.pendingFile);
  const billData = useJourneyStore((state) => state.billData);
  const setBillData = useJourneyStore((state) => state.setBillData);
  const setPendingSource = useJourneyStore((state) => state.setPendingSource);
  const setPendingFile = useJourneyStore((state) => state.setPendingFile);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }, 850);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function run() {
      try {
        if (!pendingSource) {
          if (billData) {
            router.replace("/preferences");
            return;
          }
          throw new Error("No analysis source selected.");
        }

        let response: Response;

        if (pendingSource === "enedis") {
          response = await fetch("/api/connect-enedis", { method: "POST" });
        } else {
          if (!pendingFile) {
            throw new Error("No bill imported.");
          }
          const formData = new FormData();
          formData.append("file", pendingFile);
          response = await fetch("/api/extract", {
            method: "POST",
            body: formData,
          });
        }

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Analysis failed");
        }

        setBillData(payload.billData);
        setPendingSource(null);
        setPendingFile(null);
        toast.success("Energy profile ready.");
        router.replace("/preferences");
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Analysis failed";
        setError(message);
      }
    }

    void run();
  }, [billData, pendingFile, pendingSource, router, setBillData, setPendingFile, setPendingSource]);

  return (
    <div className="app-screen space-y-4">
      <ProgressStepper currentPath="/analyzing" />
      {error ? (
        <ErrorState title="Analysis interrupted" message={error} />
      ) : (
        <>
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Nova is preparing your profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                The app stays intentionally simple: one task at a time, with clear feedback on what's happening.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnalysisTimeline currentStep={currentStep} />
              <div className="rounded-[24px] border border-border bg-white/70 p-4 text-sm text-muted-foreground">
                {pendingSource === "enedis"
                  ? "Simulated Enedis connection in progress. The Linky profile is being turned into a comparison profile."
                  : "OCR in progress. The bill is read, structured, then converted into an annual cost and contract data."}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
