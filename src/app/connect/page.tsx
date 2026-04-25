"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProgressStepper } from "@/components/layout/progress-stepper";
import { PathChoiceCard } from "@/components/onboarding/path-choice-card";
import { UploadZone } from "@/components/onboarding/upload-zone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourneyStore } from "@/lib/store/journey-store";

export default function ConnectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
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
    <div className="space-y-6">
      <ProgressStepper currentPath="/connect" />
      <Card>
        <CardHeader>
          <CardTitle>Choisissez votre voie d'embarquement</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <PathChoiceCard
            title="Connecter Enedis"
            description="Voie express recommandée. Profil Linky simulé en quelques secondes, sans saisie manuelle."
            cta="Lancer la connexion"
            recommended
            disabled={isPending}
            onClick={() => launchAnalysis("enedis")}
          />
          <div className="space-y-4">
            <PathChoiceCard
              title="Importer ma facture"
              description="Voie manuelle. Une facture suffit pour que Claude structure votre profil énergie."
              cta="Choisir un document"
              disabled={isPending}
              onClick={() => {
                toast.info("Déposez un fichier dans la zone juste en dessous.");
              }}
            />
            <UploadZone
              disabled={isPending}
              fileName={fileName}
              onFileSelected={(file) => {
                setFileName(file.name);
                launchAnalysis("ocr", file);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

