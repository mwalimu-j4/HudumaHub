// ServiceDetailPage — Comprehensive guide for a single government service
import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  Briefcase,
  Car,
  GraduationCap,
  FileText,
  HeartPulse,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  MapPin,
} from "lucide-react";
import type { ServiceData } from "@/lib/services-data";
import { ACCENT_COLORS } from "@/lib/services-data";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  Briefcase,
  Car,
  GraduationCap,
  FileText,
  HeartPulse,
};

interface ServiceDetailPageProps {
  service: ServiceData;
}

export function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  const accent = ACCENT_COLORS[service.category] ?? "#10b981";
  const Icon = ICON_MAP[service.icon] ?? FileText;

  // Checklist state — persisted to localStorage
  const storageKey = `huduma-checklist-${service.slug}`;
  const [checkedItems, setCheckedItems] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved) as number[]) : new Set<number>();
    } catch {
      return new Set<number>();
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...checkedItems]));
  }, [checkedItems, storageKey]);

  const toggleCheck = useCallback((id: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Bookmark
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const bookmarks = JSON.parse(
        localStorage.getItem("huduma-bookmarks") ?? "[]",
      ) as string[];
      return bookmarks.includes(service.slug);
    } catch {
      return false;
    }
  });

  const toggleBookmark = useCallback(() => {
    setBookmarked((prev) => {
      const bookmarks: string[] = JSON.parse(
        localStorage.getItem("huduma-bookmarks") ?? "[]",
      );
      if (prev) {
        const filtered = bookmarks.filter((s: string) => s !== service.slug);
        localStorage.setItem("huduma-bookmarks", JSON.stringify(filtered));
      } else {
        bookmarks.push(service.slug);
        localStorage.setItem("huduma-bookmarks", JSON.stringify(bookmarks));
      }
      return !prev;
    });
  }, [service.slug]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `${service.title} — HudumaHub`,
        text: service.description,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [service]);

  const totalCost = service.costs.reduce((sum, c) => sum + c.amount, 0);
  const completedReqs = checkedItems.size;
  const totalReqs = service.requirements.length;
  const progressPct = totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent}15 0%, transparent 50%)`,
        }}
      >
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-6">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-white">{service.title}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                background: `${accent}20`,
                color: accent,
              }}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {service.title}
              </h1>
              <p className="text-[#9ca3af] mt-1">{service.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleBookmark}
                className="p-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#9ca3af] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors cursor-pointer"
                aria-label="Bookmark"
              >
                {bookmarked ? (
                  <BookmarkCheck
                    className="h-5 w-5"
                    style={{ color: accent }}
                  />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#9ca3af] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors cursor-pointer"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={service.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: accent }}
            >
              Go to Official Portal
              <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              to="/chat"
              search={{ q: `Help me with ${service.title}` }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              Ask AI Assistant
            </Link>
            <Link
              to="/find-centres"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[rgba(255,255,255,0.1)] text-[#9ca3af] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Find Nearest Centre
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        {/* Section 1: Requirements Checklist */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              📋 What You'll Need
            </h2>
            <span className="text-xs text-[#6b7280]">
              {completedReqs}/{totalReqs} ready
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: accent,
              }}
            />
          </div>

          <div className="space-y-2">
            {service.requirements.map((req) => {
              const done = checkedItems.has(req.id);
              return (
                <button
                  key={req.id}
                  onClick={() => toggleCheck(req.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                    done
                      ? "bg-emerald-500/5 border border-emerald-500/20"
                      : "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                >
                  {done ? (
                    <CheckCircle2
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: accent }}
                    />
                  ) : (
                    <Circle className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#4a5568]" />
                  )}
                  <div>
                    <span
                      className={`text-sm ${done ? "text-[#9ca3af] line-through" : "text-white"}`}
                    >
                      {req.icon} {req.text}
                    </span>
                    {req.note && (
                      <p className="text-xs text-[#6b7280] mt-0.5">
                        {req.note}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Step-by-Step Timeline */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-6">
            🗺️ Step-by-Step Guide
          </h2>
          <div className="relative pl-6 border-l-2 border-[rgba(255,255,255,0.06)] space-y-8">
            {service.steps.map((step) => {
              const diffBg =
                step.difficulty === "easy"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : step.difficulty === "medium"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400";
              return (
                <div key={step.step} className="relative">
                  {/* Dot */}
                  <div
                    className="absolute -left-[calc(0.75rem+1.5px)] top-1 h-3 w-3 rounded-full border-2 border-[#0a0f1a]"
                    style={{ background: accent }}
                  />
                  <div className="ml-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-bold uppercase"
                        style={{ color: accent }}
                      >
                        Step {step.step}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${diffBg}`}
                      >
                        {step.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#6b7280]">
                        <Clock className="h-3 w-3" />
                        {step.time}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-white mt-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Cost Breakdown */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-4">
            💰 Cost Breakdown
          </h2>
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {service.costs.map((cost, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <span className="text-sm text-white">{cost.item}</span>
                    {cost.note && (
                      <p className="text-xs text-[#6b7280]">{cost.note}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-white">
                    KES {cost.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between px-4 py-3 font-semibold"
              style={{
                background: `${accent}10`,
                borderTop: `1px solid ${accent}30`,
              }}
            >
              <span className="text-white">Total Estimated Cost</span>
              <span style={{ color: accent }}>
                KES {totalCost.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Section 4: Common Mistakes */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-4">
            ⚠️ Common Mistakes to Avoid
          </h2>
          <div className="space-y-2">
            {service.commonMistakes.map((mistake, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <span className="text-sm text-[#d1d5db]">{mistake}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: FAQ Accordion */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-4">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {service.faq.map((faq, i) => (
              <div
                key={i}
                className="border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium text-white pr-4">
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0 text-[#6b7280]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#6b7280]" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-[#9ca3af] leading-relaxed border-t border-[rgba(255,255,255,0.04)]">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Official Links */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-4">
            🔗 Official Resources
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={service.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-[#6b7280]" />
              <div>
                <p className="text-sm font-medium text-white">
                  Official Website
                </p>
                <p className="text-xs text-[#6b7280] truncate max-w-[200px]">
                  {service.officialUrl}
                </p>
              </div>
            </a>
            <a
              href={service.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-[#6b7280]" />
              <div>
                <p className="text-sm font-medium text-white">Service Portal</p>
                <p className="text-xs text-[#6b7280] truncate max-w-[200px]">
                  {service.portalUrl}
                </p>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
