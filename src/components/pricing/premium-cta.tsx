"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PremiumCta() {
  const [loading, setLoading] = useState(false);
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL;

  const handleClick = () => {
    if (!paymentLink) {
      window.alert("Premium activation coming soon. Join the waitlist at contact@nova.fr.");
      return;
    }
    setLoading(true);
    window.location.href = paymentLink;
  };

  return (
    <Button variant="accent" className="w-full" onClick={handleClick} disabled={loading}>
      <Zap className="size-4" />
      {loading ? "Redirecting to Stripe…" : "Activate Premium · 30 days free"}
    </Button>
  );
}
