import { Bolt, Flame, Repeat, Shield, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type VerticalStatus = "live" | "next" | "soon" | "later";

const verticals: {
  icon: typeof Bolt;
  name: string;
  status: VerticalStatus;
  eta: string;
  hook: string;
}[] = [
  {
    icon: Bolt,
    name: "Électricité",
    status: "live",
    eta: "Disponible",
    hook: "Le premier workflow complet, du signal au switch.",
  },
  {
    icon: Flame,
    name: "Gaz",
    status: "next",
    eta: "T3 2026",
    hook: "Même logique d'agent, même interface mobile courte.",
  },
  {
    icon: Smartphone,
    name: "Mobile & Internet",
    status: "soon",
    eta: "T4 2026",
    hook: "Détection des forfaits surdimensionnés et des options inutiles.",
  },
  {
    icon: Shield,
    name: "Assurances",
    status: "later",
    eta: "2027",
    hook: "Arbitrage annuel assisté avec règles de confiance.",
  },
  {
    icon: Repeat,
    name: "Abonnements",
    status: "later",
    eta: "2027",
    hook: "Le même cockpit pour toutes les charges récurrentes.",
  },
];

const statusStyles: Record<VerticalStatus, { label: string; variant: "accent" | "outline" }> = {
  live: { label: "Live", variant: "accent" },
  next: { label: "Next", variant: "outline" },
  soon: { label: "Soon", variant: "outline" },
  later: { label: "Roadmap", variant: "outline" },
};

export function VerticalsRoadmap() {
  return (
    <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
      <Card className="border-primary/10 bg-primary text-primary-foreground">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit border-white/20 bg-white/10 text-white">
            Vision produit
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl">Un agent dans la poche, pas un comparateur de plus</CardTitle>
          <p className="text-sm text-primary-foreground/80">
            Le design du produit privilégie la vitesse sur téléphone: gros CTA, écrans courts, hiérarchie simple,
            et chaque étape rapproche de l'action au lieu d'ajouter de la friction.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Home desktop ou mobile pour découvrir la promesse",
            "Tunnel app centré sur un viewport téléphone",
            "Workflow guidé jusqu'au résultat puis au switch",
          ].map((item) => (
            <div key={item} className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-3 text-sm">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit">
            Roadmap verticale
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl">La structure est déjà prête pour d'autres workflows</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {verticals.map((vertical) => {
            const status = statusStyles[vertical.status];
            const isLive = vertical.status === "live";

            return (
              <div
                key={vertical.name}
                className={`rounded-[24px] border p-4 ${
                  isLive ? "border-primary/25 bg-primary/6" : "border-border bg-white/70"
                }`}
              >
                <vertical.icon className={`size-5 ${isLive ? "text-primary" : "text-muted-foreground"}`} />
                <div className="mt-3 font-semibold">{vertical.name}</div>
                <Badge variant={status.variant} className="mt-2 w-fit">
                  {status.label} · {vertical.eta}
                </Badge>
                <p className="mt-3 text-sm text-muted-foreground">{vertical.hook}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
