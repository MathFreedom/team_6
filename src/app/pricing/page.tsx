import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumCta } from "@/components/pricing/premium-cta";

const freeFeatures = [
  "1 contract connected (electricity)",
  "On-demand comparison",
  "Alert mode: notifications when a better offer appears",
  "Assisted switch (you confirm)",
];

const premiumFeatures = [
  "Multi-contract: electricity + gas + mobile + insurance as they ship",
  "24/7 continuous monitoring + automatic monthly re-scoring",
  "Autopilot mode: the agent switches under your threshold without asking",
  "Anomaly detection (consumption spike, price hike, end of promo)",
  "Tempo / off-peak optimizer for EV & heat-pump households",
  "History of secured savings + annual export",
  "Priority human support if a provider dispute arises",
];

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center">
        <Badge variant="accent" className="mx-auto">Simple pricing, aligned with your interest</Badge>
        <h1 className="font-[var(--font-display)] text-4xl font-semibold sm:text-5xl">
          The base engine is free. Premium for total peace of mind.
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          No hidden user-side commission. Our revenue comes from winning providers — Premium funds the continuous watch and multi-charge expansion.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <Badge variant="outline" className="w-fit">Free</Badge>
            <CardTitle className="font-[var(--font-display)] text-3xl">€0</CardTitle>
            <p className="text-sm text-muted-foreground">For occasional checks and assisted switches.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/connect" className="block">
              <Button variant="outline" className="w-full">Start for free</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/40 bg-primary/5">
          <div className="absolute right-4 top-4">
            <Badge variant="accent" className="flex items-center gap-1">
              <Sparkles className="size-3" />
              Recommended
            </Badge>
          </div>
          <CardHeader className="space-y-3">
            <Badge variant="accent" className="w-fit">Premium</Badge>
            <CardTitle className="font-[var(--font-display)] text-3xl">
              €4.99 <span className="text-base font-normal text-muted-foreground">/ month</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pays off in the first year — average secured savings: €312/year.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <PremiumCta />
            <p className="text-center text-xs text-muted-foreground">
              No commitment. Cancel anytime.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-6 p-7 sm:grid-cols-3">
          <div>
            <div className="font-[var(--font-display)] text-2xl font-semibold">Not yet another comparator</div>
            <p className="mt-2 text-sm text-muted-foreground">
              We don't take a hidden cut on top. The Premium price is our only user-side revenue.
            </p>
          </div>
          <div>
            <div className="font-[var(--font-display)] text-2xl font-semibold">Savings guarantee</div>
            <p className="mt-2 text-sm text-muted-foreground">
              If Premium doesn't save you more than its cost over 12 months, we refund the subscription.
            </p>
          </div>
          <div>
            <div className="font-[var(--font-display)] text-2xl font-semibold">Sovereign data</div>
            <p className="mt-2 text-sm text-muted-foreground">
              FR hosting, GDPR compliance, mandate revocable at any time. Your data is never resold.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
