import { cn } from "@/lib/utils/cn";

export function PreferenceCardGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: T; label: string; hint: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-[var(--font-display)] text-lg font-semibold">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[24px] border p-4 text-left transition",
              option.value === value
                ? "border-primary bg-primary/8"
                : "border-border bg-white/65 hover:bg-white",
            )}
          >
            <div className="font-semibold">{option.label}</div>
            <p className="mt-1 text-sm text-muted-foreground">{option.hint}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

