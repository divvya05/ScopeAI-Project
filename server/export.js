// ============================================================
// ScopeAI — Excel-compatible CSV export.
// Queries Neon and writes scopeai_assessments_export.csv.
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, "..", "exports");
const EXPORT_FILE = path.join(EXPORT_DIR, "scopeai_assessments_export.csv");

function csvCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvRow(cells) {
  return cells.map(csvCell).join(",");
}

function rolesToText(rolesJson) {
  try {
    const list = typeof rolesJson === "string" ? JSON.parse(rolesJson) : rolesJson;
    return (list || []).map((m) => m.role?.title ?? m.title).join(" | ");
  } catch {
    return "";
  }
}

function skillsToText(skillsJson) {
  try {
    const list = typeof skillsJson === "string" ? JSON.parse(skillsJson) : skillsJson;
    return (list || []).join(" | ");
  } catch {
    return "";
  }
}

function planTopActions(planJson, n = 3) {
  try {
    const plan = typeof planJson === "string" ? JSON.parse(planJson) : planJson;
    const items = (plan?.phases || []).flatMap((p) => (p?.items || []).map((i) => i.text));
    return items.slice(0, n).join(" | ");
  } catch {
    return "";
  }
}

/**
 * Query Neon and write the export CSV (with a UTF-8 BOM so Excel opens it cleanly).
 * Returns { file, count }.
 */
export async function writeExport(pool, config) {
  const { rows } = await pool.query(
    `SELECT
        u.id AS user_id,
        u.name, u.email, u.role, u.organization, u.industry,
        u.team_size, u.ai_experience_level,
        a.id AS assessment_id, a.type AS assessment_type,
        a.overall_score, a.readiness_level, a.scores, a.created_at,
        r.summary, r.next_steps, r.recommended_roles, r.skill_focus, r.capability_plan
     FROM assessments a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN recommendations r ON r.assessment_id = a.id
     ORDER BY a.created_at DESC`
  );

  const header = [
    "assessment_id",
    "user_id",
    "name",
    "email",
    "role",
    "organization",
    "industry",
    "team_size",
    "ai_experience_level",
    "assessment_type",
    "overall_score",
    "readiness_level",
    ...config.categories.map((c) => `score_${c.id}`),
    "recommended_roles",
    "skill_focus",
    "top_3_actions",
    "summary",
    "created_at",
  ];

  const lines = [csvRow(header)];
  for (const r of rows) {
    let scores = {};
    try {
      scores = typeof r.scores === "string" ? JSON.parse(r.scores) : r.scores || {};
    } catch {
      scores = {};
    }
    lines.push(
      csvRow([
        r.assessment_id,
        r.user_id,
        r.name,
        r.email,
        r.role,
        r.organization,
        r.industry,
        r.team_size,
        r.ai_experience_level,
        r.assessment_type,
        Number(r.overall_score),
        r.readiness_level,
        ...config.categories.map((c) => scores[c.id] ?? ""),
        rolesToText(r.recommended_roles),
        skillsToText(r.skill_focus),
        planTopActions(r.capability_plan, 3),
        r.summary,
        r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
      ])
    );
  }

  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  const body = "\uFEFF" + lines.join("\r\n") + "\r\n";
  fs.writeFileSync(EXPORT_FILE, body, "utf8");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const timed = path.join(EXPORT_DIR, `scopeai_assessments_export_${stamp}.csv`);
  fs.writeFileSync(timed, body, "utf8");

  return { file: EXPORT_FILE, count: rows.length };
}

export { EXPORT_DIR, EXPORT_FILE, csvRow, csvCell, rolesToText, skillsToText, planTopActions };