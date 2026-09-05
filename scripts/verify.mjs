// Smoke test for the shared scoring + recommendation engine (no DB, no network).
import { categories, questions, levels, roles } from "../shared/assessment.config.mjs";
import { computeScores, validateAnswers, strengthsAndGaps, roleMatches } from "../shared/scoring.mjs";

const answers = {};
for (const q of questions) {
  if (q.type === "text") continue;
  if (q.type === "likert") answers[q.id] = "4";
  else answers[q.id] = q.options[q.options.length - 1].label;
}

const { valid, missing } = validateAnswers(questions, answers);
if (!valid) throw new Error(`validation failed: ${missing.join(",")}`);

const res = computeScores(questions, categories, levels, answers);
console.log("overall:", res.overall, "| level:", res.level.label, "| complete:", res.complete);

for (const c of categories) {
  const s = res.categoryScores[c.id];
  if (typeof s !== "number") throw new Error(`missing score for ${c.id}`);
  console.log(`  ${c.short.padEnd(24)} ${s}`);
}

const sg = strengthsAndGaps(res.categoryScores, categories);
console.log("gaps:", sg.gaps.length, "| watch:", sg.watch.length, "| strengths:", sg.strengths.length);

const matches = roleMatches(res.categoryScores, roles);
console.log("top 3 role matches:", matches.slice(0, 3).map((m) => `${m.role.title} (${m.fit})`).join(", "));
if (matches.length !== roles.length) throw new Error("role match count mismatch");

// Deterministic recommendation layer (this is the same function the API uses when AI is off).
const { generateRecommendations, ruleBasedRecommendations } = await import("../server/ai.js");
process.env.AI_ENABLED = "false";
const rec = await generateRecommendations({
  config: {
    categories, questions, levels, roles,
    resources: (await import("../shared/assessment.config.mjs")).resources,
    capabilityPlanCatalog: (await import("../shared/assessment.config.mjs")).capabilityPlanCatalog,
    aiModels: (await import("../shared/assessment.config.mjs")).aiModels,
  },
  results: { ...res, categoryScores: res.categoryScores },
  user: { name: "Test User", role: "Analyst", organization: "Acme" },
});
console.log("engine:", rec.engine);
if (!rec.summary || !rec.nextSteps || !rec.capabilityPlan.phases.length || !rec.roleMatches.length) {
  throw new Error("recommendations incomplete");
}
console.log("summary:", rec.summary.slice(0, 90) + "…");
console.log("skill focus:", rec.skillFocus.join(", "));
console.log("phases:", rec.capabilityPlan.phases.map((p) => `${p.label}: ${p.items.length} items`).join(" | "));
if (!rec.capabilityPlan.themes.length) throw new Error("no priority themes generated");

// Rule-based fallback path also works when AI is explicitly enabled but unreachable.
process.env.AI_ENABLED = "true";
process.env.AI_API_URL = "http://127.0.0.1:1/v1"; // guaranteed connection refusal
const rec2 = await generateRecommendations({
  config: { categories, questions, levels, roles, resources: (await import("../shared/assessment.config.mjs")).resources, capabilityPlanCatalog: (await import("../shared/assessment.config.mjs")).capabilityPlanCatalog, aiModels: (await import("../shared/assessment.config.mjs")).aiModels },
  results: { ...res, categoryScores: res.categoryScores },
  user: { name: "Test User", role: "Analyst", organization: "Acme" },
});
console.log("engine (unreachable AI):", rec2.engine);
if (rec2.engine !== "rule-based-fallback") throw new Error("expected graceful fallback");

console.log("\nOK — scoring and recommendations verified.");