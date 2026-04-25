import { CheckCircle2, ChevronRight, ScanLine, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "1. Connect your data",
    body: "Enedis if you want to go fast, a bill photo if that's all you have on hand.",
    icon: ScanLine,
  },
  {
    title: "2. Set your rules",
    body: "Price, green energy, stability, reputation: the app turns your preferences into a decision frame.",
    icon: SlidersHorizontal,
  },
  {
    title: "3. Run the workflow",
    body: "Nova compares, recommends, then takes you to the switch through a short, readable funnel.",
    icon: CheckCircle2,
  },
];

export function ProofStrip() {
  return (
    <Card className="border-primary/10">
      <CardHeader className="space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-primary/70">Why it works on mobile</div>
        <CardTitle className="max-w-xl text-2xl sm:text-3xl">
          A landing to understand, a mobile app to act right away
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
