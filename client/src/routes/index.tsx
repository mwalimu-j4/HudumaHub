import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/sections/hero-section";
import { QuickActionsSection } from "@/components/sections/quick-actions";
import { FeaturesSection } from "@/components/sections/features-section";
import { UnlockSection } from "@/components/sections/unlock-section";
import { TrustSection } from "@/components/sections/trust-section";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <HeroSection />
      <QuickActionsSection />
      <FeaturesSection />
      <UnlockSection />
      <TrustSection />
    </>
  );
}
