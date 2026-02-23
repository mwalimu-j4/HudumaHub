import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Layout } from "@/app/layout";
import { AuthProvider } from "@/features/auth";

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster position="bottom-right" richColors closeButton />
    </AuthProvider>
  ),
});
