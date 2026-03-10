// Analytics Service — Track query events for insights
import { pool } from "../../lib/db-pool.js";

/**
 * Log a query event for analytics.
 */
export async function logQueryEvent(
  questionHash: string,
  cacheHit: boolean,
  latencyMs: number,
  serviceCategory: string,
  userId?: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO analytics.query_events
     (user_id, question_hash, cache_hit, response_latency_ms, service_category)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId ?? null, questionHash, cacheHit, latencyMs, serviceCategory],
  );
}
