import { ANALYSIS_STEPS } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalysisTimeline({ currentStep }: { currentStep: number }) {
  const value = ((currentStep + 1) / ANALYSIS_STEPS.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse de mission en cours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={value} />
        <div className="space-y-3">
          {ANALYSIS_STEPS.map((step, index) => (
            <div
              key={step}
              className={`rounded-[22px] border px-4 py-3 text-sm ${
                index <= currentStep
                  ? "border-primary/30 bg-primary/6 text-foreground"
                  : "border-border bg-white/60 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{step}</span>
                <span className={index === currentStep ? "animate-pulse-line rounded-full bg-accent px-2 py-1 text-[11px] font-semibold text-accent-foreground" : "text-[11px]"}>
                  {index < currentStep ? "Terminé" : index === currentStep ? "En cours" : "À venir"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

