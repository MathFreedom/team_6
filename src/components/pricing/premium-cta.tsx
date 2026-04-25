"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PremiumCta() {
  const [loading, setLoading] = useState(false);
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL;

  const handleClick = () => {
    if (!paymentLink) {
      window.alert("Activation Premium bientôt disponible. Inscrivez-vous à la liste d'attente sur contact@nova.fr.");
      return;
    }
    setLoading(true);
    window.location.href = paymentLink;
  };

  return (
    <Button variant="accent" className="w-full" onClick={handleClick} disabled={loading}>
      <Zap className="size-4" />
      {loading ? "Redirection vers Stripe…" : "Activer Premium · 30 jours offerts"}
    </Button>
  );
}
