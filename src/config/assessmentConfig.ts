import raw from "../../shared/assessment.config.mjs";
import type { AssessmentConfigModel } from "../types";

/**
 * Typed access to the shared assessment configuration.
 * The source of truth lives in shared/assessment.config.mjs and is used
 * identically by the frontend (here) and the backend (server/index.js).
 */
export const assessmentConfig = raw as unknown as AssessmentConfigModel;

export const categories = assessmentConfig.categories;
export const questions = assessmentConfig.questions;
export const levels = assessmentConfig.levels;
export const roles = assessmentConfig.roles;
export const industries = assessmentConfig.industries;
export const experienceLevels = assessmentConfig.experienceLevels;
export const resources = assessmentConfig.resources;
export const disclaimers = assessmentConfig.disclaimers;
export const copy = assessmentConfig.copy;

export const questionsByCategory = (categoryId: string) =>
  questions.filter((q) => q.category === categoryId);