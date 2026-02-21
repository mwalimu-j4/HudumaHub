import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function HeroSection() {
  const handleStartAsking = () => {
    toast.success("AI Chat coming soon!", {
      description:
        "Our smart assistant is being built to help you navigate government services.",
    });
  };

  const handleBrowseServices = () => {
    toast.info("Services directory coming soon!", {
      description:
        "We're compiling all Kenyan government services for easy access.",
    });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background using theme tokens */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_50%)] opacity-[0.04]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            🇰🇪 Built for Kenyan Citizens
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Your Smart Guide to{" "}
            <span className="text-primary">Kenyan Public Services</span>
          </h1>

          {/* Subtext */}
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Ask about IDs, KRA, NHIF, HELB, NTSA and more — in simple language.
            No more confusing government websites or long queues.
          </p>

          {/* Fake chat input */}
          <div className="mt-8 sm:mt-10 mx-auto max-w-xl">
            <div className="relative flex items-center rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/20">
              <input
                type="text"
                readOnly
                placeholder="I lost my ID, what should I do?"
                className="flex-1 bg-transparent py-4 px-5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none cursor-text"
                aria-label="Example service query"
              />
              <button
                className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                aria-label="Send message"
                onClick={handleStartAsking}
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[160px]"
              onClick={handleStartAsking}
            >
              Start Asking
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[160px]"
              onClick={handleBrowseServices}
            >
              Browse Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
