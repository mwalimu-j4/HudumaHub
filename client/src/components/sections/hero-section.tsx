import { useState, type KeyboardEvent } from "react";
import { SendHorizonal, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function HeroSection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleStartAsking = () => {
    const trimmed = query.trim();
    if (trimmed) {
      void navigate({ to: "/chat", search: { q: trimmed } });
    } else {
      void navigate({ to: "/chat" });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleStartAsking();
    }
  };

  const handleBrowseServices = () => {
    toast.info("Services directory coming soon!", {
      description:
        "We're compiling all Kenyan government services for easy access.",
    });
  };

  return (
    <section className="relative -mt-16 h-screen min-h-[600px] max-h-[1000px] w-full overflow-hidden">
      {/* Background Video — bottom layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        aria-hidden="true"
      >
        <source src="/kenya flag.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlay — middle layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90 z-[1]" />

      {/* Subtle radial accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,rgba(0,128,0,0.12)_0%,transparent_60%)] z-[1]" />

      {/* Content — top layer */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white/80 tracking-wide">
              🇰🇪 Built for Kenyan Citizens
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
              Your Smart Guide to{" "}
              <span className="text-green-400">Kenyan Public Services</span>
            </h1>

            {/* Subtext */}
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
              Ask about IDs, KRA, NHIF, HELB, NTSA and more — in simple
              language. No more confusing government websites or long queues.
            </p>

            {/* Chat input */}
            <div className="mt-8 sm:mt-10 mx-auto max-w-xl">
              <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl transition-all hover:border-white/20 focus-within:border-green-400/40 focus-within:ring-1 focus-within:ring-green-400/20">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... e.g. How do I get a National ID?"
                  className="flex-1 bg-transparent py-4 px-5 text-sm sm:text-base text-white placeholder:text-white/40 outline-none"
                  aria-label="Ask about Kenyan government services"
                />
                <button
                  className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20"
                  aria-label="Send message"
                  onClick={handleStartAsking}
                >
                  <SendHorizonal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto min-w-[180px] bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/25 transition-all"
                onClick={handleStartAsking}
              >
                Start Asking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-w-[180px] border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all"
                onClick={handleBrowseServices}
              >
                Browse Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
