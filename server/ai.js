// ============================================================
// ScopeAI — AI-powered recommendation layer.
//
// Free / open models configured via OpenAI-compatible endpoints
// (e.g. Ollama on http://localhost:11434/v1, or a hosted OSS endpoint).
//
//   - General model (Llama 3.1 8B, "llama3.1"): report summary,
//     strengths/gaps narrative, next steps.
//   - Fast model   (Gemma 2 9B, "gemma2"): short role-fit microcopy.
//
// Any failure gracefully falls back to deterministic, threshold-based
// recommendations computed in shared/scoring.mjs.
// ============================================================

import {
  computeScores,
  roleMatches,
  strengthsAndGaps,
  buildReportSummary,
  buildCapabilityPlan,
} from "../shared/scoring.mjs";

const aiEnabled = () => process.env.AI_ENABLED === "true";
const AI_API_URL = process.env.AI_API_URL || "http://localhost:11434/v1";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 15000);

async function callModel({ model, system, user, json = true }) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(`${AI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.4,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`model HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    let parsed = text;
    try {
      parsed = JSON.parse(
        text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
      );
    } catch {
      /* keep raw text */
    }
    return parsed;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Threshold-based recommendations (always available, zero external calls).
 */
export function ruleBasedRecommendations(ctx) {
  const { config, results } = ctx;
  const { categoryScores, level } = results;

  const { strengths, watch, gaps } = strengthsAndGaps(categoryScores, config.categories);
  const summaryParts = buildReportSummary({
    categoryScores,
    strengths,
    gaps,
    watch,
    config,
  });
  const plan = buildCapabilityPlan({ categoryScores, strengths, gaps, watch, config });
  const matches = roleMatches(categoryScores, config.roles);

  return {
    summary: summaryParts.summary,
    nextSteps: summaryParts.nextSteps,
    roleMatches: matches.slice(0, 3).map((m) => ({
      role: m.role,
      fit: m.fit,
      topDrivers: m.topDrivers,
      why: `Strong fit across ${m.role.focus.slice(0, 2).join(" and ").toLowerCase()}.`,
    })),
    skillFocus: gaps.length
      ? gaps.map((g) => config.resources[g.category.id].skill)
      : [config.resources[watch[0]?.category.id]?.skill ?? config.resources[config.categories[0].id].skill],
    capabilityPlan: plan,
    strength: strengths[0]?.category.label ?? null,
    gap: gaps[0]?.category.label ?? watch[0]?.category.label ?? null,
    level,
    engine: "rule-based",
  };
}

/**
 * Try to enrich the rule-based report with an open LLM. Returns null on any
 * failure so the caller can fall back gracefully.
 */
async function aiEnhance(ctx, base) {
  const { config, results, user } = ctx;
  const { categoryScores, overall, level } = results;

  const categoryLines = config.categories
    .map((c) => `${c.short}: ${categoryScores[c.id] ?? 0}/100`)
    .join(", ");

  // General-purpose model (Llama 3.1 8B) — the report summary.
  const gen = await callModel({
    model: process.env.AI_MODEL_GENERAL || config.aiModels.general.modelId,
    system:
      "You write clear, encouraging, non-judgmental career guidance for a professional audience. " +
      "You never claim scientific validation or guaranteed outcomes. Keep it practical and human.",
    user: `Given this AI readiness score and category breakdown, generate a 3-paragraph summary of strengths, gaps, and next steps in simple language.
Overall: ${overall}/100 (${level.label}).
Profile (${user.name || "this person"}, role: ${user.role || "unknown"}): ${categoryLines}

Respond with JSON: {"summary": "3 short paragraphs", "nextSteps": "one sentence"}`,
  });

  // Fast model (Gemma 2 9B) — short role-fit microcopy for the top 2 matches.
  const top2 = base.roleMatches.slice(0, 2);
  const fast = await callModel({
    model: process.env.AI_MODEL_FAST || config.aiModels.fast.modelId,
    system:
      "You write short, warm, specific microcopy. One or two sentences. Never make hiring or career guarantees.",
    user: `Given these category scores and role preferences, list 3 potential AI-related roles and explain why they might fit.
Scores: ${categoryLines}
Current best matches: ${top2.map((m) => m.role.title).join(", ")}

Respond with JSON: {"roles": [{"title": "...", "why": "..."}]}`,
  });

  const roles = Array.isArray(fast?.roles)
    ? fast.roles
        .slice(0, 3)
        .map((r) => ({ role: { title: r?.title }, why: r?.why }))
    : base.roleMatches;

  return {
    summary: typeof gen?.summary === "string" ? gen.summary : base.summary,
    nextSteps: typeof gen?.nextSteps === "string" ? gen.nextSteps : base.nextSteps,
    roleMatches: Array.isArray(roles)
      ? roles.map((r, i) => ({
          ...base.roleMatches[i],
          role: { ...base.roleMatches[i]?.role, ...(r.role || {}) },
          why: r.why,
        }))
      : base.roleMatches,
  };
}

/**
 * Public entry point used by POST /api/assessment/submit.
 */
export async function generateRecommendations(ctx) {
  const base = ruleBasedRecommendations(ctx);
  if (!aiEnabled()) {
    return { ...base, engine: "rule-based" };
  }
  try {
    const enhanced = await aiEnhance(ctx, base);
    console.log("[scopeai] AI-generated recommendations (open model)");
    return { ...base, ...enhanced, engine: "ai" };
  } catch (err) {
    console.warn("[scopeai] AI call failed — using rule-based recommendations:", err.message);
    return { ...base, engine: "rule-based-fallback" };
  }
}

export { computeScores };