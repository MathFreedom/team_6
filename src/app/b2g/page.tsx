import Link from "next/link";
import { Building2, HandHeart, Users, Shield, FileCheck2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pillars = [
  {
    icon: HandHeart,
    title: "Lutte contre la précarité énergétique",
    text: "12 % des ménages FR sont en précarité énergétique. Nova outille les CCAS pour identifier les contrats sur-payés et déclencher un switch en quelques minutes.",
  },
  {
    icon: Users,
    title: "Travailleurs sociaux augmentés",
    text: "Pas un nouvel outil à apprendre — un assistant qui pré-mâche le diagnostic. Le travailleur social garde la décision et le lien humain avec le bénéficiaire.",
  },
  {
    icon: Shield,
    title: "Conformité par défaut",
    text: "Mandat explicite signé par le bénéficiaire, hébergement FR, RGPD, données jamais revendues. Audit trail complet pour la collectivité.",
  },
];

const pilotSteps = [
  { n: "01", title: "Cadrage 2 semaines", text: "Identification de la cohorte (ex. 200 foyers RSA), définition des KPI, mandats juridiques." },
  { n: "02", title: "Onboarding accompagné", text: "Sessions en CCAS ou à domicile. L'agent extrait le contrat actuel et calcule l'économie potentielle." },
  { n: "03", title: "Déclenchement des switchs", text: "Mode Assistant : le travailleur social valide chaque switch avec le bénéficiaire. Aucune action sans consentement." },
  { n: "04", title: "Bilan trimestriel", text: "Reporting consolidé : économies sécurisées, foyers sortis de précarité énergétique, recommandations." },
];

export default function B2GPage() {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-primary/30 bg-primary/5">
        <CardContent className="grid gap-6 p-7 sm:p-9 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Badge variant="accent" className="w-fit flex items-center gap-1">
              <Building2 className="size-3" />
              Nova pour les collectivités
            </Badge>
            <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
              Sortez vos administrés de la précarité énergétique — sans recruter.
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Le même agent IA, déployé pour vos CCAS, services sociaux et bailleurs sociaux. Nova détecte automatiquement les foyers qui sur-payent leur électricité et déclenche le switch avec un travailleur social dans la boucle.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="mailto:contact@nova.fr?subject=Pilote%20B2G">
                <Button size="lg" variant="accent">
                  Lancer un pilote
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/agent">
                <Button size="lg" variant="outline">
                  Voir le produit
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-[24px] border border-primary/40 bg-white/80 p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Pilote type</div>
            <div className="mt-2 font-[var(--font-display)] text-3xl font-semibold">200 foyers</div>
            <p className="mt-1 text-sm text-muted-foreground">cohorte RSA / minima sociaux</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Économie moyenne / foyer</span>
                <span className="font-semibold">~280 €/an</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pouvoir d'achat redonné</span>
                <span className="font-semibold">~56 000 €/an</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coût pour la collectivité</span>
                <span className="font-semibold text-primary">0 €</span>
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
          <CardTitle className="font-[var(--font-display)] text-2xl">Comment se déroule un pilote</CardTitle>
          <p className="text-sm text-muted-foreground">12 semaines pour mesurer l'impact réel sur votre territoire.</p>
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
              Pilotes ouverts pour les CCAS et bailleurs sociaux FR
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              Nous prenons 3 nouveaux territoires par trimestre pour assurer un accompagnement qualitatif. Subvention possible via Action Logement / certificats CEE.
            </p>
          </div>
          <Link href="mailto:contact@nova.fr?subject=Pilote%20B2G">
            <Button size="lg" variant="accent">
              Demander un cadrage
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
