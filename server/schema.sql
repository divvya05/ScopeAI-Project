-- ScopeAI schema (Neon Postgres)
-- Tables mirror the product flow: people, their assessments,
-- every question response, and the stored recommendations.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  organization TEXT,
  industry TEXT,
  team_size INTEGER,
  ai_experience_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_session ON users(session_id);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('self', 'team', 'org')),
  overall_score NUMERIC NOT NULL,
  readiness_level TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}',
  answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);

CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_responses_assessment ON assessment_responses(assessment_id);

CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  summary TEXT,
  next_steps TEXT,
  recommended_roles JSONB NOT NULL DEFAULT '[]',
  skill_focus JSONB NOT NULL DEFAULT '[]',
  capability_plan JSONB NOT NULL DEFAULT '[]',
  engine TEXT NOT NULL DEFAULT 'rule-based',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_assessment ON recommendations(assessment_id);

-- Near real-time draft persistence while the user works through the wizard.
CREATE TABLE IF NOT EXISTS draft_responses (
  session_id TEXT PRIMARY KEY,
  step_index INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);