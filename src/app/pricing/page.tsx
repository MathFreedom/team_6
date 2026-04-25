import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumCta } from "@/components/pricing/premium-cta";

const freeFeatures = [
  "Connexion 1 contrat (électricité)",
  "Comparaison à la demande",
  "Mode Alerte : notifications quand une meilleure offre apparaît",
  "Switch assisté (vous validez)",
];

const premiumFeatures = [
  "Multi-contrats : élec + gaz + mobile + assurance dès leur sortie",
  "Surveillance continue 24/7 + re-scoring mensuel automatique",
  "Mode Autopilot : l'agent switche sous votre seuil sans demander",
  "Détection d'anomalies (pic de conso, hausse tarifaire, fin de promo)",
  "Optimiseur Tempo / heures creuses pour foyers VE & PAC",
  "Historique d'économies sécurisées + export annuel",
  "Support prioritaire humain en cas de litige fournisseur",
];

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center">
        <Badge variant="accent" className="mx-auto">Tarifs simples, alignés sur votre intérêt</Badge>
        <h1 className="font-[var(--font-display)] text-4xl font-semibold sm:text-5xl">
          Le moteur de base est gratuit. Premium pour la tranquillité totale.
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Pas de commission cachée côté utilisateur. Notre revenu vient des fournisseurs gagnants — Premium finance la veille continue et le multi-charges.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <Badge variant="outline" className="w-fit">Free</Badge>
            <CardTitle className="font-[var(--font-display)] text-3xl">0 €</CardTitle>
            <p className="text-sm text-muted-foreground">Pour vérifier ponctuellement et switcher en assisté.</p>
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
              <Button variant="outline" className="w-full">Commencer gratuitement</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/40 bg-primary/5">
          <div className="absolute right-4 top-4">
            <Badge variant="accent" className="flex items-center gap-1">
              <Sparkles className="size-3" />
              Recommandé
            </Badge>
          </div>
          <CardHeader className="space-y-3">
            <Badge variant="accent" className="w-fit">Premium</Badge>
            <CardTitle className="font-[var(--font-display)] text-3xl">
              4,99 € <span className="text-base font-normal text-muted-foreground">/ mois</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Rentabilisé dès la première année — économie moyenne sécurisée : 312 €/an.
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
              Sans engagement. Annulable à tout moment.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-6 p-7 sm:grid-cols-3">
          <div>
            <div className="font-[var(--font-display)] text-2xl font-semibold">Pas un comparateur de plus</div>
            <p className="mt-2 text-sm text-muted-foreground">
              On ne touche pas de commission cachée par dessus. Le prix Premium est notre seul revenu côté utilisateur.
            </p>
          </div>
          <div>
            <div className="font-[var(--font-display)] text-2xl font-semibold">Garantie économies</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Si Premium ne vous fait pas économiser plus que son coût sur 12 mois, on vous rembourse l'abonnement.
            </p>
          </div>
          <div>
            <div className="font-[var(--font-display)] text-2xl font-semibold">Données souveraines</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Hébergement FR, conformité RGPD, mandat révocable à tout moment. Vos données ne sont jamais revendues.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
