import { Progress } from "@/components/ui/progress";

const STEPS = [
  { path: "/", label: "Mission" },
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

  const value = (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {STEPS.map((step, index) => (
          <div key={step.label} className={index <= currentIndex ? "text-primary" : undefined}>
            {step.label}
          </div>
        ))}
      </div>
      <Progress value={value} />
    </div>
  );
}
