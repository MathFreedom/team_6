import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="animate-rise-in overflow-hidden">
        <CardContent className="space-y-8 p-7 sm:p-9">
          <Badge variant="accent">Mission Control pour votre contrat d'électricité</Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-[var(--font-display)] text-4xl font-semibold leading-tight sm:text-6xl">
              On peut vérifier si vous surpayez votre électricité en moins de 60 secondes.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Connectez votre profil une fois, définissez vos priorités, laissez WattSwitch comparer le marché et préparer le meilleur switch pour vous.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/connect">
              <Button size="lg" variant="accent">
                Analyser ma facture
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Badge variant="outline">100% PWA • mobile-first • prêt pour la démo</Badge>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="grid h-full gap-4 p-6">
          {[
            {
              icon: Zap,
              title: "Connexion express",
              text: "Mock Enedis ou import de facture avec OCR Claude.",
            },
            {
              icon: Sparkles,
              title: "Décision personnalisée",
              text: "L'agent arbitre selon vos critères: prix, réputation, stabilité, énergie verte.",
            },
            {
              icon: ShieldCheck,
              title: "Contrôle humain",
              text: "Mode Alerte, Assistant ou Autopilot. La démo met en avant le mode Assistant.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] border border-border bg-white/70 p-5">
              <item.icon className="mb-3 size-5 text-primary" />
              <div className="font-semibold">{item.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

