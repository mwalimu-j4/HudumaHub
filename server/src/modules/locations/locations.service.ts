// Locations Service — Huduma Centre queries with distance calculation
import { pool } from "../../lib/db-pool.js";

export interface HudumaCentre {
  id: string;
  name: string;
  county: string;
  sub_county: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  opening_hours: Record<string, string> | null;
  services_offered: string[] | null;
  is_active: boolean;
  google_maps_url: string | null;
  distance_km?: number;
  drive_mins?: number;
  walk_mins?: number;
}

/** Haversine formula — distance between two lat/lng points in km */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/** Estimate drive time (avg 30 km/h Kenya urban) */
function estimateDriveMins(distKm: number): number {
  return Math.round((distKm / 30) * 60);
}

/** Estimate walk time (avg 5 km/h) */
function estimateWalkMins(distKm: number): number {
  return Math.round((distKm / 5) * 60);
}

/** Enrich a centre row with distance/time estimates from user location */
function enrichWithDistance(
  centre: HudumaCentre,
  userLat: number,
  userLng: number,
): HudumaCentre {
  const dist = haversineKm(
    userLat,
    userLng,
    Number(centre.latitude),
    Number(centre.longitude),
  );
  return {
    ...centre,
    distance_km: dist,
    drive_mins: estimateDriveMins(dist),
    walk_mins: estimateWalkMins(dist),
  };
}

/**
 * Find nearest Huduma Centres to user's coordinates.
 */
export async function findNearestCentres(
  userLat: number,
  userLng: number,
  limit = 5,
  serviceFilter?: string,
): Promise<HudumaCentre[]> {
  let query = `SELECT * FROM locations.huduma_centres WHERE is_active = true`;
  const params: unknown[] = [];

  if (serviceFilter) {
    params.push(serviceFilter);
    query += ` AND $${params.length} = ANY(services_offered)`;
  }

  const result = await pool.query(query, params);
  const centres = result.rows as HudumaCentre[];

  // Calculate distance and sort
  const enriched = centres.map((c) => enrichWithDistance(c, userLat, userLng));
  enriched.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

  return enriched.slice(0, limit);
}

/**
 * Get all active Huduma Centres (for map display).
 */
export async function getAllCentres(): Promise<HudumaCentre[]> {
  const result = await pool.query(
    `SELECT * FROM locations.huduma_centres WHERE is_active = true ORDER BY name`,
  );
  return result.rows as HudumaCentre[];
}

/**
 * Check if a centre is currently open based on Kenyan time (UTC+3).
 */
export function isCurrentlyOpen(openingHours: Record<string, string> | null): {
  open: boolean;
  nextOpen: string;
} {
  if (!openingHours) return { open: false, nextOpen: "Unknown" };

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }),
  );
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayKey = days[now.getDay()];
  const hours = openingHours[dayKey];

  if (!hours || hours === "closed") {
    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const nextDay = days[(now.getDay() + i) % 7];
      const nextHours = openingHours[nextDay];
      if (nextHours && nextHours !== "closed") {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        return {
          open: false,
          nextOpen: `Opens ${dayNames[(now.getDay() + i) % 7]} at ${nextHours.split("-")[0]}`,
        };
      }
    }
    return { open: false, nextOpen: "Unknown" };
  }

  const [openTime, closeTime] = hours.split("-");
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  if (currentMins >= openMins && currentMins < closeMins) {
    return { open: true, nextOpen: `Closes at ${closeTime}` };
  }

  if (currentMins < openMins) {
    return { open: false, nextOpen: `Opens today at ${openTime}` };
  }

  // After closing — find next open day
  for (let i = 1; i <= 7; i++) {
    const nextDay = days[(now.getDay() + i) % 7];
    const nextHours = openingHours[nextDay];
    if (nextHours && nextHours !== "closed") {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return {
        open: false,
        nextOpen: `Opens ${dayNames[(now.getDay() + i) % 7]} at ${nextHours.split("-")[0]}`,
      };
    }
  }

  return { open: false, nextOpen: "Unknown" };
}
