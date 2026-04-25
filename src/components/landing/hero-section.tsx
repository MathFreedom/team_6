import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QrCta } from "./qr-cta";

const feed = [
  {
    label: "Connexion",
    title: "Linky ou facture",
    text: "Vous connectez Enedis ou vous prenez votre facture en photo.",
    icon: Camera,
  },
  {
    label: "Analyse",
    title: "Profil énergie structuré",
    text: "Nova lit la donnée, reconstitue votre contrat et calcule votre coût réel.",
    icon: Sparkles,
  },
  {
    label: "Action",
    title: "Décision guidée",
    text: "L'app vous emmène jusqu'au switch, sans écran inutile.",
    icon: CheckCircle2,
  },
];

export function HeroSection() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="animate-rise-in overflow-hidden border-primary/10 bg-[linear-gradient(160deg,rgba(216,255,114,0.35),rgba(255,255,255,0.9)_38%,rgba(255,255,255,0.82))]">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <Badge variant="accent" className="w-fit">
            App mobile · onboarding guidé
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-2xl font-[var(--font-display)] text-4xl font-semibold leading-tight sm:text-6xl">
              Réduisez votre facture depuis votre téléphone, en moins de 3 minutes.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Nova est pensée comme une app mobile: vous arrivez, vous connectez votre donnée énergie, l'agent vous guide
              jusqu'à la meilleure décision puis prépare le workflow de switch.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Connexion Enedis en express",
              "Import facture par photo ou PDF",
              "Résultat lisible puis action",
            ].map((item) => (
              <div key={item} className="rounded-[22px] border border-white/70 bg-white/75 px-4 py-3 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/connect" className="sm:flex-1">
              <Button size="lg" variant="accent" className="w-full justify-center">
                Démarrer sur mobile
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <QrCta />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/70 px-4 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            Parcours optimisé téléphone
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/10">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="mx-auto w-full max-w-[360px] rounded-[34px] border border-primary/15 bg-[#f7f9ee] p-3 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)]">
            <div className="mb-3 flex items-center justify-between rounded-[24px] bg-white/80 px-4 py-3">
              <div>
                <div className="font-[var(--font-display)] text-lg font-semibold">Nova Flow</div>
                <div className="text-xs text-muted-foreground">Connexion, analyse, switch</div>
              </div>
              <Badge variant="outline">Mobile</Badge>
            </div>
            <div className="space-y-3">
              {feed.map((item, index) => (
                <div key={item.title} className="rounded-[24px] border border-border bg-white/82 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <item.icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-[0.2em] text-primary/75">
                        Étape {index + 1} · {item.label}
                      </div>
                      <div className="mt-1 font-semibold">{item.title}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-[24px] border border-primary/15 bg-primary px-4 py-4 text-primary-foreground">
                <div className="text-sm uppercase tracking-[0.18em] text-primary-foreground/75">Décision</div>
                <div className="mt-1 font-[var(--font-display)] text-2xl font-semibold">Jusqu'à 312 €/an détectés</div>
                <p className="mt-2 text-sm text-primary-foreground/80">
                  Vous choisissez: attendre, confirmer, ou déléguer davantage.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
