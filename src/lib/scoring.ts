import * as rawModule from "../../shared/scoring.mjs";
import type {
  Answers,
  Category,
  ReadyLevel,
  Question,
  RoleMatch,
  ScoreResult,
  StrengthsGaps,
  AssessmentConfigModel,
} from "../types";

const raw = rawModule as any;

/**
 * Typed frontend access to the shared scoring engine (shared/scoring.mjs).
 * The server independently imports the same functions, so scores computed in
 * the browser always match what Neon stores.
 */

export const scoreAnswer = raw.scoreAnswer as (question: Question, answer?: string) => number | undefined;

export const computeScores = raw.computeScores as (
  questions: Question[],
  categories: Category[],
  levels: ReadyLevel[],
  answers: Answers
) => ScoreResult;

export const levelFor = raw.levelFor as (score: number, levels: ReadyLevel[]) => ReadyLevel;

export const strengthsAndGaps = raw.strengthsAndGaps as (
  categoryScores: Record<string, number>,
  categories: Category[]
) => StrengthsGaps;

export const roleMatches = raw.roleMatches as (
  categoryScores: Record<string, number>,
  roles: AssessmentConfigModel["roles"]
) => RoleMatch[];

export const validateAnswers = raw.validateAnswers as (
  questions: Question[],
  answers: Answers
) => { valid: boolean; missing: string[] };