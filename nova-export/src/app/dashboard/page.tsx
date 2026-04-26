"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  ChevronRight,
  FileText,
  Plug,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { MascotBubble } from "@/components/onboarding/MascotBubble";

type SignupData = {
  identity?: { firstName?: string; lastName?: string };
  currentContract?: { provider?: string; offer?: string };
};

type SelectedOffer = {
  annualSavings: number;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

export default function DashboardPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentContract, setCurrentContract] = useState<
    SignupData["currentContract"] | null
  >(null);
  const [savingsTeaser, setSavingsTeaser] = useState<number | null>(null);

  useEffect(() => {
    try {
      const data: SignupData = JSON.parse(
        localStorage.getItem("nova-signup") || "{}",
      );
      setFirstName(data.identity?.firstName || "");
      setLastName(data.identity?.lastName || "");
      setCurrentContract(data.currentContract || null);

      const offerRaw = localStorage.getItem("nova-selected-offer");
      if (offerRaw) {
        const offer: SelectedOffer = JSON.parse(offerRaw);
        if (typeof offer.annualSavings === "number") {
          setSavingsTeaser(offer.annualSavings);
        }
      } else {
        // Si l'utilisateur a fait l'analyse mais pas encore choisi,
        // on peut afficher la meilleure éco connue. Ici on lit un fallback.
        const lastResults = localStorage.getItem("nova-last-results-savings");
        if (lastResults) setSavingsTeaser(Number(lastResults) || null);
      }
    } catch {
      /* noop */
    }
  }, []);

  const greeting = firstName ? `Bonjour ${firstName}` : "Bonjour";
  const avatarInitials = initials(`${firstName} ${lastName}`.trim() || "Nova");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white text-[#0a1628]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">{greeting}</h1>
          <p className="text-xs" style={{ color: "#5a6b80" }}>
            Bienvenue sur Nova
          </p>
        </div>
        <button
          onClick={() => router.push("/account")}
          aria-label="Mon compte"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-transform hover:scale-105"
          style={{ backgroundColor: "#f3f4f6", color: "#0a1628" }}
        >
          {avatarInitials}
        </button>
      </header>

      <div className="flex-1 px-6 pb-12">
        {/* Mascotte */}
        <div className="mt-4">
          <MascotBubble
            message={`Salut ${firstName || ""} ! Prêt à économiser sur tes factures ?`.replace(
              /\s+/g,
              " ",
            )}
          />
        </div>

        {/* Carte économies (si dispo) */}
        {savingsTeaser != null && (
          <button
            onClick={() => router.push("/results")}
            className="mt-6 flex w-full items-center gap-4 rounded-3xl p-5 text-left transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: "#dbeafe" }}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
              <Sparkles className="h-5 w-5" style={{ color: "#1e40af" }} />
            </span>
            <span className="flex-1">
              <span className="block text-base font-semibold">
                {Math.round(savingsTeaser)} €/an d'économies dispos
              </span>
              <span className="block text-xs" style={{ color: "#5a6b80" }}>
                3 offres recommandées pour toi
              </span>
            </span>
            <ChevronRight className="h-5 w-5" style={{ color: "#1e40af" }} />
          </button>
        )}

        {/* Actions principales */}
        <section className="mt-8">
          <h2 className="mb-3 text-base font-semibold">Que veux-tu faire ?</h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard
              icon={<Camera className="h-5 w-5" style={{ color: "#1e40af" }} />}
              title="Scanner"
              subtitle="Une facture ou un compteur"
              onClick={() => router.push("/scan-prm")}
            />
            <ActionCard
              icon={<FileText className="h-5 w-5" style={{ color: "#1e40af" }} />}
              title="Mes offres"
              subtitle="Voir mes recommandations"
              onClick={() => router.push("/results")}
            />
          </div>
        </section>

        {/* Mon compte */}
        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold">Mon compte</h2>
          <div className="flex flex-col gap-2">
            <ListItem
              icon={<Plug className="h-4 w-4" style={{ color: "#1e40af" }} />}
              title="Mon contrat actuel"
              subtitle={
                currentContract?.provider
                  ? `${currentContract.provider}${currentContract.offer ? ` · ${currentContract.offer}` : ""}`
                  : "Pas encore renseigné"
              }
              onClick={() => router.push("/contract/provider")}
            />
            <ListItem
              icon={<User className="h-4 w-4" style={{ color: "#1e40af" }} />}
              title="Mes informations"
              subtitle="Nom, adresse, téléphone"
              onClick={() => router.push("/account")}
            />
            <ListItem
              icon={<Settings className="h-4 w-4" style={{ color: "#1e40af" }} />}
              title="Paramètres"
              subtitle="Notifications, confidentialité"
              onClick={() => router.push("/settings")}
            />
          </div>
        </section>
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
      onClick={onClick}
      className="group flex aspect-square flex-col justify-between rounded-2xl border bg-white p-4 text-left transition-all hover:scale-[1.02]"
      style={{ borderColor: "rgba(10,22,40,0.08)" }}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "#dbeafe" }}
      >
        {icon}
      </span>
      <span className="mt-3">
        <span className="block text-base font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs" style={{ color: "#5a6b80" }}>
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function ListItem({
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
      onClick={onClick}
      className="flex h-16 items-center gap-3 rounded-2xl border bg-white p-4 text-left transition-colors hover:bg-black/5"
      style={{ borderColor: "rgba(10,22,40,0.06)" }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: "#dbeafe" }}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span
          className="block truncate text-xs"
          style={{ color: "#5a6b80" }}
        >
          {subtitle}
        </span>
      </span>
      <ChevronRight className="h-4 w-4" style={{ color: "#9ca3af" }} />
    </button>
  );
}
