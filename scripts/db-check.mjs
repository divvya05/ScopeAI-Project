import { pool, initSchema } from "../server/db.js";

try {
  await initSchema();
  const r = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  console.log("tables:", r.rows.map((x) => x.tablename).join(", "));
  process.exit(0);
} catch (e) {
  console.error("FAIL", e.message);
  process.exit(1);
}