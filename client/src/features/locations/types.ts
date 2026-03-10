// Location types used across the client
export interface HudumaCentre {
  id: string;
  name: string;
  county: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  opening_hours: Record<string, string> | null;
  services_offered: string[] | null;
  distance_km?: number;
  drive_mins?: number;
  walk_mins?: number;
  status?: { open: boolean; nextOpen: string };
}

export interface LocationSearchResult {
  success: boolean;
  location?: { name: string; lat: number; lng: number };
  data: HudumaCentre[];
}
