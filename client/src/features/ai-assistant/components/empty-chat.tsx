// Empty Chat State — Shown when no messages exist
import {
  Bot,
  FileText,
  Car,
  Landmark,
  GraduationCap,
  HeartPulse,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const quickPrompts = [
  {
    icon: FileText,
    label: "Get a National ID",
    prompt: "How do I apply for a National ID card in Kenya?",
  },
  {
    icon: Landmark,
    label: "KRA PIN Registration",
    prompt: "How do I register for a KRA PIN on iTax?",
  },
  {
    icon: Car,
    label: "Driving License",
    prompt: "What's the process for getting a driving license in Kenya?",
  },
  {
    icon: GraduationCap,
    label: "HELB Loan",
    prompt: "How do I apply for a HELB student loan?",
  },
  {
    icon: HeartPulse,
    label: "NHIF/SHA Registration",
    prompt: "How do I register for SHA (formerly NHIF)?",
  },
  {
    icon: Shield,
    label: "Passport Application",
    prompt: "What documents do I need for a Kenyan e-Passport?",
  },
];

interface EmptyChatProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyChat({ onSelectPrompt }: EmptyChatProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          HudumaHub Assistant
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Your AI-powered guide to Kenyan government services. Ask me about IDs,
          taxes, licenses, education loans, and more.
        </p>
      </div>

      {/* Quick Prompts */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickPrompts.map((item) => (
          <Button
            key={item.label}
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary/50 hover:bg-primary/5"
            onClick={() => onSelectPrompt(item.prompt)}
          >
            <item.icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
