import { useState } from "react";
import { Link, useMatch, useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HudumaHubLogo } from "@/components/layout/logo";
import { useAuth, UserMenu } from "@/features/auth";

const navLinks = [
  { label: "Services", href: "/" },
  { label: "Find Centres", href: "/find-centres" },
  { label: "AI Assistant", href: "/chat" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const isLandingPage = useMatch({ from: "/", shouldThrow: false });

  const handleLoginClick = () => {
    login();
  };

  const handleGetStarted = () => {
    void navigate({ to: "/login" });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        isLandingPage
          ? "border-b border-white/10 bg-transparent backdrop-blur-sm"
          : "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <HudumaHubLogo size={32} />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-sm font-medium transition-colors ${
                isLandingPage
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoginClick}
                className={
                  isLandingPage
                    ? "border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white"
                    : ""
                }
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={handleGetStarted}
                className={
                  isLandingPage
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : ""
                }
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
              <SheetHeader>
                <SheetTitle>
                  <HudumaHubLogo size={28} />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <nav
                  className="flex flex-col gap-3"
                  aria-label="Mobile navigation"
                >
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className="text-base font-medium text-foreground py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <Separator />
                <div className="flex flex-col gap-3 px-3">
                  {isAuthenticated ? (
                    <Button
                      className="w-full"
                      onClick={() => {
                        void navigate({ to: "/dashboard" });
                        setOpen(false);
                      }}
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          handleLoginClick();
                          setOpen(false);
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => {
                          handleGetStarted();
                          setOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
