// LocationCard — Inline chat card prompting user to find nearby Huduma Centres
import { useState } from "react";
import {
  MapPin,
  Navigation,
  Loader2,
  Car,
  Footprints,
  ExternalLink,
} from "lucide-react";
import { fetchNearestCentres } from "@/features/locations/api";
import type { HudumaCentre } from "@/features/locations/types";

interface LocationCardProps {
  serviceName?: string;
}

export function LocationCard({ serviceName }: LocationCardProps) {
  const [centres, setCentres] = useState<HudumaCentre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const findNearest = async () => {
    setLoading(true);
    setError(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLoc({ lat, lng });

      const nearest = await fetchNearestCentres(lat, lng, 3);
      setCentres(nearest);
    } catch {
      setError("Could not access your location. Please enable GPS.");
    } finally {
      setLoading(false);
    }
  };

  if (centres.length > 0) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mt-2">
        <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Nearest Huduma Centres
        </h4>
        <div className="space-y-2">
          {centres.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{c.name}</p>
                <p className="text-xs text-[#6b7280]">{c.county}</p>
                {c.distance_km != null && (
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#9ca3af]">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {c.distance_km} km
                    </span>
                    {c.drive_mins != null && (
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" />~{c.drive_mins} min
                      </span>
                    )}
                    {c.walk_mins != null && (
                      <span className="flex items-center gap-1">
                        <Footprints className="h-3 w-3" />~{c.walk_mins} min
                      </span>
                    )}
                  </div>
                )}
              </div>
              {c.status && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    c.status.open
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {c.status.open ? "Open" : "Closed"}
                </span>
              )}
            </div>
          ))}
        </div>
        {userLoc && (
          <a
            href={`/find-centres`}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View all on map
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 mt-2">
      <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {serviceName
          ? `Find a Huduma Centre for ${serviceName}`
          : "Find Your Nearest Huduma Centre"}
      </h4>
      <p className="text-xs text-[#9ca3af] mb-3">
        Enable GPS to see the closest centres with distance and directions.
      </p>
      <button
        onClick={findNearest}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-blue-500/15 border border-blue-500/25 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Finding centres...
          </>
        ) : (
          <>
            <Navigation className="h-3.5 w-3.5" />
            Use My Location
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
