import { HeroSection } from "@/components/landing/hero-section";
import { ProofStrip } from "@/components/landing/proof-strip";
import { PwaInstallPrompt } from "@/components/pwa/install-prompt";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <HeroSection />
      <ProofStrip />
      <PwaInstallPrompt />
    </div>
  );
}

