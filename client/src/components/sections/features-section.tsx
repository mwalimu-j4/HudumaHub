import { ListChecks, Wifi, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: ListChecks,
    title: "Simple Step-by-Step Guides",
    description:
      "Every government process broken down into clear, numbered steps. No jargon, no confusion — just simple instructions anyone can follow.",
  },
  {
    icon: Wifi,
    title: "Works Even with Low Internet",
    description:
      "Designed as a Progressive Web App (PWA) that works offline. Access guides and saved information anytime, even without reliable connectivity.",
  },
  {
    icon: Timer,
    title: "Saves Time & Transport Costs",
    description:
      "Know exactly what documents you need and where to go before leaving home. No more wasted trips or surprise requirements.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why HudumaHub?
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Built with the everyday Kenyan in mind. Accessible, reliable, and
            always free.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="text-center border-none bg-card/60 shadow-none"
              >
                <CardContent className="pt-6 pb-6 px-6 flex flex-col items-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
