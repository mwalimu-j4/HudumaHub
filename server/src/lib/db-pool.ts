// Raw PostgreSQL client for split-schema queries
// Prisma handles public schema; pg Pool handles conversations, cache, analytics schemas

import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error:", err);
});

export { pool };
