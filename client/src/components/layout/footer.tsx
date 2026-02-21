import { Separator } from "@/components/ui/separator";
import { HudumaHubLogo } from "@/components/layout/logo";
import { Github } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "About", href: "#" },
    { label: "Services", href: "#" },
    { label: "How It Works", href: "#" },
    { label: "FAQs", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Disclaimer", href: "#" },
  ],
  community: [
    { label: "Open Source", href: "https://github.com/mwalimu-j4/HudumaHub" },
    { label: "Contribute", href: "https://github.com/mwalimu-j4/HudumaHub" },
    {
      label: "Report an Issue",
      href: "https://github.com/mwalimu-j4/HudumaHub/issues",
    },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <HudumaHubLogo size={28} />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your smart guide to Kenyan public services. Simple, accessible,
              and built for every citizen.
            </p>
            <a
              href="https://github.com/mwalimu-j4/HudumaHub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="h-4 w-4" />
              <span>View on GitHub</span>
            </a>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HudumaHub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            An independent civic platform. Not affiliated with the Government of
            Kenya.
          </p>
        </div>
      </div>
    </footer>
  );
}
