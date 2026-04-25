import { Activity, CalendarClock, Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AgentSentinel() {
  const nextScan = new Date();
  nextScan.setDate(nextScan.getDate() + 30);
  const formatted = nextScan.toLocaleDateString("en-GB", { day: "numeric", month: "long" });

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-col gap-2">
        <Badge variant="accent" className="w-fit">Sentinel mode active</Badge>
        <CardTitle className="font-[var(--font-display)] text-xl">
          Your agent keeps watching — even after this switch
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          We don't stop at a one-off comparison. Nova stays connected to your profile and re-scores the market every month.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-border bg-white/70 p-4">
          <Radar className="mb-2 size-5 text-primary" />
          <div className="text-sm font-semibold">Continuous watch</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Every new FR offer is compared to your profile as soon as it ships.
          </p>
        </div>
        <div className="rounded-[22px] border border-border bg-white/70 p-4">
          <Activity className="mb-2 size-5 text-primary" />
          <div className="text-sm font-semibold">Anomaly detection</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Consumption spike, price hike, end of promo: you're alerted before the next bill.
          </p>
        </div>
        <div className="rounded-[22px] border border-border bg-white/70 p-4">
          <CalendarClock className="mb-2 size-5 text-primary" />
          <div className="text-sm font-semibold">Next re-scoring</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Scheduled on {formatted}. You'll only be notified if a better offer beats the savings threshold.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
