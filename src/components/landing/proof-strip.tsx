import { CheckCircle2, ChevronRight, ScanLine, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "1. Connecter votre donnée",
    body: "Enedis si vous voulez aller vite, facture si vous avez juste une photo sous la main.",
    icon: ScanLine,
  },
  {
    title: "2. Définir vos règles",
    body: "Prix, énergie verte, stabilité, réputation: l'app transforme vos préférences en cadre de décision.",
    icon: SlidersHorizontal,
  },
  {
    title: "3. Exécuter le workflow",
    body: "Nova compare, recommande puis vous emmène vers le switch avec un tunnel court et lisible.",
    icon: CheckCircle2,
  },
];

export function ProofStrip() {
  return (
    <Card className="border-primary/10">
      <CardHeader className="space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-primary/70">Pourquoi ça marche sur téléphone</div>
        <CardTitle className="max-w-xl text-2xl sm:text-3xl">
          Une landing pour comprendre, une app mobile pour agir tout de suite
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-[24px] border border-border bg-white/70 p-5">
            <step.icon className="size-5 text-primary" />
            <div className="mt-4 flex items-center gap-2">
              <div className="font-semibold">{step.title}</div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
