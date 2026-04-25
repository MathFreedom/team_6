import { TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";

export function SavingsHeroCard({
  annualSavings,
  monthlySavings,
  action,
}: {
  annualSavings: number;
  monthlySavings: number;
  action: "switch" | "wait";
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-7">
        <Badge variant={action === "switch" ? "accent" : "outline"}>
          {action === "switch" ? "Switch recommandé" : "Surveillance recommandée"}
        </Badge>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Économie estimée</p>
            <div className="font-[var(--font-display)] text-5xl font-semibold">
              {formatCurrency(annualSavings)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              soit environ {formatCurrency(monthlySavings)} par mois
            </p>
          </div>
          <div className="rounded-full bg-accent p-4 text-accent-foreground">
            <TrendingDown className="size-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

