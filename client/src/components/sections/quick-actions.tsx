import {
  CreditCard,
  Briefcase,
  Car,
  GraduationCap,
  FileText,
  HeartPulse,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const quickActions = [
  {
    icon: CreditCard,
    title: "National ID",
    description:
      "Apply for a new ID or replace a lost one. Step-by-step guidance.",
    action: "Learn More",
  },
  {
    icon: Briefcase,
    title: "Start a Business",
    description: "Register your business with the Registrar of Companies.",
    action: "Get Started",
  },
  {
    icon: Car,
    title: "Driving License",
    description: "Apply for, renew, or replace your driving license via NTSA.",
    action: "Learn More",
  },
  {
    icon: GraduationCap,
    title: "HELB Loans",
    description: "Apply for HELB student loans and check repayment status.",
    action: "Apply Now",
  },
  {
    icon: FileText,
    title: "KRA Returns",
    description: "File your annual tax returns on the iTax portal made simple.",
    action: "File Now",
  },
  {
    icon: HeartPulse,
    title: "NHIF / SHA",
    description:
      "Register for health insurance and check your coverage status.",
    action: "Register",
  },
];

export function QuickActionsSection() {
  const handleAction = (title: string) => {
    toast.info(`${title} guide coming soon!`, {
      description: "We're preparing detailed step-by-step instructions.",
    });
  };

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
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4 leading-relaxed">
                    {item.description}
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAction(item.title)}
                  >
                    {item.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
