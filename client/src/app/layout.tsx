import { useMatch } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Hide footer on the chat page so chat fills the viewport
  const isChatPage = useMatch({ from: "/chat", shouldThrow: false });

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      {!isChatPage && <Footer />}
    </div>
  );
}
