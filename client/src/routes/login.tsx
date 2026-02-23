// Login Route
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleButton, useAuth } from "@/features/auth";
import { HudumaHubLogo } from "@/components/layout/logo";

type LoginSearch = { error?: string; redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    error: typeof search.error === "string" ? search.error : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { error } = Route.useSearch();

  // Show error toast from OAuth callback
  useEffect(() => {
    if (error === "disabled") {
      toast.error("Account Disabled", {
        description:
          "Your account has been disabled. Contact the administrator.",
      });
    } else if (error === "auth_failed") {
      toast.error("Authentication Failed", {
        description: "Could not sign in with Google. Please try again.",
      });
    }
  }, [error]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            <HudumaHubLogo size={48} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              Welcome to HudumaHub
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to access your civic services dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google OAuth Button */}
          <GoogleButton />

          {/* Security notice */}
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-xs font-medium">
                Secure Government-Grade Login
              </p>
              <p className="text-xs text-muted-foreground">
                Your data is protected with enterprise-level encryption. We only
                access your name, email, and profile picture.
              </p>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to HudumaHub's{" "}
            <span className="underline underline-offset-4 hover:text-foreground cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-4 hover:text-foreground cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
