import { Activity, CalendarClock, Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AgentSentinel() {
  const nextScan = new Date();
  nextScan.setDate(nextScan.getDate() + 30);
  const formatted = nextScan.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-col gap-2">
        <Badge variant="accent" className="w-fit">Mode sentinelle activé</Badge>
        <CardTitle className="font-[var(--font-display)] text-xl">
          Votre agent continue à veiller — même après ce switch
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          On ne s'arrête pas à une comparaison ponctuelle. Nova reste connecté à votre profil et re-score le marché chaque mois.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-border bg-white/70 p-4">
          <Radar className="mb-2 size-5 text-primary" />
          <div className="text-sm font-semibold">Veille continue</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Toutes les nouvelles offres FR sont comparées à votre profil dès leur parution.
          </p>
        </div>
        <div className="rounded-[22px] border border-border bg-white/70 p-4">
          <Activity className="mb-2 size-5 text-primary" />
          <div className="text-sm font-semibold">Détection d'anomalie</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Pic de conso, hausse tarifaire, fin de promo : vous êtes alerté avant la prochaine facture.
          </p>
        </div>
        <div className="rounded-[22px] border border-border bg-white/70 p-4">
          <CalendarClock className="mb-2 size-5 text-primary" />
          <div className="text-sm font-semibold">Prochain re-scoring</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Programmé le {formatted}. Vous serez notifié uniquement si une meilleure offre dépasse le seuil d'économie.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
