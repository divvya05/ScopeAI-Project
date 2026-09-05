// ============================================================
// ScopeAI — Express API server.
// Handles validation, Neon writes (users, assessments, responses,
// recommendations, draft persistence) and CSV export.
// ============================================================

import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import assessmentConfig from "../shared/assessment.config.mjs";
import { computeScores, validateAnswers } from "../shared/scoring.mjs";
import { pool, initSchema, isDatabaseConfigured, withClient } from "./db.js";
import { generateRecommendations } from "./ai.js";
import { writeExport } from "./export.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const DIST = path.join(__dirname, "..", "dist");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ---- Input sanitization & validation -------------------------------
const clean = (v, max = 200) =>
  typeof v === "string"
    ? v.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").trim().slice(0, max)
    : "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUserInfo(body) {
  const type = ["self", "team", "org"].includes(body?.type) ? body.type : "self";
  const info = {
    sessionId: clean(body?.sessionId, 64) || null,
    type,
    name: clean(body?.name, 120),
    email: clean(body?.email, 200).toLowerCase(),
    role: clean(body?.role, 120),
    organization: clean(body?.organization, 160),
    industry: clean(body?.industry, 80),
    aiExperienceLevel: clean(body?.aiExperienceLevel, 40),
    teamSize: body?.teamSize,
  };
  if (info.teamSize !== undefined && info.teamSize !== null && info.teamSize !== "") {
    const n = Number(info.teamSize);
    info.teamSize = Number.isFinite(n) ? Math.max(1, Math.min(10000, Math.round(n))) : null;
  } else {
    info.teamSize = null;
  }
  return info;
}

function validateUserInfo(info) {
  const errors = [];
  if (!info.name) errors.push("Please enter a name.");
  if (!info.email) {
    errors.push("An email is required so we can record and match your results.");
  } else if (!EMAIL_RE.test(info.email)) {
    errors.push("Please enter a valid email address.");
  }
  if (!info.role) errors.push("Please enter a role or department.");
  if (info.type !== "self" && !info.organization) {
    errors.push("Please enter a team or organization name.");
  }
  if (!info.industry) errors.push("Please select an industry.");
  if (!info.aiExperienceLevel) errors.push("Please select your AI experience level.");
  if (info.type === "team" || info.type === "org") {
    if (!info.teamSize || info.teamSize < 1) errors.push("Please enter a valid team size.");
  }
  return errors;
}

// ---- DB helpers ------------------------------------------------------
async function upsertUser(info, client) {
  const { rows } = await client.query(
    `INSERT INTO users (session_id, name, email, role, organization, industry, team_size, ai_experience_level)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (session_id) DO UPDATE
       SET name=EXCLUDED.name, email=EXCLUDED.email, role=EXCLUDED.role,
           organization=EXCLUDED.organization, industry=EXCLUDED.industry,
           team_size=EXCLUDED.team_size, ai_experience_level=EXCLUDED.ai_experience_level,
           updated_at=now()
     RETURNING id`,
    [info.sessionId, info.name, info.email, info.role, info.organization, info.industry, info.teamSize, info.aiExperienceLevel]
  );
  return rows[0].id;
}

// ---- Routes ----------------------------------------------------------
app.get("/api/health", async (_req, res, _next) => {
  try {
    if (!isDatabaseConfigured()) {
      return res.status(503).json({
        ok: false,
        db: "DATABASE_URL not set. Run `neon link` or set DATABASE_URL.",
      });
    }
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    res.status(503).json({ ok: false, db: "unreachable", detail: err.message });
  }
});

// Persist the participant's identity early (assessment setup step).
app.post("/api/session/save", async (req, res, next) => {
  try {
    const info = sanitizeUserInfo(req.body || {});
    const errors = validateUserInfo(info);
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });
    if (!info.sessionId) return res.status(400).json({ error: "Missing session id." });

    const userId = await withClient((c) => upsertUser(info, c));
    res.json({ ok: true, userId });
  } catch (err) {
    next(err);
  }
});

// Near real-time draft persistence as the user moves between steps.
app.post("/api/draft/save", async (req, res, next) => {
  try {
    const sessionId = clean(req.body?.sessionId, 64);
    if (!sessionId) return res.status(400).json({ error: "Missing session id." });
    const step = Number(req.body?.stepIndex ?? 0);
    const payload = req.body?.payload && typeof req.body?.payload === "object" ? req.body.payload : {};
    await pool.query(
      `INSERT INTO draft_responses (session_id, step_index, payload, updated_at)
       VALUES ($1,$2,$3, now())
       ON CONFLICT (session_id) DO UPDATE SET step_index=EXCLUDED.step_index, payload=EXCLUDED.payload, updated_at=now()`,
      [sessionId, step, JSON.stringify(payload)]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Final submission: validate, score, persist everything, store recommendations, refresh CSV.
app.post("/api/assessment/submit", async (req, res, next) => {
  try {
    const info = sanitizeUserInfo(req.body || {});
    const errors = validateUserInfo(info);
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });

    const answers = (req.body?.answers && typeof req.body?.answers === "object") ? req.body.answers : {};
    const names = Object.keys(answers).slice(0, 200);
    for (const k of names) {
      const v = answers[k];
      answers[k] = typeof v === "string" ? v.slice(0, 600) : v;
    }

    const { valid, missing } = validateAnswers(assessmentConfig.questions, answers);
    if (!valid) {
      return res.status(400).json({ error: `Answer all required questions before submitting. (Missing: ${missing.join(", ")} or invalid)` });
    }

    const results = computeScores(
      assessmentConfig.questions,
      assessmentConfig.categories,
      assessmentConfig.levels,
      answers
    );
    if (!results.complete) {
      return res.status(400).json({ error: "Answer all required questions before submitting." });
    }

    const user = {
      sessionId: info.sessionId,
      name: info.name,
      email: info.email,
      role: info.role,
      organization: info.organization,
      industry: info.industry,
      teamSize: info.teamSize,
      aiExperienceLevel: info.aiExperienceLevel,
    };

    let recommendations;
    const saved = await withClient(async (client) => {
      const userId = await upsertUser({ ...info, sessionId: info.sessionId }, client);

      const { rows: assessmentRows } = await client.query(
        `INSERT INTO assessments (user_id, type, overall_score, readiness_level, scores, answers)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [
          userId,
          info.type,
          results.overall,
          results.level.key,
          JSON.stringify(results.categoryScores),
          JSON.stringify(answers),
        ]
      );
      const assessmentId = assessmentRows[0].id;

      // Bulk insert individual responses.
      const qIds = [];
      const cats = [];
      const values = [];
      for (const q of assessmentConfig.questions) {
        if (q.type === "text") continue;
        const v = answers[q.id];
        if (v === undefined || v === null) continue;
        qIds.push(q.id);
        cats.push(q.category);
        values.push(String(v).slice(0, 600));
      }
      if (qIds.length) {
        await client.query(
          `INSERT INTO assessment_responses (assessment_id, question_id, category, answer_value)
           SELECT $1, x.qid, x.cat, x.val FROM UNNEST($2::text[], $3::text[], $4::text[]) AS x(qid, cat, val)`,
          [assessmentId, qIds, cats, values]
        );
      }

      // Recommendations (AI when available, else rule-based).
      recommendations = await generateRecommendations({
        config: assessmentConfig,
        results: { ...results, categoryScores: results.categoryScores },
        user: { name: user.name, role: user.role, organization: user.organization },
      });

      const roleMatchesPayload = recommendations.roleMatches.map((m) => ({
        roleId: m.role?.id || null,
        title: m.role?.title,
        summary: m.role?.summary,
        fit: m.fit,
        why: m.why,
      }));

      await client.query(
        `INSERT INTO recommendations (assessment_id, summary, next_steps, recommended_roles, skill_focus, capability_plan, engine)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          assessmentId,
          recommendations.summary,
          recommendations.nextSteps,
          JSON.stringify(roleMatchesPayload),
          JSON.stringify(recommendations.skillFocus),
          JSON.stringify(recommendations.capabilityPlan),
          recommendations.engine,
        ]
      );

      return { userId, assessmentId };
    });

    // Refresh the organization-wide CSV export with the new row.
    let exportInfo = null;
    try {
      exportInfo = await writeExport(pool, assessmentConfig);
    } catch (err) {
      console.warn("[scopeai] CSV export failed (submission still saved):", err.message);
    }

    res.json({
      ok: true,
      assessmentId: saved.assessmentId,
      userId: saved.userId,
      results: {
        overall: results.overall,
        level: results.level,
        categoryScores: results.categoryScores,
        answeredCount: results.answeredCount,
        totalScored: results.totalScored,
      },
      recommendations: {
        summary: recommendations.summary,
        nextSteps: recommendations.nextSteps,
        roleMatches: recommendations.roleMatches,
        skillFocus: recommendations.skillFocus,
        capabilityPlan: recommendations.capabilityPlan,
        strength: recommendations.strength,
        gap: recommendations.gap,
        engine: recommendations.engine,
      },
      export: exportInfo ? { file: exportInfo.file, count: exportInfo.count } : null,
      disclaimer: assessmentConfig.disclaimers.results,
    });
  } catch (err) {
    next(err);
  }
});

// ---- export CSV (whole-org) ------------------------------------------
app.get("/api/export", async (_req, res, next) => {
  try {
    let info;
    try {
      info = await writeExport(pool, assessmentConfig);
    } catch (err) {
      return res.status(503).json({ error: `Export failed: ${err.message}` });
    }
    res.download(info.file, "scopeai_assessments_export.csv", (err) => {
      if (err) console.warn("[scopeai] download error:", err.message);
    });
  } catch (err) {
    next(err);
  }
});

// ---- Static hosting + SPA fallback -----------------------------------
app.use(
  express.static(DIST, {
    extensions: ["html"],
    setHeaders(res, filePath) {
      if (filePath.endsWith(".js")) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      if (filePath.endsWith(".csv")) res.setHeader("Content-Type", "text/csv; charset=utf-8");
    },
  })
);

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  const index = path.join(DIST, "index.html");
  if (fs.existsSync(index)) return res.sendFile(index);
  next();
});

// ---- Error handling ---------------------------------------------------
app.use((err, _req, res, _next) => {
  const isConn =
    /ECONNREFUSED|ENOTFOUND|Connection terminated|timeout|P1001|password/i.test(err?.message || "");
  console.error("[scopeai] API error:", err);
  res.status(500).json({
    error: isConn
      ? "We couldn't reach the database. Please try again in a moment — your answers are saved locally."
      : "Something went wrong on our side. Please try again, your answers remain saved locally.",
  });
});

export async function startServer() {
  if (!isDatabaseConfigured()) {
    console.warn("[scopeai] WARNING: DATABASE_URL not set. Neon writes are disabled until you run `neon link`.");
  } else {
    try {
      await initSchema();
    } catch (err) {
      console.error("[scopeai] Schema init failed:", err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`[scopeai] server listening on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app };