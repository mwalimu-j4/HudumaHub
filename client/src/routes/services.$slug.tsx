// Service Detail Route — /services/:slug
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ServiceDetailPage } from "@/features/services";
import { getServiceBySlug } from "@/lib/services-data";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getServiceBySlug(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  component: ServicePage,
  notFoundComponent: () => (
    <div className="flex flex-1 items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Service Not Found
        </h2>
        <p className="text-[#6b7280] mb-4">
          The service you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="text-emerald-400 hover:text-emerald-300 underline"
        >
          Back to Home
        </a>
      </div>
    </div>
  ),
});

function ServicePage() {
  const { service } = Route.useLoaderData();
  return <ServiceDetailPage service={service} />;
}
