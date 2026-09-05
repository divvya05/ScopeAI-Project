// End-to-end test: boots the API server, runs the whole happy path
// (session -> draft -> submit -> recommendations -> CSV), verifies Neon rows.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { questions } from "../shared/assessment.config.mjs";
import { pool } from "../server/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:8787";

const answers = {};
for (const q of questions) {
  if (q.type === "text") continue;
  if (q.type === "likert") answers[q.id] = "4";
  else answers[q.id] = q.options[q.options.length - 1].label;
}

const userInfo = {
  type: "self",
  name: "E2E Test Person",
  email: "e2e+scopeai@example.com",
  role: "Operations analyst",
  organization: "ScopeAI Test Co",
  industry: "Professional services",
  teamSize: "",
  aiExperienceLevel: "Intermediate",
};

let server;
try {
  server = spawn(process.execPath, [path.join(__dirname, "..", "server", "index.js")], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: "8787" },
  });
  server.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
  server.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));
  server.on("exit", (code) => console.log(`[e2e] server exited with code ${code}`));

  // Wait for health
  let up = false;
  for (let i = 0; i < 40; i++) {
    try {
      const h = await fetch(`${BASE}/api/health`).then((r) => r.json());
      if (h.ok) {
        up = true;
        break;
      }
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!up) throw new Error("server did not become healthy (Neon reachable?)");

  const j = (r) => r.json();

  // Remove any leftovers from previous (possibly interrupted) runs.
  const prior = await pool.query("SELECT id FROM users WHERE session_id = $1", ["e2e-session-001"]);
  for (const row of prior.rows) {
    await pool.query("DELETE FROM assessments WHERE user_id = $1", [row.id]);
    await pool.query("DELETE FROM users WHERE id = $1", [row.id]);
  }
  await pool.query("DELETE FROM draft_responses WHERE session_id = $1", ["e2e-session-001"]);

  const session = await fetch(`${BASE}/api/session/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: "e2e-session-001", ...userInfo }),
  }).then(j);
  if (!session.ok) throw new Error("session/save failed: " + JSON.stringify(session));
  console.log("session saved, userId:", session.userId);

  const draft = await fetch(`${BASE}/api/draft/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: "e2e-session-001", stepIndex: 1, payload: { answered: Object.keys(answers).length } }),
  }).then(j);
  if (!draft.ok) throw new Error("draft/save failed");
  console.log("draft saved");

  const submit = await fetch(`${BASE}/api/assessment/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: "e2e-session-001", ...userInfo, answers }),
  }).then(j);
  if (!submit.ok) throw new Error("submit failed: " + JSON.stringify(submit));
  console.log("submit ok | assessmentId:", submit.assessmentId, "| score:", submit.results.overall, "| level:", submit.results.level.label, "| engine:", submit.recommendations.engine);
  console.log("  roles:", submit.recommendations.roleMatches.slice(0, 3).map((m) => `${m.role.title} ${m.fit}%`).join(", "));
  console.log("  export:", submit.export?.file, "rows:", submit.export?.count);

  const exportRes = await fetch(`${BASE}/api/export`);
  if (!exportRes.ok) throw new Error("export endpoint failed: " + exportRes.status);
  const csv = await exportRes.text();
  if (!csv.includes("overall_score") || !csv.includes("E2E Test Person")) throw new Error("CSV content looks wrong");
  const exportFile = path.join(__dirname, "..", "exports", "scopeai_assessments_export.csv");
  if (!fs.existsSync(exportFile)) throw new Error("exports file not written");
  console.log("export endpoint ok, csv length:", csv.length);

  // Verify rows in Neon directly.
  const u = await pool.query("SELECT id, session_id, name FROM users WHERE session_id = $1", ["e2e-session-001"]);
  const a = await pool.query("SELECT id FROM assessments WHERE user_id = $1", [u.rows[0].id]);
  const r = await pool.query("SELECT COUNT(*)::int AS n FROM assessment_responses WHERE assessment_id = $1", [a.rows[0].id]);
  const rec = await pool.query("SELECT engine FROM recommendations WHERE assessment_id = $1", [a.rows[0].id]);
  const d = await pool.query("SELECT payload FROM draft_responses WHERE session_id = $1", ["e2e-session-001"]);
  console.log(`db rows -> user: ${u.rows.length}, assessments: ${a.rows.length}, responses: ${r.rows[0].n}, recommendations engine: ${rec.rows[0].engine}, drafts: ${d.rows.length}`);
  const expectedResponses = questions.filter((q) => q.type !== "text").length;
  if (a.rows.length !== 1 || r.rows[0].n !== expectedResponses || rec.rows.length !== 1) throw new Error("Neon row counts unexpected");
  console.log(`expected responses: ${expectedResponses}`);

  // Cleanup: remove E2E rows so a fresh export stays clean.
  await pool.query("DELETE FROM assessments WHERE user_id = $1", [u.rows[0].id]);
  await pool.query("DELETE FROM users WHERE id = $1", [u.rows[0].id]);
  await pool.query("DELETE FROM draft_responses WHERE session_id = $1", ["e2e-session-001"]);
  console.log("E2E OK");
} finally {
  if (server) server.kill();
  await pool.end().catch(() => {});
}