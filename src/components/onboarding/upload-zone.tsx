"use client";

import { useId, useState, type DragEvent, type RefObject } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function UploadZone({
  onFileSelected,
  disabled,
  fileName,
  inputRef,
  title = "Import my bill",
  description = "PDF, photo or mobile screenshot. Claude reads the document then structures the contract.",
}: {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  fileName?: string | null;
  inputRef?: RefObject<HTMLInputElement | null>;
  title?: string;
  description?: string;
}) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | null | undefined) => {
    if (!file || disabled) return;
    onFileSelected(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-primary/30 bg-white/70 p-8 text-center transition hover:border-primary hover:bg-white",
        isDragging && "border-primary bg-primary/5",
        disabled && "pointer-events-none opacity-60",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragEnter={() => {
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      <UploadCloud className="mb-3 size-8 text-primary" />
      <div className="font-semibold">{title}</div>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {fileName ? <div className="mt-4 rounded-full bg-accent/70 px-4 py-2 text-sm">{fileName}</div> : null}
    </label>
  );
}
