import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Pool } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Neon writes connection strings to .env.local via `neon link`. Load it.
for (const file of [".env.local", ".env"]) {
  const p = path.join(__dirname, "..", file);
  if (fs.existsSync(p)) dotenv.config({ path: p });
}

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

export function isDatabaseConfigured() {
  return Boolean(DATABASE_URL);
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  // Neon serverless driver: keep the pool lazy (can also use pool.connect()).
  max: 5,
});

export async function initSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.connect();
  await pool.query(sql);
  console.log("[scopeai] database schema ready");
}

export async function withClient(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}