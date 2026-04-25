"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Zap } from "lucide-react";
import { ProgressStepper } from "@/components/layout/progress-stepper";
import { PathChoiceCard } from "@/components/onboarding/path-choice-card";
import { UploadZone } from "@/components/onboarding/upload-zone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourneyStore } from "@/lib/store/journey-store";

const checklist = [
  "On part de votre donnée réelle",
  "Aucune saisie longue",
  "Résultat exploitable juste après l'analyse",
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

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3 pb-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/85 px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Zap className="size-3.5" />
            Étape mobile rapide
          </div>
          <CardTitle className="text-2xl">Connectez votre donnée énergie</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choisissez le chemin le plus simple. Dès que la donnée entre, Nova prend le relais pour structurer votre
            profil puis vous guider vers la décision.
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
              title="Connexion Enedis"
              description="Le mode le plus rapide pour démarrer un profil Linky simulé et éviter la saisie manuelle."
              cta="Se connecter"
              recommended
              disabled={isPending}
              onClick={() => launchAnalysis("enedis")}
            />
            <PathChoiceCard
              title="Importer une facture"
              description="Prenez une photo ou choisissez un PDF. Idéal si vous avez déjà une facture sous la main."
              cta="Choisir un document"
              disabled={isPending}
              onClick={() => uploadInputRef.current?.click()}
            />
          </div>

          <UploadZone
            inputRef={uploadInputRef}
            disabled={isPending}
            fileName={fileName}
            title="Glissez la facture ici"
            description="PDF, photo ou capture mobile. Le document est lu puis transformé en profil de comparaison."
            onFileSelected={(file) => {
              setFileName(file.name);
              launchAnalysis("ocr", file);
            }}
          />

          <div className="flex items-start gap-3 rounded-[24px] border border-primary/15 bg-primary/6 p-4 text-sm text-muted-foreground">
            <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>Le parcours est pensé téléphone. Les boutons restent gros, l'ordre des actions est unique, et rien ne vous force à remplir un long formulaire.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
