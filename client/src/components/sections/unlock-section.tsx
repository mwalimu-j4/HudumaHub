import { Bookmark, Bell, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const perks = [
  { icon: Bookmark, label: "Save services for quick access" },
  { icon: Bell, label: "Set reminders for deadlines" },
  { icon: BarChart3, label: "Track your application progress" },
  { icon: Sparkles, label: "Get personalized suggestions" },
];

export function UnlockSection() {
  const handleCreateAccount = () => {
    toast.success("Registration coming soon!", {
      description: "We're building a secure authentication system.",
    });
  };

  const handleLogin = () => {
    toast.info("Login feature coming soon!", {
      description: "We're working on authentication.",
    });
  };

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-secondary/50 p-6 sm:p-10 md:p-14 text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Free to use
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Unlock Advanced Features
          </h2>

          {/* Subtext */}
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Create a free account to personalize your experience and never miss
            an important deadline.
          </p>

          {/* Perks Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-foreground">{perk.label}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[160px]"
              onClick={handleCreateAccount}
            >
              Create Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[160px]"
              onClick={handleLogin}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
