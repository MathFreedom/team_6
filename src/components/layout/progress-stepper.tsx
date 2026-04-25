import { Progress } from "@/components/ui/progress";

const STEPS = [
  { path: "/", label: "Accueil" },
  { path: "/connect", label: "Connexion" },
  { path: "/preferences", label: "Règles" },
  { path: "/results", label: "Résultat" },
  { path: "/switch", label: "Switch" },
];

export function ProgressStepper({ currentPath }: { currentPath: string }) {
  const pathIndexMap: Record<string, number> = {
    "/": 0,
    "/connect": 1,
    "/analyzing": 1,
    "/preferences": 2,
    "/results": 3,
    "/switch": 4,
    "/success": 4,
  };

  const currentIndex = pathIndexMap[currentPath] ?? 0;
  const currentStep = STEPS[currentIndex] ?? STEPS[0];
  const value = (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="space-y-2 rounded-[24px] border border-border bg-white/65 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Workflow</div>
          <div className="font-medium">Étape {currentIndex + 1} · {currentStep.label}</div>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1}/{STEPS.length}
        </div>
      </div>
      <Progress value={value} />
    </div>
  );
}
