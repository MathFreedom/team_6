import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PathChoiceCard({
  title,
  description,
  cta,
  recommended,
  onClick,
  disabled,
}: {
  title: string;
  description: string;
  cta: string;
  recommended?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Card className="h-full border-primary/10">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">{title}</CardTitle>
          {recommended ? (
            <div className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Recommended</div>
          ) : null}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full justify-center" variant={recommended ? "accent" : "outline"} onClick={onClick} disabled={disabled}>
          {cta}
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
