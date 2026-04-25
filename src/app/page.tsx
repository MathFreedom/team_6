import { HeroSection } from "@/components/landing/hero-section";
import { ProofStrip } from "@/components/landing/proof-strip";
import { VerticalsRoadmap } from "@/components/landing/verticals-roadmap";
import { PwaInstallPrompt } from "@/components/pwa/install-prompt";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <HeroSection />
      <ProofStrip />
      <VerticalsRoadmap />
      <PwaInstallPrompt />
    </div>
  );
}
