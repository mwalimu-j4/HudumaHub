// Dashboard Route — Protected, requires authentication
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/features/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  MessageSquare,
  FileText,
  Landmark,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void navigate({ to: "/login", search: { redirect: "/dashboard" } });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  const handleLogout = async () => {
    await logout();
    void navigate({ to: "/" });
  };

  const quickActions = [
    {
      icon: MessageSquare,
      label: "AI Assistant",
      description: "Ask about government services",
      href: "/chat",
    },
    {
      icon: FileText,
      label: "My Documents",
      description: "Track your applications",
      href: "/dashboard",
    },
    {
      icon: Landmark,
      label: "Services",
      description: "Browse all services",
      href: "/",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              {user.image && (
                <AvatarImage src={user.image} alt={user.name ?? ""} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome, {user.name?.split(" ")[0] ?? "Citizen"}!
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1">
                {user.role === "ADMIN" ? (
                  <>
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </>
                ) : (
                  "Citizen"
                )}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            className="shrink-0"
            onClick={() => void handleLogout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5"
              onClick={() => void navigate({ to: action.href })}
            >
              <CardHeader className="pb-2">
                <action.icon className="h-6 w-6 text-primary" />
                <CardTitle className="text-base">{action.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Content Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Dashboard</CardTitle>
            <CardDescription>
              Welcome to your HudumaHub dashboard. This is your personal hub for
              managing government service requests, tracking applications, and
              accessing the AI assistant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <Landmark className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                More features coming soon
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Service tracking, document management, and notifications
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
