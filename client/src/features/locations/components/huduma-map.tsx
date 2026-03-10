// HudumaMap — Reusable Leaflet map component with GPS, markers, popups
import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Car,
  Footprints,
  Search,
  Loader2,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { HudumaCentre } from "../types";
import { fetchNearestCentres, searchLocation } from "../api";

// Fix Leaflet's default icon paths for bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
  html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.3);animation:pulse 2s infinite"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface HudumaMapProps {
  centres?: HudumaCentre[];
  serviceFilter?: string;
  className?: string;
  showSidebar?: boolean;
  compact?: boolean;
}

export function HudumaMap({
  centres: externalCentres,
  serviceFilter,
  className = "",
  showSidebar = true,
  compact = false,
}: HudumaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [centres, setCentres] = useState<HudumaCentre[]>(externalCentres ?? []);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "loading" | "success" | "denied"
  >("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [-1.2921, 36.8219], // Nairobi
      zoom: 7,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers when centres change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    centres.forEach((c) => {
      const marker = L.marker([Number(c.latitude), Number(c.longitude)], {
        icon: greenIcon,
      })
        .addTo(map)
        .bindPopup(createPopupHtml(c, userLocation));

      marker.on("click", () => setSelectedCentre(c.id));
      markersRef.current.push(marker);
    });

    // Fit bounds if we have markers
    if (centres.length > 0) {
      const group = L.featureGroup(markersRef.current);
      if (userMarkerRef.current) {
        group.addLayer(userMarkerRef.current);
      }
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [centres, userLocation]);

  // Use external centres if provided
  useEffect(() => {
    if (externalCentres) setCentres(externalCentres);
  }, [externalCentres]);

  const requestGPS = useCallback(async () => {
    setGpsStatus("loading");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLocation({ lat, lng });
      setGpsStatus("success");

      // Place user marker
      const map = mapInstance.current;
      if (map) {
        if (userMarkerRef.current) userMarkerRef.current.remove();
        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>You are here</b>");
        map.setView([lat, lng], 12);
      }

      // Fetch nearest
      const nearest = await fetchNearestCentres(lat, lng, 5, serviceFilter);
      setCentres(nearest);
    } catch {
      setGpsStatus("denied");
    }
  }, [serviceFilter]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      setSearching(true);

      try {
        const result = await searchLocation(searchQuery.trim(), 5);
        if (result.success && result.location) {
          const { lat, lng } = result.location;
          setUserLocation({ lat, lng });
          setGpsStatus("success");

          const map = mapInstance.current;
          if (map) {
            if (userMarkerRef.current) userMarkerRef.current.remove();
            userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
              .addTo(map)
              .bindPopup(`<b>${result.location.name}</b>`);
          }

          setCentres(result.data);
        }
      } catch {
        // silently fail
      } finally {
        setSearching(false);
      }
    },
    [searchQuery],
  );

  const flyToMarker = useCallback((centre: HudumaCentre) => {
    const map = mapInstance.current;
    if (!map) return;

    setSelectedCentre(centre.id);
    map.flyTo([Number(centre.latitude), Number(centre.longitude)], 14, {
      duration: 1,
    });

    // Open the popup
    const marker = markersRef.current.find((m) => {
      const latlng = m.getLatLng();
      return (
        Math.abs(latlng.lat - Number(centre.latitude)) < 0.0001 &&
        Math.abs(latlng.lng - Number(centre.longitude)) < 0.0001
      );
    });
    marker?.openPopup();
  }, []);

  const height = compact ? "h-[300px]" : "h-[calc(100dvh-64px)]";

  return (
    <div className={`flex flex-col lg:flex-row ${height} ${className}`}>
      {/* Sidebar / Bottom sheet */}
      {showSidebar && (
        <div
          className={`${compact ? "hidden" : "order-2 lg:order-1"} w-full lg:w-[320px] bg-[#0d1117] border-t lg:border-t-0 lg:border-r border-[rgba(255,255,255,0.06)] overflow-y-auto flex-shrink-0`}
        >
          {/* Search bar */}
          <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter your town or area..."
                className="flex-1 px-3 py-2 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder:text-[#6b7280] focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="submit"
                disabled={searching}
                className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </form>

            <button
              onClick={requestGPS}
              disabled={gpsStatus === "loading"}
              className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {gpsStatus === "loading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Navigation className="h-3.5 w-3.5" />
              )}
              {gpsStatus === "loading"
                ? "Finding your location..."
                : gpsStatus === "denied"
                  ? "GPS denied — use search above"
                  : "Use My GPS Location"}
            </button>
          </div>

          {/* Centre list */}
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {centres.length === 0 && (
              <div className="p-6 text-center text-sm text-[#6b7280]">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Search or enable GPS to find nearby Huduma Centres
              </div>
            )}
            {centres.map((c) => (
              <button
                key={c.id}
                onClick={() => flyToMarker(c)}
                className={`w-full text-left p-4 hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer ${
                  selectedCentre === c.id
                    ? "bg-emerald-500/5 border-l-2 border-emerald-500"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium text-white">{c.name}</h3>
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
                <p className="text-xs text-[#6b7280] mt-0.5">{c.county}</p>
                {c.distance_km != null && (
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#9ca3af]">
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
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <div className={`${compact ? "" : "order-1 lg:order-2"} flex-1 relative`}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Floating locate button */}
        {!showSidebar && (
          <button
            onClick={requestGPS}
            className="absolute bottom-20 right-3 z-[1000] p-2.5 rounded-full bg-white shadow-lg border border-gray-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            aria-label="Find my location"
          >
            <Navigation className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Build popup HTML for a marker */
function createPopupHtml(
  c: HudumaCentre,
  userLocation: { lat: number; lng: number } | null,
): string {
  const statusBadge = c.status
    ? `<span style="display:inline-block;padding:2px 6px;border-radius:9999px;font-size:10px;font-weight:600;${
        c.status.open
          ? "background:rgba(16,185,129,0.15);color:#10b981"
          : "background:rgba(239,68,68,0.15);color:#ef4444"
      }">${c.status.open ? "Open Now" : "Closed"}</span>`
    : "";

  const distInfo =
    c.distance_km != null
      ? `<div style="margin-top:6px;font-size:12px;color:#6b7280">
           📍 ${c.distance_km} km away
           ${c.drive_mins != null ? `&nbsp; 🚗 ~${c.drive_mins} min` : ""}
           ${c.walk_mins != null ? `&nbsp; 🚶 ~${c.walk_mins} min` : ""}
         </div>`
      : "";

  const phoneLink = c.phone
    ? `<div style="margin-top:4px;font-size:12px">📞 <a href="tel:${c.phone}" style="color:#3b82f6">${c.phone}</a></div>`
    : "";

  const directionsBtn = userLocation
    ? `<a href="https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${c.latitude},${c.longitude}&travelmode=driving" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#10b981;color:white;border-radius:6px;font-size:12px;font-weight:500;text-decoration:none">Get Directions</a>`
    : `<a href="https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#10b981;color:white;border-radius:6px;font-size:12px;font-weight:500;text-decoration:none">View on Maps</a>`;

  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <b style="font-size:14px">${c.name}</b>
      </div>
      ${statusBadge}
      ${c.status && !c.status.open ? `<div style="font-size:10px;color:#9ca3af;margin-top:2px">${c.status.nextOpen}</div>` : ""}
      ${distInfo}
      ${phoneLink}
      <div style="font-size:11px;color:#9ca3af;margin-top:4px">🕐 Mon-Fri 8AM–5PM</div>
      ${directionsBtn}
    </div>
  `;
}
