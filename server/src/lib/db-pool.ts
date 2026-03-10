// Raw PostgreSQL client for split-schema queries
// Prisma handles public schema; pg Pool handles conversations, cache, analytics schemas

import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  ssl:
    env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error:", err);
});

/** Run once on startup — creates split schemas + tables if missing */
async function initializeSchemas(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- Schemas
      CREATE SCHEMA IF NOT EXISTS conversations;
      CREATE SCHEMA IF NOT EXISTS cache;
      CREATE SCHEMA IF NOT EXISTS analytics;
      CREATE SCHEMA IF NOT EXISTS locations;

      -- conversations.threads
      CREATE TABLE IF NOT EXISTS conversations.threads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        title VARCHAR(100) DEFAULT 'New Conversation',
        session_id TEXT NOT NULL,
        model VARCHAR(50) DEFAULT 'llama-3.3-70b-versatile',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        is_archived BOOLEAN DEFAULT false
      );
      CREATE INDEX IF NOT EXISTS idx_threads_session_id ON conversations.threads(session_id);
      CREATE INDEX IF NOT EXISTS idx_threads_created_at ON conversations.threads(created_at DESC);

      -- conversations.messages
      CREATE TABLE IF NOT EXISTS conversations.messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        thread_id UUID NOT NULL REFERENCES conversations.threads(id) ON DELETE CASCADE,
        role VARCHAR(10) NOT NULL CHECK (role IN ('user','assistant','system')),
        content TEXT NOT NULL,
        structured_data JSONB,
        tokens_used INTEGER,
        duration_ms INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON conversations.messages(thread_id);

      -- cache.response_cache
      CREATE TABLE IF NOT EXISTS cache.response_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_hash VARCHAR(64) UNIQUE NOT NULL,
        question_text TEXT NOT NULL,
        answer_text TEXT NOT NULL,
        structured_data JSONB,
        service_category VARCHAR(50),
        hit_count INTEGER DEFAULT 1,
        last_hit_at TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now(),
        expires_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_cache_question_hash ON cache.response_cache(question_hash);
      CREATE INDEX IF NOT EXISTS idx_cache_hit_count ON cache.response_cache(hit_count DESC);

      -- cache.trending_questions
      CREATE TABLE IF NOT EXISTS cache.trending_questions (
        id SERIAL PRIMARY KEY,
        question_text VARCHAR(255) NOT NULL,
        hit_count INTEGER DEFAULT 1,
        category VARCHAR(50),
        last_updated TIMESTAMPTZ DEFAULT now()
      );

      -- analytics.query_events
      CREATE TABLE IF NOT EXISTS analytics.query_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        question_hash VARCHAR(64),
        cache_hit BOOLEAN DEFAULT false,
        response_latency_ms INTEGER,
        service_category VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- locations.huduma_centres
      CREATE TABLE IF NOT EXISTS locations.huduma_centres (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        county VARCHAR(100) NOT NULL,
        sub_county VARCHAR(100),
        latitude DECIMAL(10,7) NOT NULL,
        longitude DECIMAL(10,7) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        opening_hours JSONB,
        services_offered TEXT[],
        is_active BOOLEAN DEFAULT true,
        google_maps_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      -- locations.user_bookmarks
      CREATE TABLE IF NOT EXISTS locations.user_bookmarks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        service_slug VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, service_slug)
      );

      -- Auto-update trigger for threads
      CREATE OR REPLACE FUNCTION conversations.update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = now(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
      DROP TRIGGER IF EXISTS trg_threads_updated_at ON conversations.threads;
      CREATE TRIGGER trg_threads_updated_at
        BEFORE UPDATE ON conversations.threads
        FOR EACH ROW EXECUTE FUNCTION conversations.update_updated_at();
    `);
    console.log("✅ Split schemas initialized");
  } catch (err) {
    console.error("⚠️  Schema init error (non-fatal):", (err as Error).message);
  } finally {
    client.release();
  }
}

// Seed huduma centres if table is empty
async function seedHudumaCentres(): Promise<void> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT COUNT(*) as cnt FROM locations.huduma_centres",
    );
    if (Number(rows[0].cnt) > 0) return;

    const centres = [
      {
        name: "Huduma Centre Nairobi GPO",
        county: "Nairobi",
        lat: -1.2832,
        lng: 36.8172,
      },
      {
        name: "Huduma Centre Mombasa",
        county: "Mombasa",
        lat: -4.0435,
        lng: 39.6682,
      },
      {
        name: "Huduma Centre Kisumu",
        county: "Kisumu",
        lat: -0.0917,
        lng: 34.768,
      },
      {
        name: "Huduma Centre Nakuru",
        county: "Nakuru",
        lat: -0.3031,
        lng: 36.08,
      },
      {
        name: "Huduma Centre Eldoret",
        county: "Uasin Gishu",
        lat: 0.5143,
        lng: 35.2698,
      },
      {
        name: "Huduma Centre Nyeri",
        county: "Nyeri",
        lat: -0.4167,
        lng: 36.95,
      },
      {
        name: "Huduma Centre Thika",
        county: "Kiambu",
        lat: -1.0332,
        lng: 37.0693,
      },
      {
        name: "Huduma Centre Machakos",
        county: "Machakos",
        lat: -1.5177,
        lng: 37.2634,
      },
      {
        name: "Huduma Centre Garissa",
        county: "Garissa",
        lat: -0.4532,
        lng: 42.4798,
      },
      {
        name: "Huduma Centre Kisii",
        county: "Kisii",
        lat: -0.6817,
        lng: 34.7667,
      },
      {
        name: "Huduma Centre Kitui",
        county: "Kitui",
        lat: -1.3667,
        lng: 38.0167,
      },
      { name: "Huduma Centre Embu", county: "Embu", lat: -0.53, lng: 37.45 },
      { name: "Huduma Centre Meru", county: "Meru", lat: 0.0467, lng: 37.65 },
      {
        name: "Huduma Centre Malindi",
        county: "Kilifi",
        lat: -3.2138,
        lng: 40.1169,
      },
      {
        name: "Huduma Centre Naivasha",
        county: "Nakuru",
        lat: -0.7167,
        lng: 36.4333,
      },
    ];

    const hours = JSON.stringify({
      mon: "08:00-17:00",
      tue: "08:00-17:00",
      wed: "08:00-17:00",
      thu: "08:00-17:00",
      fri: "08:00-17:00",
      sat: "closed",
      sun: "closed",
    });
    const services =
      "{national_id,kra_pin,nhif,driving_license,helb,birth_certificate,passport,business_registration}";

    for (const c of centres) {
      await client.query(
        `INSERT INTO locations.huduma_centres (name, county, latitude, longitude, phone, opening_hours, services_offered)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [c.name, c.county, c.lat, c.lng, "0800720601", hours, services],
      );
    }
    console.log("✅ Seeded 15 Huduma Centres");
  } catch (err) {
    console.error("⚠️  Seed error (non-fatal):", (err as Error).message);
  } finally {
    client.release();
  }
}

// Initialize on import
const _init = initializeSchemas().then(() => seedHudumaCentres());

export { pool, _init as dbReady };
