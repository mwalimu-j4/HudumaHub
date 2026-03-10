import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  Briefcase,
  Car,
  GraduationCap,
  FileText,
  HeartPulse,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { getAllServices, ACCENT_COLORS } from "@/lib/services-data";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  Briefcase,
  Car,
  GraduationCap,
  FileText,
  HeartPulse,
};

export function QuickActionsSection() {
  const services = getAllServices();

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Popular Government Services
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Quick access to the most commonly needed services. Each guide walks
            you through the process step by step.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = ICON_MAP[service.icon] ?? FileText;
            const accent = ACCENT_COLORS[service.category] ?? "#10b981";
            return (
              <div
                key={service.slug}
                className="group relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] backdrop-blur-sm transition-all duration-300 hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)] hover:shadow-lg hover:shadow-black/20"
              >
                {/* Accent top bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
                  }}
                />

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                      style={{ background: `${accent}15`, color: accent }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {service.title}
                    </h3>
                  </div>

                  <p className="text-sm text-[#9ca3af] leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Quick info chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[#6b7280]">
                      {service.steps.length} steps
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[#6b7280]">
                      {service.requirements.length} requirements
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[#6b7280]">
                      ~KES{" "}
                      {service.costs
                        .reduce((s, c) => s + c.amount, 0)
                        .toLocaleString()}
                    </span>
                  </div>

                  {/* Dual buttons */}
                  <div className="flex gap-2">
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                      style={{ background: accent }}
                    >
                      View Guide
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                    <a
                      href={service.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[rgba(255,255,255,0.1)] text-[#9ca3af] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors"
                    >
                      Official
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
