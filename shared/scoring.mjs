// ============================================================
// ScopeAI — pure scoring + recommendation logic (shared).
// No I/O here: works identically in the browser and on the server.
// ============================================================

/**
 * Score a single answer (0-100) based on the question definition.
 * Returns undefined for unanswered, text, or unscorable answers.
 */
export function scoreAnswer(question, answer) {
  if (answer === undefined || answer === null || answer === "") return undefined;

  if (question.type === "likert") {
    const n = Number(answer);
    if (Number.isInteger(n) && n >= 1 && n <= 5) return (n - 1) * 25;
    return undefined;
  }

  if (question.type === "choice" || question.type === "cards") {
    const list = question.options || [];
    const opt = list.find((o) => o.label === answer || o.id === answer);
    if (opt && typeof opt.score === "number") return opt.score;
    const idx = list.findIndex((o) => o.label === answer || o.id === answer);
    if (idx >= 0) return Math.round((idx / Math.max(list.length - 1, 1)) * 100);
    return undefined;
  }

  return undefined; // text / context questions are not scored
}

/**
 * Given the full question set and an answers map ({questionId: value}),
 * compute per-category scores, overall score and readiness level.
 * Categories with zero scored answers are treated as 0 but excluded from
 * the overall average until answered (wizard + server enforce completion).
 */
export function computeScores(questions, categories, levels, answers) {
  const agg = {};
  for (const q of questions) {
    if (q.type === "text") continue;
    const s = scoreAnswer(q, answers[q.id]);
    if (s === undefined) continue;
    agg[q.category] = agg[q.category] || { sum: 0, n: 0 };
    agg[q.category].sum += s;
    agg[q.category].n += 1;
  }

  const categoryScores = {};
  for (const cat of categories) {
    const a = agg[cat.id];
    categoryScores[cat.id] = a && a.n ? Math.round(a.sum / a.n) : 0;
  }

  const scored = categories
    .map((c) => categoryScores[c.id]);

  const answeredCount = Object.values(agg).reduce((n, a) => n + a.n, 0);
  const totalScored = questions.filter((q) => q.type !== "text").length;
  const overall = scored.length
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : 0;

  return {
    categoryScores,
    overall,
    level: levelFor(overall, levels),
    answeredCount,
    totalScored,
    complete: answeredCount === totalScored,
  };
}

export function levelFor(score, levels) {
  return levels.find((lv) => score >= lv.min && score <= lv.max) || levels[levels.length - 1];
}

export function strengthsAndGaps(categoryScores, categories) {
  const entries = categories.map((c) => ({
    category: c,
    score: categoryScores[c.id] ?? 0,
  }));
  return {
    strengths: entries.filter((e) => e.score >= 70).sort((a, b) => b.score - a.score),
    watch: entries.filter((e) => e.score >= 50 && e.score < 70).sort((a, b) => b.score - a.score),
    gaps: entries.filter((e) => e.score < 50).sort((a, b) => a.score - b.score),
  };
}

/**
 * Compute role fit 0-100 using a weighted sum over category scores.
 * Also returns the top contributing categories for "why it fits".
 */
export function roleMatches(categoryScores, roles) {
  return roles
    .map((role) => {
      let weighted = 0;
      let maxWeighted = 0;
      const contributions = [];
      for (const [cat, w] of Object.entries(role.weights)) {
        const s = categoryScores[cat] ?? 0;
        weighted += w * s;
        maxWeighted += w * 100;
        contributions.push({ category: cat, weight: w, score: s, contribution: w * s });
      }
      const fit = Math.round(maxWeighted ? (weighted / maxWeighted) * 100 : 0);
      contributions.sort((a, b) => b.contribution - a.contribution);
      return {
        role,
        fit,
        topDrivers: contributions.slice(0, 2).map((c) => c.category),
      };
    })
    .sort((a, b) => b.fit - a.fit);
}

/** Pick the categories where a person shows the clearest directional fit. */
export function topDimension(extra) {
  return extra;
}

export function buildReportSummary({ categoryScores, strengths, gaps, watch, user, config }) {
  const byId = Object.fromEntries(config.categories.map((c) => [c.id, c]));
  const named = (arr) => arr.map((e) => byId[e.category.id]?.label.split("&")[0].trim() ?? e.category.id);

  const strengthText = strengths.length
    ? `Strongest areas: ${named(strengths).join(", ")}.`
    : `The strongest areas are relative — focus first on building a shared foundation across all dimensions.`;
  const gapText = gaps.length
    ? `Biggest opportunities: ${named(gaps).join(", ")}.`
    : watch.length
      ? `Solid across the board — the next win is deepening the ${named(watch.slice(0, 2)).join(", ")} area(s).`
      : "An even, high profile across all dimensions.";

  const next = gaps.length
    ? config.resources[gaps[0].category.id]?.micro
    : config.resources[watch[0]?.category.id]?.micro ?? "Keep applying AI to real tasks and coach someone else on what you've learned.";

  return {
    summary: `${strengthText} ${gapText}`,
    nextSteps: next,
  };
}

export function buildCapabilityPlan({ categoryScores, strengths, gaps, watch, config }) {
  const byId = Object.fromEntries(config.categories.map((c) => [c.id, c]));
  let gapIds = gaps.length ? gaps.map((g) => g.category.id) : watch.map((w) => w.category.id);
  if (!gapIds.length) gapIds = [config.categories[0].id];
  const priorityThemes = gapIds.slice(0, 3).map((id) => ({
    id,
    label: byId[id]?.label ?? id,
    skill: config.resources[id]?.skill ?? "Core AI skills",
    courses: config.resources[id]?.courses ?? [],
    project: config.resources[id]?.project ?? "Apply one AI tool to a real task in your role.",
  }));

  const catalog = config.capabilityPlanCatalog;
  const res = config.resources;
  const topGap = res[gapIds[0]] ?? priorityThemes[0];
  const secondGap = res[gapIds[1]];

  return {
    overview: `Your highest-growth priority is ${topGap.skill.toLowerCase()}. ` +
      (secondGap ? `Alongside it, ${secondGap.skill.toLowerCase()} will round out your profile.` : ""),
    themes: priorityThemes,
    phases: [
      {
        id: "short",
        label: "Short-term · 0–3 months",
        color: "#2563EB",
        items: [
          { id: "s1", text: catalog.short(gapIds, res)[0], category: gapIds[0] },
          { id: "s2", text: catalog.short(gapIds, res)[1], category: gapIds[0] },
          { id: "s3", text: catalog.short(gapIds, res)[2], category: gapIds[0] },
        ],
      },
      {
        id: "medium",
        label: "Medium-term · 3–12 months",
        color: "#06B6D4",
        items: [
          { id: "m1", text: catalog.medium(gapIds, res)[0], category: gapIds[0] },
          { id: "m2", text: catalog.medium(gapIds, res)[1], category: gapIds[0] },
          { id: "m3", text: catalog.medium(gapIds, res)[2], category: gapIds[0] },
        ],
      },
      {
        id: "long",
        label: "Long-term · 12+ months",
        color: "#8B5CF6",
        items: [
          { id: "l1", text: catalog.long[0], category: "role" },
          { id: "l2", text: catalog.long[1], category: "responsible" },
          { id: "l3", text: catalog.long[2], category: "role" },
        ],
      },
    ],
  };
}

/** Validates a completed answers map against the question set. */
export function validateAnswers(questions, answers) {
  const missing = [];
  for (const q of questions) {
    if (q.type === "text") continue;
    const v = answers[q.id];
    if (v === undefined || v === null || v === "") {
      missing.push(q.id);
    } else if (scoreAnswer(q, v) === undefined) {
      missing.push(q.id);
    }
  }
  return { valid: missing.length === 0, missing };
}