"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils/cn";
import type { AutonomyLevel } from "@/types/energy";

const options = [
  {
    value: "alert",
    title: "Alerte",
    description: "WattSwitch surveille et vous alerte, sans rien préparer.",
  },
  {
    value: "assistant",
    title: "Assistant",
    description: "WattSwitch prépare tout et vous laisse confirmer au moment critique.",
  },
  {
    value: "autopilot",
    title: "Autopilot",
    description: "WattSwitch agit automatiquement dans le cadre défini.",
  },
] satisfies {
  value: AutonomyLevel;
  title: string;
  description: string;
}[];

export function AutonomySelector({
  value,
  onChange,
}: {
  value: AutonomyLevel;
  onChange: (value: AutonomyLevel) => void;
}) {
  return (
    <RadioGroup value={value} onValueChange={(next) => onChange(next as AutonomyLevel)} className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-[24px] border p-4 transition",
            value === option.value ? "border-primary bg-primary/7" : "border-border bg-white/60",
          )}
        >
          <RadioGroupItem value={option.value} className="mt-1" />
          <div>
            <div className="font-semibold">{option.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
          </div>
        </label>
      ))}
    </RadioGroup>
  );
}

