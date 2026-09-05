# ScopeAI — AI Era Readiness Calculator

A production-ready, responsive web application that measures AI literacy and readiness for
individuals, teams, and organizations. It scores the person/team across eight AI-readiness
dimensions, explains where they stand, recommends next steps (courses, skills, projects, roles),
persists everything into **Neon Postgres**, and exports an Excel-compatible **CSV** report.

Built to live inside this folder — it reuses the existing `fonts/`, `css/`, `images/`, `media/`,
and `js/` assets for visual consistency while expressing its own product identity.

---

## 1. Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│  Browser (React 18 + TypeScript + Tailwind + lucide-react)         │
│  ─ Views: Landing, Setup, Assessment, Results, Roles, Plan         │
│  ─ AppContext: route, user info, answers, results                  │
│  ─ localStorage session backup + sessionStorage session id         │
└───────────────┬────────────────────────────────────────────────────┘
                │  fetch /api/*      (Vite dev proxy → :8787)
┌───────────────▼────────────────────────────────────────────────────┐
│  Express API  (:8787)                                              │
│   POST /api/session/save        upsert user                        │
│   POST /api/draft/save          near-real-time progress (Neon)     │
│   POST /api/assessment/submit   validate → score → persist → AI    │
│   GET  /api/export              download org CSV                   │
│   GET  /api/health                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  server/db.js        Neon Pool (@neondatabase/serverless)          │
│  server/schema.sql   users, assessments, responses, recs, drafts   │
│  server/export.js    writes exports/scopeai_assessments_export.csv │
│  server/ai.js        open-model calls (Llama 3.1 / Gemma 2 via     │
│                      Ollama-style OpenAI-compatible endpoint)      │
│                      + deterministic rule-based fallback            │
└─────────────────────────────────────────────────────────────────────┘
        │ shared single source of truth (browser AND server)
┌───────▼────────────────────────────────────────────────────────────┐
│  shared/assessment.config.mjs   dimensions, questions, roles, copy │
│  shared/scoring.mjs             scoring, levels, role fit, plans   │
│  Neon Postgres (royal-queen-60378606)  ·  .env.local (DATABASE_URL)│
└─────────────────────────────────────────────────────────────────────┘
```

**Design aims**

- A single configuration source (`shared/assessment.config.mjs`) drives both the client and
  server, so scores computed in the browser always match what Neon stores.
- AI is layered on top of deterministic logic. If the model endpoint is unreachable or unset,
  the product falls back to threshold-based rule recommendations — **no AI interruption is
  possible**.
- Credentials never leave the server: `DATABASE_URL` lives in `.env.local` (created by
  `neon link`) and is only read by `server/db.js`. A fix is `npm run dev` / `npm start`.

## 2. Database schema (Neon)

```sql
users               (id uuid pk, session_id text unique, name, email, role, organization,
                     industry, team_size int, ai_experience_level, created_at, updated_at)

assessments         (id uuid pk, user_id fk, type 'self'|'team'|'org', overall_score numeric,
                     readiness_level text, scores jsonb, answers jsonb, created_at)

assessment_responses(id uuid pk, assessment_id fk, question_id text, category text,
                     answer_value text, created_at)

recommendations     (id uuid pk, assessment_id fk, summary text, next_steps text,
                     recommended_roles jsonb, skill_focus jsonb, capability_plan jsonb,
                     engine text, created_at)

draft_responses     (session_id text pk, step_index, payload jsonb, updated_at)
```

`server/schema.sql` is applied automatically on server start (idempotent `CREATE TABLE IF NOT
EXISTS`).

## 3. Assessment configuration structure

`shared/assessment.config.mjs` exports:

| Export | Purpose |
| --- | --- |
| `categories` | 8 dimensions: awareness, tools, digital, problem, adaptable, collaboration, responsible, role |
| `questions` | 24 questions (`likert`, `choice`, `cards`, optional `text`) + 2 optional text-context fields |
| `levels` | Emerging / Developing / Ready / Leading (0–39, 40–59, 60–79, 80–100) |
| `roles` | 8 suggested AI roles with per-category `weights` for fit scoring |
| `industries`, `experienceLevels` | Setup form options |
| `resources` | Per-dimension courses, skills, starter projects |
| `capabilityPlanCatalog` | Short / medium / long-term plan templates |
| `aiModels` | Named open models + when/how they're used |
| `disclaimers`, `copy` | Compliance copy and brand messaging |

Edit questions, scoring weights, copy, or roles here — no code changes needed elsewhere.

## 4. Core components & routes

Routes (hash-based): `#/` landing · `#/setup` · `#/assessment` · `#/results` · `#/roles` · `#/plan`

Components (`src/components/`): `Navbar`, `Footer`, `HeroSection`, `TaglineStrip`,
`MockDashboard`, `ProgressIndicator`, `QuestionCard`, `ScoreRing`, `CategoryBars`,
`StrengthsGapsPanel`, `RoleCard`, `CapabilityTimeline`.

Views (`src/views/`): `Landing`, `Setup`, `Assessment`, `Results`, `Roles`, `Plan`.

## 5. Key code paths

### Neon connection + schema setup (`server/db.js`)

```js
import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });              // written by `neon link`

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initSchema() {
  await pool.query(fs.readFileSync("server/schema.sql", "utf8"));
}
```

### Submit endpoint (`server/index.js`) — validates, scores, persists, exports

```js
const results = computeScores(config.questions, config.categories, config.levels, answers);
await withClient(async (client) => {
  const userId = await upsertUser(info, client);
  const { rows } = await client.query(
    `INSERT INTO assessments (user_id, type, overall_score, readiness_level, scores, answers)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [userId, info.type, results.overall, results.level.key, scoresJson, answersJson]);
  // bulk responses via UNNEST, recommendations row, then:
});
await writeExport(pool, config);                    // refresh exports/scopeai_assessments_export.csv
```

### Model integration (`server/ai.js`) — free open models + fallback

```js
// General (Llama 3.1 8B): "Given this AI readiness score and category breakdown, generate a
// 3-paragraph summary of strengths, gaps, and next steps in simple language."
const gen = await callModel({ model: process.env.AI_MODEL_GENERAL || "llama3.1", ... });

// Fast (Gemma 2 9B): "Given these category scores and role preferences, list 3 potential
// AI-related roles and explain why they might fit."
const fast = await callModel({ model: process.env.AI_MODEL_FAST || "gemma2", ... });

// Any error → throw → caller returns ruleBasedRecommendations() instead.
```

### Assessment wizard (`src/views/Assessment.tsx`)

Steps map 1:1 to the eight dimensions. Each step renders `QuestionCard`s, validates required
answers, POSTs `/api/draft/save` (near-real-time Neon persistence), and on the final step POSTs
`/api/assessment/submit` with all answers, then navigates to `#/results`.

## 6. Running locally

Prereqs: Node 20+, a Neon project, and the `neon` CLI (`npm i -g neon@latest`).

```bash
# 1) Link this directory to your Neon project (generates .env.local with DATABASE_URL)
neon link --project-id royal-queen-60378606 --branch production -y

# 2) Install dependencies
npm install

# 3) Run (server :8787 + Vite dev :5173)
npm run dev
# → open http://localhost:5173
```

Optional — AI-powered copy via a local open model (Ollama):

```bash
ollama pull llama3.1        # general-purpose (8B-class)
ollama pull gemma2          # fast model for microcopy
# then in .env.local: AI_ENABLED=true   (defaults already point at localhost:11434/v1)
```

Without any AI, the app runs fully on deterministic rule-based recommendations.

Checks:

```bash
npm run check       # TypeScript type-check + scoring/fallback smoke test
npm run build       # production bundle → dist/
npm run e2e         # boot API + full happy path against Neon (scripts/e2e.mjs)
```

## 7. Deploying (production-ready)

**Locally / single VM:** `npm run build` then `npm start`
(`node server/index.js`) — Express serves `dist/` plus the API. Set `PORT`, keep
`.env.local` secret, put the app behind HTTPS.

**Neon CLI (this repo's config already exists):**

```bash
npm i -g neon@latest && neon login
neon skills -y                      # needs Node >= 22.20
neon mcp -y                         # wires Neon MCP into opencode/other agents
neon link --project-id royal-queen-60378606 --branch production -y
neon config init
# neon.ts is already configured (preview buckets + branch policy)
neon config plan && neon config apply
neon deploy
```

**Suggested host:** any Node host (Render, Railway, Fly.io, Vercel Functions if you split the
API). Keep `DATABASE_URL` in the platform's secret store — never bundle it into the client.
The schema auto-applies on boot; for strict control run `server/schema.sql` in Neon's SQL
editor once.

## 8. Export

- On each completed assessment, the server rewrites `exports/scopeai_assessments_export.csv`
  (plus a timestamped copy) with user info, scores, sub-scores, level, roles, skill focus, and
  top-3 actions. Excel opens it directly (UTF-8 BOM included).
- The results page also offers a per-assessment **Download report (CSV/Excel)** button.
- Whole-org export: `GET /api/export`.

## 9. Notes & disclaimer

- Results are **directional insights**, not a formal evaluation or a guarantee of performance
  or career outcomes. Role matches are suggestions, not hiring guarantees.
- Free/open models only (Neon free tier + optional local open-weight LLMs). No SaaS AI API key
  is required.
- Existing project assets (`css`, `fonts`, `images`, `js`, `media`) are untouched and reused
  where relevant (e.g., bundled `.woff2` typefaces, DeepMind-style brand asset).