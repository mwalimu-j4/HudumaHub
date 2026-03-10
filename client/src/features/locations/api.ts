// Location API calls
import type { HudumaCentre, LocationSearchResult } from "./types";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://huduma-jqiq.onrender.com/api";

export async function fetchNearestCentres(
  lat: number,
  lng: number,
  limit = 5,
  service?: string,
): Promise<HudumaCentre[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    limit: String(limit),
  });
  if (service) params.set("service", service);

  const res = await fetch(`${API_BASE}/locations/nearest?${params}`);
  if (!res.ok) return [];
  const json = (await res.json()) as { success: boolean; data: HudumaCentre[] };
  return json.data ?? [];
}

export async function searchLocation(
  query: string,
  limit = 5,
): Promise<LocationSearchResult> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  const res = await fetch(`${API_BASE}/locations/search?${params}`);
  if (!res.ok) return { success: false, data: [] };
  return res.json() as Promise<LocationSearchResult>;
}

export async function fetchAllCentres(): Promise<HudumaCentre[]> {
  const res = await fetch(`${API_BASE}/locations/all`);
  if (!res.ok) return [];
  const json = (await res.json()) as { success: boolean; data: HudumaCentre[] };
  return json.data ?? [];
}
