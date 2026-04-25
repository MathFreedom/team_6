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
  { icon: Bolt, name: "Electricity", status: "active" as const, hint: "Monthly re-scoring active" },
  { icon: Flame, name: "Gas", status: "waitlist" as const, hint: "Available Q3 2026" },
  { icon: Smartphone, name: "Mobile & Internet", status: "waitlist" as const, hint: "Available Q4 2026" },
  { icon: Shield, name: "Insurance", status: "waitlist" as const, hint: "Available 2027" },
];

const activityFeed = [
  {
    icon: Radar,
    when: "2 h ago",
    title: "Full electricity market scan",
    detail: "23 offers compared to your profile. No change exceeding the €80/year threshold.",
    tone: "neutral" as const,
  },
  {
    icon: TrendingUp,
    when: "4 days ago",
    title: "New offer detected — Mint Énergie Online",
    detail: "Estimated savings: €142/year. Below your Premium threshold (Autopilot ≥ €200).",
    tone: "info" as const,
  },
  {
    icon: AlertTriangle,
    when: "9 days ago",
    title: "Consumption anomaly",
    detail: "+18% vs same period last year. Likely heating use. No action required.",
    tone: "warn" as const,
  },
  {
    icon: CheckCircle2,
    when: "14 days ago",
    title: "Switch Engie → Octopus Energy confirmed",
    detail: "Secured savings: €312/year. Service start expected within 21 days.",
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
  const formatted = nextScan.toLocaleDateString("en-GB", { day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Badge variant="accent" className="w-fit">Agent dashboard</Badge>
            <h1 className="font-[var(--font-display)] text-3xl font-semibold sm:text-4xl">
              Your agent is watching — 24/7.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              A single view of everything Nova monitors for you. Secured savings, detected anomalies, upcoming decisions.
            </p>
          </div>
          <div className="rounded-[24px] border border-primary/40 bg-white/80 p-5 text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Annual secured savings</div>
            <div className="mt-2 font-[var(--font-display)] text-4xl font-semibold text-primary">
              {formatCurrency(annualSavings || 312)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">+ ~€140/year potential pending</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="font-[var(--font-display)] text-xl">Recent activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Everything the agent did for you, in plain language. You stay informed without having to ask.
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
              <CardTitle className="font-[var(--font-display)] text-xl">Monitored verticals</CardTitle>
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
                    {v.status === "active" ? "Active" : "Waitlist"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-[var(--font-display)] text-xl">Next action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[22px] border border-border bg-white/65 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarClock className="size-4 text-primary" />
                  Electricity market re-scoring
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Scheduled on {formatted}</p>
                <Progress value={62} className="mt-3" />
                <p className="mt-2 text-xs text-muted-foreground">
                  You'll only be notified if an offer beats the €80/year threshold.
                </p>
              </div>
              <div className="rounded-[22px] border border-primary/30 bg-primary/7 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4 text-primary" />
                  Switch to Autopilot
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  The agent confirms switches under your threshold without asking again. Included in Premium.
                </p>
                <Link href="/pricing">
                  <Button size="sm" variant="accent" className="mt-3">
                    Discover Premium
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-xl">Monitored contract status</CardTitle>
        </CardHeader>
        <CardContent>
          {billData ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] border border-border bg-white/65 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Provider</div>
                <div className="mt-1 font-semibold">{billData.providerName}</div>
                <p className="text-xs text-muted-foreground">{billData.offerName}</p>
              </div>
              <div className="rounded-[20px] border border-border bg-white/65 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Tariff & power</div>
                <div className="mt-1 font-semibold">{billData.tariffOption} · {billData.meterPowerKva} kVA</div>
              </div>
              <div className="rounded-[20px] border border-border bg-white/65 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Latest annual cost</div>
                <div className="mt-1 font-semibold">{formatCurrency(comparison?.currentAnnualCostEur ?? 0)}</div>
              </div>
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-white/50 p-6 text-center">
              <Activity className="mx-auto mb-3 size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No contract connected. Activate your agent in under 60 seconds.
              </p>
              <Link href="/connect">
                <Button size="sm" variant="accent" className="mt-3">Activate my agent</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
