import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PremiumUpsell() {
  return (
    <Card className="overflow-hidden border-primary/40 bg-primary/5">
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Badge variant="accent" className="w-fit flex items-center gap-1">
            <Sparkles className="size-3" />
            Premium · €4.99/month
          </Badge>
          <div className="font-[var(--font-display)] text-xl font-semibold">
            Let the agent act on your behalf
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">
            Autopilot mode, 24/7 monitoring, multi-charge (gas, mobile, insurance as they ship), anomaly detection. 30 days free.
          </p>
        </div>
        <Link href="/pricing">
          <Button size="lg" variant="accent">
            See Premium
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
