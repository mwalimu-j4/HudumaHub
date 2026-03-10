// Find Huduma Centres — Map-based location page
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const HudumaMap = lazy(() =>
  import("@/features/locations").then((mod) => ({
    default: mod.HudumaMap,
  })),
);

export const Route = createFileRoute("/find-centres")({
  component: FindCentresPage,
});

function FindCentresPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-[#6b7280]">Loading Map...</p>
          </div>
        </div>
      }
    >
      <HudumaMap />
    </Suspense>
  );
}
