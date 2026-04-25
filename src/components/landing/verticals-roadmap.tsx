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
    name: "Electricity",
    status: "live",
    eta: "Available",
    hook: "The first complete workflow, from signal to switch.",
  },
  {
    icon: Flame,
    name: "Gas",
    status: "next",
    eta: "Q3 2026",
    hook: "Same agent logic, same short mobile interface.",
  },
  {
    icon: Smartphone,
    name: "Mobile & Internet",
    status: "soon",
    eta: "Q4 2026",
    hook: "Detect oversized plans and useless add-ons.",
  },
  {
    icon: Shield,
    name: "Insurance",
    status: "later",
    eta: "2027",
    hook: "Assisted yearly arbitration with trust rules.",
  },
  {
    icon: Repeat,
    name: "Subscriptions",
    status: "later",
    eta: "2027",
    hook: "The same cockpit for every recurring charge.",
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
      <Card className="border-primary/20 bg-[linear-gradient(180deg,rgba(47,106,73,0.96),rgba(24,48,31,0.94))] text-primary-foreground shadow-[0_20px_60px_rgba(16,32,24,0.16)]">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit border-white/20 bg-white/12 text-white">
            Product vision
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl text-white">An agent in your pocket, not yet another comparator</CardTitle>
          <p className="text-sm text-white/95">
            The product design favors speed on mobile: big CTAs, short screens, simple hierarchy, and every step
            moves you closer to action instead of adding friction.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Desktop or mobile home to discover the promise",
            "App funnel centered on a phone viewport",
            "Guided workflow from result to switch",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[22px] border border-white/30 bg-white/15 px-4 py-3 text-sm font-medium text-white"
            >
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit">
            Vertical roadmap
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl">The structure is already ready for other workflows</CardTitle>
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
