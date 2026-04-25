"use client";

import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function UploadZone({
  onFileSelected,
  disabled,
  fileName,
}: {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  fileName?: string | null;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-primary/30 bg-white/70 p-8 text-center transition hover:border-primary hover:bg-white",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <input
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
      <UploadCloud className="mb-3 size-8 text-primary" />
      <div className="font-semibold">Importer ma facture</div>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        PDF, photo ou capture mobile. Claude lit le document puis structure le contrat.
      </p>
      {fileName ? <div className="mt-4 rounded-full bg-accent/70 px-4 py-2 text-sm">{fileName}</div> : null}
    </label>
  );
}

