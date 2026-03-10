// Cache Service — Semantic response caching with SHA-256 question hashing
// Uses cache schema in PostgreSQL for instant responses to repeated questions

import { createHash } from "crypto";
import { pool } from "../../lib/db-pool.js";

/** Normalize a question: lowercase, trim, strip punctuation */
function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

/** SHA-256 hash of the normalized question */
function hashQuestion(question: string): string {
  const normalized = normalizeQuestion(question);
  return createHash("sha256").update(normalized).digest("hex");
}

/** Service categories and their keyword patterns */
const CATEGORY_PATTERNS: Array<[string, RegExp]> = [
  ["national_id", /\b(national\s*id|id\s*card|kitambulisho)\b/i],
  ["kra_pin", /\b(kra|itax|pin|tax)\b/i],
  ["passport", /\b(passport|e-?passport|immigration)\b/i],
  [
    "driving_license",
    /\b(driv(ing|er'?s?)\s*licen[cs]e|smart\s*dl|ntsa|tims)\b/i,
  ],
  ["helb", /\b(helb|student\s*loan|education\s*loan)\b/i],
  ["nhif_sha", /\b(nhif|sha|health\s*insurance|social\s*health)\b/i],
  ["birth_certificate", /\b(birth\s*cert(ificate)?)\b/i],
  ["business_registration", /\b(business\s*reg|brs|company\s*reg)\b/i],
  ["land_title", /\b(title\s*deed|land|nlc|ministry\s*of\s*lands)\b/i],
  ["ecitizen", /\b(ecitizen|e-?citizen)\b/i],
];

/** Detect the service category from a question */
export function detectCategory(question: string): string {
  for (const [category, pattern] of CATEGORY_PATTERNS) {
    if (pattern.test(question)) return category;
  }
  return "general";
}

export interface CachedResponse {
  answer_text: string;
  structured_data: unknown;
  service_category: string;
}

export interface CacheResult {
  answer: string;
  structuredData: unknown;
  fromCache: boolean;
  category: string;
}

/**
 * Check cache for a question. Returns null on miss.
 */
export async function checkCache(
  question: string,
): Promise<CachedResponse | null> {
  const hash = hashQuestion(question);

  const result = await pool.query(
    `SELECT answer_text, structured_data, service_category
     FROM cache.response_cache
     WHERE question_hash = $1
       AND (expires_at IS NULL OR expires_at > now())`,
    [hash],
  );

  if (result.rows.length === 0) return null;

  // Update hit count
  await pool.query(
    `UPDATE cache.response_cache
     SET hit_count = hit_count + 1, last_hit_at = now()
     WHERE question_hash = $1`,
    [hash],
  );

  return result.rows[0] as CachedResponse;
}

/**
 * Store a response in the cache.
 */
export async function storeInCache(
  question: string,
  answerText: string,
  structuredData: unknown,
  category?: string,
): Promise<void> {
  const hash = hashQuestion(question);
  const serviceCategory = category ?? detectCategory(question);

  await pool.query(
    `INSERT INTO cache.response_cache
     (question_hash, question_text, answer_text, structured_data, service_category)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (question_hash) DO UPDATE SET
       answer_text = EXCLUDED.answer_text,
       structured_data = EXCLUDED.structured_data,
       hit_count = cache.response_cache.hit_count + 1,
       last_hit_at = now()`,
    [
      hash,
      question,
      answerText,
      JSON.stringify(structuredData),
      serviceCategory,
    ],
  );

  // Update trending
  await refreshTrending(question, serviceCategory);
}

/**
 * Update trending questions after a cache interaction.
 */
async function refreshTrending(
  question: string,
  category: string,
): Promise<void> {
  const shortQuestion = question.slice(0, 255);
  await pool.query(
    `INSERT INTO cache.trending_questions (question_text, hit_count, category, last_updated)
     VALUES ($1, 1, $2, now())
     ON CONFLICT DO NOTHING`,
    [shortQuestion, category],
  );
}

/**
 * Get trending questions (top N by hit count).
 */
export async function getTrendingQuestions(
  limit = 5,
): Promise<
  Array<{ question_text: string; hit_count: number; category: string }>
> {
  const result = await pool.query(
    `SELECT DISTINCT ON (service_category) question_text, hit_count, service_category as category
     FROM cache.response_cache
     WHERE hit_count >= 1
     ORDER BY service_category, hit_count DESC
     LIMIT $1`,
    [limit],
  );

  // If not enough distinct categories, fill from top hits overall
  if (result.rows.length < limit) {
    const fallback = await pool.query(
      `SELECT question_text, hit_count, service_category as category
       FROM cache.response_cache
       ORDER BY hit_count DESC
       LIMIT $1`,
      [limit],
    );
    return fallback.rows as Array<{
      question_text: string;
      hit_count: number;
      category: string;
    }>;
  }

  return result.rows as Array<{
    question_text: string;
    hit_count: number;
    category: string;
  }>;
}

/**
 * Get the question hash for analytics.
 */
export function getQuestionHash(question: string): string {
  return hashQuestion(question);
}
