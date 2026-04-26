"use client";

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
import { useAuthProfileStore } from "@/lib/store/auth-profile-store";
import { useJourneyStore } from "@/lib/store/journey-store";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

export default function DashboardPage() {
  const router = useRouter();
  const firstName = useAuthProfileStore((s) => s.firstName);
  const lastName = useAuthProfileStore((s) => s.lastName);
  const billData = useJourneyStore((s) => s.billData);
  const comparison = useJourneyStore((s) => s.comparison);
  const selectedOfferId = useJourneyStore((s) => s.selectedOfferId);
  const switchState = useJourneyStore((s) => s.switchState);

  const currentContract = billData
    ? { provider: billData.providerName, offer: billData.offerName }
    : null;

  const selectedOffer = comparison && selectedOfferId
    ? comparison.rankedOffers.find((r) => r.offerId === selectedOfferId)
    : null;

  const savingsTeaser = switchState
    ? switchState.estimatedAnnualSavingsEur
    : selectedOffer
    ? selectedOffer.annualSavingsEur
    : comparison?.annualSavingsEur ?? null;

  const greeting = firstName ? `Hello ${firstName}` : "Hello";
  const avatarInitials = initials(`${firstName} ${lastName}`.trim() || "Nova");

  return (
    <main className="app-shell flex flex-col bg-white text-[#0a1628]">
      <header className="page-gutter flex items-center justify-between py-4 pt-safe">
        <div>
          <h1 className="text-lg font-semibold">{greeting}</h1>
          <p className="text-xs" style={{ color: "#5a6b80" }}>
            Welcome to Nova
          </p>
        </div>
        <button
          onClick={() => router.push("/account")}
          aria-label="My account"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-transform hover:scale-105"
          style={{ backgroundColor: "#f3f4f6", color: "#0a1628" }}
        >
          {avatarInitials}
        </button>
      </header>

      <div className="page-gutter page-bottom-safe flex-1 pb-12">
        <div className="mt-4">
          <MascotBubble
            gecko="/mascot/onboarding-1.svg"
            message={`Hi ${firstName || ""}! Ready to save on your bills?`.replace(/\s+/g, " ")}
          />
        </div>

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
                {Math.round(savingsTeaser)} EUR/year in available savings
              </span>
              <span className="block text-xs" style={{ color: "#5a6b80" }}>
                3 recommended offers for you
              </span>
            </span>
            <ChevronRight className="h-5 w-5" style={{ color: "#1e40af" }} />
          </button>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-base font-semibold">What would you like to do?</h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard
              icon={<Camera className="h-5 w-5" style={{ color: "#1e40af" }} />}
              title="Scan"
              subtitle="A bill or a meter"
              onClick={() => router.push("/scan-prm")}
            />
            <ActionCard
              icon={<FileText className="h-5 w-5" style={{ color: "#1e40af" }} />}
              title="My offers"
              subtitle="View my recommendations"
              onClick={() => router.push("/results")}
            />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold">My account</h2>
          <div className="flex flex-col gap-2">
            <ListItem
              icon={<Plug className="h-4 w-4" style={{ color: "#1e40af" }} />}
              title="My current contract"
              subtitle={
                currentContract?.provider
                  ? `${currentContract.provider}${currentContract.offer ? ` · ${currentContract.offer}` : ""}`
                  : "Not filled in yet"
              }
              onClick={() => router.push("/contract/provider")}
            />
            <ListItem
              icon={<User className="h-4 w-4" style={{ color: "#1e40af" }} />}
              title="My information"
              subtitle="Name, address, phone"
              onClick={() => router.push("/account")}
            />
            <ListItem
              icon={<Settings className="h-4 w-4" style={{ color: "#1e40af" }} />}
              title="Settings"
              subtitle="Notifications, privacy"
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
