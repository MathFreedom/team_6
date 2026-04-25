"use client";

import Link from "next/link";
import { Activity, AlertTriangle, Bolt, CalendarClock, CheckCircle2, Flame, Radar, Shield, Smartphone, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";

const monitoredVerticals = [
  { icon: Bolt, name: "Électricité", status: "active" as const, hint: "Re-scoring mensuel actif" },
  { icon: Flame, name: "Gaz", status: "waitlist" as const, hint: "Disponible T3 2026" },
  { icon: Smartphone, name: "Mobile & Internet", status: "waitlist" as const, hint: "Disponible T4 2026" },
  { icon: Shield, name: "Assurances", status: "waitlist" as const, hint: "Disponible 2027" },
];

const activityFeed = [
  {
    icon: Radar,
    when: "Il y a 2 h",
    title: "Scan complet du marché électricité",
    detail: "23 offres comparées à votre profil. Aucun changement dépassant le seuil de 80 €/an.",
    tone: "neutral" as const,
  },
  {
    icon: TrendingUp,
    when: "Il y a 4 jours",
    title: "Nouvelle offre détectée — Mint Énergie Online",
    detail: "Économie estimée : 142 €/an. En dessous de votre seuil Premium (Autopilot ≥ 200 €).",
    tone: "info" as const,
  },
  {
    icon: AlertTriangle,
    when: "Il y a 9 jours",
    title: "Anomalie de consommation",
    detail: "+18 % vs même période l'an dernier. Probable usage chauffage. Aucune action requise.",
    tone: "warn" as const,
  },
  {
    icon: CheckCircle2,
    when: "Il y a 14 jours",
    title: "Switch Engie → Octopus Energy validé",
    detail: "Économies sécurisées : 312 €/an. Mise en service prévue sous 21 jours.",
    tone: "success" as const,
  },
];

const toneClasses: Record<"neutral" | "info" | "warn" | "success", string> = {
  neutral: "border-border bg-white/65",
  info: "border-primary/30 bg-primary/5",
  warn: "border-amber-300/50 bg-amber-50/60",
  success: "border-emerald-300/50 bg-emerald-50/60",
};

export default function AgentDashboardPage() {
  const hydrated = useJourneyHydrated();
  const billData = useJourneyStore((state) => state.billData);
  const comparison = useJourneyStore((state) => state.comparison);

  if (!hydrated) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  const annualSavings = comparison?.annualSavingsEur ?? 0;
  const nextScan = new Date();
  nextScan.setDate(nextScan.getDate() + 30);
  const formatted = nextScan.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Badge variant="accent" className="w-fit">Tableau de bord agent</Badge>
            <h1 className="font-[var(--font-display)] text-3xl font-semibold sm:text-4xl">
              Votre agent veille — 24h/24, 7j/7.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Une vue unique sur tout ce que Nova surveille pour vous. Économies sécurisées, anomalies détectées, prochaines décisions.
            </p>
          </div>
          <div className="rounded-[24px] border border-primary/40 bg-white/80 p-5 text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Économies annuelles sécurisées</div>
            <div className="mt-2 font-[var(--font-display)] text-4xl font-semibold text-primary">
              {formatCurrency(annualSavings || 312)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">+ ~140 €/an potentiels en attente</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="font-[var(--font-display)] text-xl">Activité récente</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tout ce que l'agent a fait pour vous, en clair. Vous restez informé sans avoir à demander.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((event, idx) => (
              <div key={idx} className={`rounded-[22px] border p-4 ${toneClasses[event.tone]}`}>
                <div className="flex items-start gap-3">
                  <event.icon className="mt-0.5 size-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{event.title}</div>
                      <span className="text-xs text-muted-foreground">{event.when}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-[var(--font-display)] text-xl">Verticales surveillées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {monitoredVerticals.map((v) => (
                <div key={v.name} className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-white/65 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 items-center justify-center rounded-full ${v.status === "active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <v.icon className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{v.name}</div>
                      <p className="text-xs text-muted-foreground">{v.hint}</p>
                    </div>
                  </div>
                  <Badge variant={v.status === "active" ? "accent" : "outline"} className="text-[10px]">
                    {v.status === "active" ? "Actif" : "Liste d'attente"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-[var(--font-display)] text-xl">Prochaine action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[22px] border border-border bg-white/65 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarClock className="size-4 text-primary" />
                  Re-scoring marché électricité
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Programmé le {formatted}</p>
                <Progress value={62} className="mt-3" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Vous serez notifié uniquement si une offre dépasse le seuil de 80 €/an.
                </p>
              </div>
              <div className="rounded-[22px] border border-primary/30 bg-primary/7 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4 text-primary" />
                  Passez en Autopilot
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  L'agent valide les switchs sous votre seuil sans vous redemander. Inclus dans Premium.
                </p>
                <Link href="/pricing">
                  <Button size="sm" variant="accent" className="mt-3">
                    Découvrir Premium
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-xl">État du contrat surveillé</CardTitle>
        </CardHeader>
        <CardContent>
          {billData ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] border border-border bg-white/65 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Fournisseur</div>
                <div className="mt-1 font-semibold">{billData.providerName}</div>
                <p className="text-xs text-muted-foreground">{billData.offerName}</p>
              </div>
              <div className="rounded-[20px] border border-border bg-white/65 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Tarif & puissance</div>
                <div className="mt-1 font-semibold">{billData.tariffOption} · {billData.meterPowerKva} kVA</div>
              </div>
              <div className="rounded-[20px] border border-border bg-white/65 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Dernier coût annuel</div>
                <div className="mt-1 font-semibold">{formatCurrency(comparison?.currentAnnualCostEur ?? 0)}</div>
              </div>
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-white/50 p-6 text-center">
              <Activity className="mx-auto mb-3 size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucun contrat connecté. Activez votre agent en moins de 60 secondes.
              </p>
              <Link href="/connect">
                <Button size="sm" variant="accent" className="mt-3">Activer mon agent</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
