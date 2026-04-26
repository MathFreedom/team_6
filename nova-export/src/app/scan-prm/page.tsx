"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Camera,
  ImagePlus,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MascotBubble } from "@/components/onboarding/MascotBubble";

const STORAGE_KEY = "nova-signup";

/** "12345678901234" -> "12 3456 7890 1234" (pattern 2-4-4-4) */
function formatPrm(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 14);
  const parts: string[] = [];
  if (d.length > 0) parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 6));
  if (d.length > 6) parts.push(d.slice(6, 10));
  if (d.length > 10) parts.push(d.slice(10, 14));
  return parts.join(" ");
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function persist(patch: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const prev = raw ? JSON.parse(raw) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...patch }));
  } catch {
    /* noop */
  }
}

export default function ScanPrmPage() {
  const router = useRouter();
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState(""); // chiffres uniquement
  const [, setIsLoading] = useState(false);

  const inputCameraRef = useRef<HTMLInputElement>(null);
  const inputUploadRef = useRef<HTMLInputElement>(null);

  const display = useMemo(() => formatPrm(manualValue), [manualValue]);
  const count = manualValue.length;
  const isManualValid = count === 14;

  const handleCameraClick = () => inputCameraRef.current?.click();
  const handleUploadClick = () => inputUploadRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const base64 = await fileToBase64(file);
      persist({ prmPhoto: base64 });
    } catch {
      /* noop */
    }
    router.push("/analyzing");
  };

  const handleManualSubmit = () => {
    if (!isManualValid) return;
    persist({ prm: manualValue });
    router.push("/analyzing");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      {/* HEADER — épuré : retour + label */}
      <header className="sticky top-0 z-20 w-full bg-white">
        <div className="mx-auto flex w-full max-w-[430px] items-center gap-3 px-6 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#0a1628] transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <span className="flex-1 text-center text-sm font-medium text-[#5a6b80]">
            Connexion compteur
          </span>
          {/* Spacer symétrique pour garder le label centré */}
          <span className="-mr-2 h-10 w-10 shrink-0" aria-hidden />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[430px] flex-col px-6 pb-10">
        {/* MASCOTTE — seule source d'instruction */}
        <div className="mt-4">
          <MascotBubble
            size={64}
            message="Sur ton compteur Linky : appuie sur le bouton + pour faire défiler les écrans, cherche « N° PRM » suivi de 14 chiffres. Ou sur ta facture EDF, en haut à droite."
          />
        </div>

        {/* TITRE — pas de sous-titre */}
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Photographie ton compteur
        </h1>

        {/* ACTIONS PRINCIPALES */}
        <div className="mt-6 flex flex-col gap-3">
          <ActionCard
            icon={<Camera className="h-6 w-6 text-[#1e40af]" strokeWidth={2} />}
            title="Prendre en photo"
            subtitle="Ouvre l'appareil photo de ton téléphone"
            onClick={handleCameraClick}
          />
          <ActionCard
            icon={<ImagePlus className="h-6 w-6 text-[#1e40af]" strokeWidth={2} />}
            title="Importer une photo"
            subtitle="Choisis depuis ta galerie ou tes fichiers"
            onClick={handleUploadClick}
          />
        </div>

        {/* SÉPARATEUR */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[rgba(10,22,40,0.08)]" />
          <span className="text-xs text-[#5a6b80]">ou</span>
          <div className="h-px flex-1 bg-[rgba(10,22,40,0.08)]" />
        </div>

        {!manualMode && (
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="mt-4 self-center text-sm font-medium text-[#1e40af] hover:underline"
          >
            Saisir mon numéro PRM manuellement
          </button>
        )}

        {/* SAISIE MANUELLE (conditionnelle) */}
        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: manualMode ? 320 : 0,
            opacity: manualMode ? 1 : 0,
            marginTop: manualMode ? 16 : 0,
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="prm" className="text-sm font-medium text-[#0a1628]">
                Numéro PRM
              </label>
              <span
                className="text-xs font-medium tabular-nums transition-colors"
                style={{ color: count === 14 ? "#1e40af" : "#5a6b80" }}
              >
                {count}/14
              </span>
            </div>
            <Input
              id="prm"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ex : 12345678901234"
              maxLength={17 /* 14 chiffres + 3 espaces */}
              value={display}
              onChange={(e) =>
                setManualValue(e.target.value.replace(/\D/g, "").slice(0, 14))
              }
              className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base tracking-wider"
            />

            <Button
              type="button"
              onClick={handleManualSubmit}
              disabled={!isManualValid}
              className="mt-3 h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40"
            >
              Valider
            </Button>
          </div>
        </div>

        {/* Inputs file cachés */}
        <input
          ref={inputCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={inputUploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </main>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-md"
      style={{
        border: "1px solid rgba(10, 22, 40, 0.08)",
        boxShadow: "0 1px 2px rgba(10,22,40,0.04)",
        minHeight: 80,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(30, 64, 175, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(10, 22, 40, 0.08)";
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ background: "#dbeafe" }}
      >
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-base font-medium text-[#0a1628]">{title}</span>
        <span className="text-xs text-[#5a6b80]">{subtitle}</span>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#5a6b80]" />
    </button>
  );
}
