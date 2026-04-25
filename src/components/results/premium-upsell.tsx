import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PremiumUpsell() {
  return (
    <Card className="overflow-hidden border-primary/40 bg-primary/5">
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Badge variant="accent" className="w-fit flex items-center gap-1">
            <Sparkles className="size-3" />
            Premium · 4,99 €/mois
          </Badge>
          <div className="font-[var(--font-display)] text-xl font-semibold">
            Laissez l'agent agir seul à votre place
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">
            Mode Autopilot, surveillance 24/7, multi-charges (gaz, mobile, assurance dès leur sortie), détection d'anomalies. 30 jours offerts.
          </p>
        </div>
        <Link href="/pricing">
          <Button size="lg" variant="accent">
            Voir Premium
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
