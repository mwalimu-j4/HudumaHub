import { ShieldCheck, Lock, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Independent Platform",
    description:
      "HudumaHub is an independent civic technology platform providing information and guidance.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "We don't collect personal government data. Your privacy is our priority.",
  },
  {
    icon: Eye,
    title: "Open Source",
    description:
      "Our code is open source and transparent. Anyone can audit, contribute, or verify.",
  },
];

export function TrustSection() {
  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Built on Trust & Transparency
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            We believe civic tools should be open, secure, and accessible to
            everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center px-4"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <Separator className="my-10 max-w-2xl mx-auto" />

        {/* Disclaimer */}
        <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-4 sm:p-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Disclaimer:</strong> HudumaHub
            is an independent civic platform and is{" "}
            <strong className="text-foreground">
              not officially affiliated
            </strong>{" "}
            with the Government of Kenya. Information provided is for guidance
            purposes only. Always verify with official government sources.
          </p>
        </div>
      </div>
    </section>
  );
}
