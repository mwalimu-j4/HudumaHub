import { useMatch } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Hide footer on full-viewport pages
  const isChatPage = useMatch({ from: "/chat", shouldThrow: false });
  const isDashboard = useMatch({ from: "/dashboard", shouldThrow: false });
  const isLogin = useMatch({ from: "/login", shouldThrow: false });
  const hideFooter = isChatPage || isDashboard || isLogin;

  // Chat page needs a fixed viewport (no body scroll, internal scroll only)
  const isFixedViewport = !!isChatPage;

  return (
    <div
      className={
        isFixedViewport
          ? "flex h-svh flex-col overflow-hidden"
          : "flex min-h-svh flex-col"
      }
    >
      <Navbar />
      <main
        className={
          isFixedViewport
            ? "flex min-h-0 flex-1 flex-col"
            : "flex flex-1 flex-col"
        }
      >
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
