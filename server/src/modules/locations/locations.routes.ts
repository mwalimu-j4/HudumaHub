// Locations Routes — /api/locations
import { Router, Request, Response, NextFunction } from "express";
import type { IRouter } from "express";
import {
  findNearestCentres,
  getAllCentres,
  isCurrentlyOpen,
} from "./locations.service.js";

const locationsRouter: IRouter = Router();

/**
 * GET /api/locations/nearest?lat=&lng=&limit=&service=
 * Find nearest Huduma Centres from user coordinates.
 */
locationsRouter.get(
  "/nearest",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({
          success: false,
          error: "lat and lng query parameters are required",
        });
        return;
      }

      // Clamp to Kenya's bounding box for safety
      if (lat < -5 || lat > 5.5 || lng < 33 || lng > 42.5) {
        res.status(400).json({
          success: false,
          error: "Coordinates must be within Kenya's boundaries",
        });
        return;
      }

      const limit = Math.min(
        Math.max(parseInt(req.query.limit as string) || 5, 1),
        20,
      );
      const service = req.query.service as string | undefined;

      const centres = await findNearestCentres(lat, lng, limit, service);

      // Enrich with open/closed status
      const enriched = centres.map((c) => ({
        ...c,
        status: isCurrentlyOpen(c.opening_hours),
      }));

      res.status(200).json({ success: true, data: enriched });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/locations/search?query=
 * Geocode a location name (via Nominatim) and find nearest centres.
 */
locationsRouter.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = ((req.query.query as string) || "").trim();
      if (!query) {
        res.status(400).json({
          success: false,
          error: "query parameter is required",
        });
        return;
      }

      // Geocode using Nominatim (free, no API key)
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=ke&format=json&limit=1`;
      const geoRes = await fetch(url, {
        headers: { "User-Agent": "HudumaHub/1.0 (civic-services-platform)" },
      });

      if (!geoRes.ok) {
        res.status(502).json({
          success: false,
          error: "Geocoding service unavailable",
        });
        return;
      }

      const geoData = (await geoRes.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;

      if (geoData.length === 0) {
        res.status(404).json({
          success: false,
          error: `Location "${query}" not found in Kenya`,
        });
        return;
      }

      const lat = parseFloat(geoData[0].lat);
      const lng = parseFloat(geoData[0].lon);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit as string) || 5, 1),
        20,
      );

      const centres = await findNearestCentres(lat, lng, limit);
      const enriched = centres.map((c) => ({
        ...c,
        status: isCurrentlyOpen(c.opening_hours),
      }));

      res.status(200).json({
        success: true,
        location: {
          name: geoData[0].display_name,
          lat,
          lng,
        },
        data: enriched,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/locations/all
 * Returns all active Huduma Centres for map display.
 */
locationsRouter.get(
  "/all",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const centres = await getAllCentres();
      const enriched = centres.map((c) => ({
        ...c,
        status: isCurrentlyOpen(c.opening_hours),
      }));

      // Set long cache header — this data rarely changes
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).json({ success: true, data: enriched });
    } catch (err) {
      next(err);
    }
  },
);

export default locationsRouter;
