// Empty Chat State — Groundbreaking redesigned landing for /chat
import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  FileText,
  Car,
  Landmark,
  GraduationCap,
  HeartPulse,
  Shield,
  Flame,
} from "lucide-react";
import { fetchTrendingQuestions } from "../api";
import type { TrendingQuestion } from "../types";

// Service card definitions with category-based accent colors
const serviceCards = [
  {
    icon: FileText,
    label: "Get a National ID",
    description: "Apply for or replace your Kenyan national identity card",
    prompt: "How do I apply for a National ID card in Kenya?",
    accent: "emerald" as const,
  },
  {
    icon: Landmark,
    label: "KRA PIN Registration",
    description: "Register for your tax PIN on the iTax portal",
    prompt: "How do I register for a KRA PIN on iTax?",
    accent: "cyan" as const,
  },
  {
    icon: Car,
    label: "Driving License",
    description: "Get your smart driving license via NTSA TIMS",
    prompt: "What's the process for getting a driving license in Kenya?",
    accent: "emerald" as const,
  },
  {
    icon: GraduationCap,
    label: "HELB Loan",
    description: "Apply for higher education student loan funding",
    prompt: "How do I apply for a HELB student loan?",
    accent: "violet" as const,
  },
  {
    icon: HeartPulse,
    label: "NHIF/SHA Registration",
    description: "Enroll in the Social Health Authority insurance",
    prompt: "How do I register for SHA (formerly NHIF)?",
    accent: "cyan" as const,
  },
  {
    icon: Shield,
    label: "Passport Application",
    description: "Apply for a Kenyan e-Passport online via eCitizen",
    prompt: "What documents do I need for a Kenyan e-Passport?",
    accent: "emerald" as const,
  },
];

const accentStyles = {
  emerald: {
    border: "border-l-emerald-500/60",
    hoverBorder: "hover:border-l-emerald-400",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]",
    iconColor: "text-emerald-400",
  },
  cyan: {
    border: "border-l-cyan-500/60",
    hoverBorder: "hover:border-l-cyan-400",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]",
    iconColor: "text-cyan-400",
  },
  violet: {
    border: "border-l-violet-500/60",
    hoverBorder: "hover:border-l-violet-400",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.12)]",
    iconColor: "text-violet-400",
  },
};

interface EmptyChatProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyChat({ onSelectPrompt }: EmptyChatProps) {
  const [trending, setTrending] = useState<TrendingQuestion[]>([]);

  useEffect(() => {
    fetchTrendingQuestions(5)
      .then(setTrending)
      .catch(() => {});
  }, []);

  const handleCardClick = useCallback(
    (prompt: string, e: React.MouseEvent<HTMLButtonElement>) => {
      // Ripple effect
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      ripple.className = "huduma-ripple";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      setTimeout(() => onSelectPrompt(prompt), 150);
    },
    [onSelectPrompt],
  );

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-6 sm:py-10 overflow-y-auto huduma-fade-in">
      {/* Animated Bot Avatar */}
      <div className="relative mb-6">
        <div className="huduma-pulse-ring absolute inset-0 rounded-full" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#0a1a0f] border border-emerald-500/30">
          <Bot className="h-8 w-8 text-emerald-400" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight huduma-gradient-text">
        HudumaHub Assistant
      </h2>
      <p className="mb-8 text-sm text-[#9ca3af] max-w-md text-center">
        Your AI-powered guide to Kenyan government services
      </p>

      {/* Two-column layout: Services + Trending */}
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* LEFT: Quick Services Panel */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-3 px-1">
            Quick Services
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceCards.map((card) => {
              const styles = accentStyles[card.accent];
              return (
                <button
                  key={card.label}
                  onClick={(e) => handleCardClick(card.prompt, e)}
                  className={`
                    group relative overflow-hidden text-left rounded-xl p-4
                    border-l-[3px] ${styles.border} ${styles.hoverBorder}
                    bg-[rgba(255,255,255,0.03)] backdrop-blur-[8px]
                    border border-[rgba(255,255,255,0.07)]
                    transition-all duration-200 ease-out
                    hover:-translate-y-[2px] ${styles.hoverShadow}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40
                    cursor-pointer
                  `}
                >
                  <card.icon className={`h-5 w-5 ${styles.iconColor} mb-2`} />
                  <div className="text-sm font-semibold text-white mb-0.5">
                    {card.label}
                  </div>
                  <div className="text-xs text-[#6b7280] leading-relaxed">
                    {card.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Trending Questions Panel (hidden on mobile) */}
        <div className="hidden lg:block w-72 shrink-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-3 px-1 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            Kenyans are asking...
          </h3>
          <div className="flex flex-col gap-2">
            {(trending.length > 0
              ? trending
              : [
                  {
                    question_text: "How do I apply for a National ID?",
                    category: "national_id",
                    hit_count: 0,
                  },
                  {
                    question_text: "How to register for KRA PIN?",
                    category: "kra_pin",
                    hit_count: 0,
                  },
                  {
                    question_text: "What documents for a Kenyan passport?",
                    category: "passport",
                    hit_count: 0,
                  },
                  {
                    question_text: "How to apply for HELB loan?",
                    category: "helb",
                    hit_count: 0,
                  },
                  {
                    question_text: "How to register for SHA?",
                    category: "nhif_sha",
                    hit_count: 0,
                  },
                ]
            ).map((q, i) => (
              <button
                key={i}
                onClick={() => onSelectPrompt(q.question_text)}
                className="
                  text-left text-sm px-3 py-2.5 rounded-lg
                  bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]
                  text-[#d1d5db] hover:text-white
                  hover:bg-[rgba(16,185,129,0.08)] hover:border-emerald-500/20
                  transition-all duration-150 cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40
                "
              >
                {q.question_text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
