import { pool } from "../server/db.js";

const u = await pool.query(
  "SELECT id, name, email, role, organization, industry, ai_experience_level, created_at FROM users ORDER BY created_at DESC"
);
const a = await pool.query(
  "SELECT id, user_id, type, overall_score, readiness_level, created_at FROM assessments ORDER BY created_at DESC"
);
const r = await pool.query("SELECT COUNT(*)::int AS n FROM assessment_responses");

console.log(`USERS (${u.rows.length}):`);
console.table(u.rows);
console.log(`ASSESSMENTS (${a.rows.length}):`);
console.table(a.rows);
console.log("assessment_responses total:", r.rows[0].n);
await pool.end();