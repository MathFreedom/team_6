import Link from "next/link";
import { Building2, HandHeart, Users, Shield, FileCheck2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pillars = [
  {
    icon: HandHeart,
    title: "Tackling energy poverty",
    text: "12% of FR households are in energy poverty. Nova equips local social services to identify overpaid contracts and trigger a switch in minutes.",
  },
  {
    icon: Users,
    title: "Augmented social workers",
    text: "Not yet another tool to learn — an assistant that pre-chews the diagnosis. The social worker keeps the decision and the human link with the beneficiary.",
  },
  {
    icon: Shield,
    title: "Compliance by default",
    text: "Explicit mandate signed by the beneficiary, FR hosting, GDPR, data never resold. Full audit trail for the local authority.",
  },
];

const pilotSteps = [
  { n: "01", title: "2-week scoping", text: "Identify the cohort (e.g. 200 RSA households), define KPIs, legal mandates." },
  { n: "02", title: "Guided onboarding", text: "Sessions at the social services office or at home. The agent extracts the current contract and computes potential savings." },
  { n: "03", title: "Triggering switches", text: "Assistant mode: the social worker confirms each switch with the beneficiary. No action without consent." },
  { n: "04", title: "Quarterly review", text: "Consolidated reporting: secured savings, households out of energy poverty, recommendations." },
];

export default function B2GPage() {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-primary/30 bg-primary/5">
        <CardContent className="grid gap-6 p-7 sm:p-9 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Badge variant="accent" className="w-fit flex items-center gap-1">
              <Building2 className="size-3" />
              Nova for local authorities
            </Badge>
            <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
              Lift your residents out of energy poverty — without hiring.
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              The same AI agent, deployed for your social services and social housing operators. Nova automatically detects households overpaying for electricity and triggers the switch with a social worker in the loop.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="mailto:contact@nova.fr?subject=Pilote%20B2G">
                <Button size="lg" variant="accent">
                  Launch a pilot
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/agent">
                <Button size="lg" variant="outline">
                  See the product
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-[24px] border border-primary/40 bg-white/80 p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Typical pilot</div>
            <div className="mt-2 font-[var(--font-display)] text-3xl font-semibold">200 households</div>
            <p className="mt-1 text-sm text-muted-foreground">RSA / social-minimum cohort</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average savings / household</span>
                <span className="font-semibold">~€280/year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purchasing power restored</span>
                <span className="font-semibold">~€56,000/year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost to the authority</span>
                <span className="font-semibold text-primary">€0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-3">
        {pillars.map((p) => (
          <Card key={p.title}>
            <CardContent className="space-y-3 p-6">
              <p.icon className="size-6 text-primary" />
              <div className="font-[var(--font-display)] text-lg font-semibold">{p.title}</div>
              <p className="text-sm text-muted-foreground">{p.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">How a pilot runs</CardTitle>
          <p className="text-sm text-muted-foreground">12 weeks to measure the real impact on your territory.</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pilotSteps.map((step) => (
            <div key={step.n} className="rounded-[22px] border border-border bg-white/65 p-5">
              <div className="font-[var(--font-display)] text-2xl font-semibold text-primary">{step.n}</div>
              <div className="mt-2 font-semibold">{step.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <FileCheck2 className="size-6 text-primary" />
            <div className="font-[var(--font-display)] text-xl font-semibold">
              Pilots open for FR social services and social housing operators
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              We onboard 3 new territories per quarter to ensure quality support. Funding possible via Action Logement / CEE certificates.
            </p>
          </div>
          <Link href="mailto:contact@nova.fr?subject=Pilote%20B2G">
            <Button size="lg" variant="accent">
              Request a scoping
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
