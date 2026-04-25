import { TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="overflow-hidden border-primary/10">
      <CardContent className="space-y-4 p-6">
        <Badge variant={action === "switch" ? "accent" : "outline"} className="w-fit">
          {action === "switch" ? "Switch recommended" : "Watch recommended"}
        </Badge>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Estimated savings</p>
            <div className="font-[var(--font-display)] text-4xl font-semibold sm:text-5xl">{formatCurrency(annualSavings)}</div>
            <p className="mt-2 text-sm text-muted-foreground">about {formatCurrency(monthlySavings)} per month</p>
          </div>
          <div className="rounded-full bg-accent p-3 text-accent-foreground sm:p-4">
            <TrendingDown className="size-6 sm:size-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
