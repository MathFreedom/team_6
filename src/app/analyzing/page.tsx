"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnalysisTimeline } from "@/components/onboarding/analysis-timeline";
import { ProgressStepper } from "@/components/layout/progress-stepper";
import { ErrorState } from "@/components/feedback/error-state";
import { Card, CardContent } from "@/components/ui/card";
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
          throw new Error("Aucune source d'analyse sélectionnée.");
        }

        let response: Response;

        if (pendingSource === "enedis") {
          response = await fetch("/api/connect-enedis", { method: "POST" });
        } else {
          if (!pendingFile) {
            throw new Error("Aucune facture importée.");
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
          throw new Error(payload.error || "Analyse impossible");
        }

        setBillData(payload.billData);
        setPendingSource(null);
        setPendingFile(null);
        toast.success("Profil énergie prêt.");
        router.replace("/preferences");
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Analyse impossible";
        setError(message);
      }
    }

    void run();
  }, [billData, pendingFile, pendingSource, router, setBillData, setPendingFile, setPendingSource]);

  return (
    <div className="space-y-6">
      <ProgressStepper currentPath="/analyzing" />
      {error ? (
        <ErrorState title="Analyse interrompue" message={error} />
      ) : (
        <>
          <AnalysisTimeline currentStep={currentStep} />
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              {pendingSource === "enedis"
                ? "Connexion Enedis simulée en cours. Le profil Linky est transformé en profil de comparaison."
                : "OCR en cours. Claude lit votre facture, structure les données puis calcule votre coût annuel actuel."}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

