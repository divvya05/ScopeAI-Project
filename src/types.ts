export type AssessmentType = "self" | "team" | "org";
export type QuestionType = "likert" | "choice" | "cards" | "text";

export interface QuestionOption {
  label: string;
  score?: number;
  id?: string;
}

export interface Question {
  id: string;
  category: string;
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[];
  lowLabel?: string;
  highLabel?: string;
  placeholder?: string;
  optional?: boolean;
  help?: string;
}

export interface Category {
  id: string;
  label: string;
  short: string;
  blurb: string;
}

export interface ReadyLevel {
  key: "emerging" | "developing" | "ready" | "leading";
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}

export interface RoleDef {
  id: string;
  title: string;
  summary: string;
  focus: string[];
  weights: Record<string, number>;
}

export interface ExperienceLevel {
  label: string;
  hint: string;
}

export interface ResourceEntry {
  skill: string;
  micro: string;
  courses: string[];
  project: string;
}

export type Answers = Record<string, string>;

export interface ScoreResult {
  categoryScores: Record<string, number>;
  overall: number;
  level: ReadyLevel;
  answeredCount: number;
  totalScored: number;
  complete: boolean;
}

export interface RoleMatch {
  role: RoleDef;
  fit: number;
  topDrivers: string[];
  why?: string;
}

export interface StrengthGapEntry {
  category: Category;
  score: number;
}

export interface StrengthsGaps {
  strengths: StrengthGapEntry[];
  watch: StrengthGapEntry[];
  gaps: StrengthGapEntry[];
}

export interface CapabilityPhase {
  id: string;
  label: string;
  color: string;
  items: { id: string; text: string; category: string }[];
}

export interface CapabilityPlan {
  overview: string;
  themes: {
    id: string;
    label: string;
    skill: string;
    courses: string[];
    project: string;
  }[];
  phases: CapabilityPhase[];
}

export interface Recommendations {
  summary: string;
  nextSteps: string;
  roleMatches: RoleMatch[];
  skillFocus: string[];
  capabilityPlan: CapabilityPlan;
  strength: string | null;
  gap: string | null;
  engine: string;
}

export interface ResultPayload {
  results: ScoreResult & { level: ReadyLevel };
  recommendations: Recommendations;
  assessmentId?: string;
  export?: { file: string; count: number } | null;
  disclaimer?: string;
}

export interface UserInfo {
  type: AssessmentType;
  name: string;
  email: string;
  role: string;
  organization: string;
  industry: string;
  teamSize: string;
  aiExperienceLevel: string;
}

export interface AssessmentConfigModel {
  categories: Category[];
  questions: Question[];
  levels: ReadyLevel[];
  roles: RoleDef[];
  industries: string[];
  experienceLevels: ExperienceLevel[];
  resources: Record<string, ResourceEntry>;
  capabilityPlanCatalog: {
    short: (gaps: string[], r: Record<string, ResourceEntry>) => string[];
    medium: (gaps: string[], r: Record<string, ResourceEntry>) => string[];
    long: string[];
  };
  aiModels: {
    general: { name: string; modelId: string; when: string; promptExample: string };
    fast: { name: string; modelId: string; when: string; promptExample: string };
  };
  disclaimers: { results: string; matching: string };
  copy: {
    hero: { headline: string; sub: string; ctaPrimary: string; ctaSecondary: string };
    taglines: string[];
    sections: Record<string, string>;
    ctaFinal: { headline: string; sub: string; cta: string };
  };
  likertAnchors: { low: string; high: string };
}