import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { value: "60 sec", label: "entre la donnée et la recommandation" },
  { value: "300 €", label: "d'économies potentielles annuelles" },
  { value: "3 modes", label: "Alerte, Assistant, Autopilot" },
];

export function ProofStrip() {
  return (
    <Card>
      <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[22px] border border-border bg-white/60 p-5">
            <div className="font-[var(--font-display)] text-3xl font-semibold">{stat.value}</div>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

