import { describe, expect, it } from "vitest";

import { categories, levels, questions, roles } from "../config/assessmentConfig";
import type { Question } from "../types";

import {
  computeScores,
  levelFor,
  roleMatches,
  scoreAnswer,
  strengthsAndGaps,
  validateAnswers,
} from "./scoring";

function q(over: Partial<Question>): Question {
  return { id: "q1", category: "awareness", type: "likert", prompt: "Q", ...over };
}

describe("scoreAnswer", () => {
  it("maps likert 1-5 to 0-100", () => {
    const likert = q({ type: "likert" });
    expect(scoreAnswer(likert, "1")).toBe(0);
    expect(scoreAnswer(likert, "3")).toBe(50);
    expect(scoreAnswer(likert, "5")).toBe(100);
  });

  it("returns undefined for empty or out-of-range likert answers", () => {
    const likert = q({ type: "likert" });
    expect(scoreAnswer(likert, "")).toBeUndefined();
    expect(scoreAnswer(likert, "6")).toBeUndefined();
    expect(scoreAnswer(likert, "abc")).toBeUndefined();
  });

  it("uses the explicit score on choice options", () => {
    const choice = q({
      type: "choice",
      options: [
        { label: "Low", score: 0 },
        { label: "Mid", score: 50 },
        { label: "High", score: 100 },
      ],
    });
    expect(scoreAnswer(choice, "Low")).toBe(0);
    expect(scoreAnswer(choice, "High")).toBe(100);
    expect(scoreAnswer(choice, "Unknown option")).toBeUndefined();
  });

  it("never scores text questions", () => {
    expect(scoreAnswer(q({ type: "text" }), "anything")).toBeUndefined();
  });
});

describe("computeScores", () => {
  it("returns 0 overall when nothing is answered", () => {
    const result = computeScores(questions, categories, levels, {});
    expect(result.overall).toBe(0);
    expect(result.complete).toBe(false);
  });

  it("computes a perfect score when every question is maxed", () => {
    const answers: Record<string, string> = {};
    for (const question of questions) {
      if (question.type === "likert") answers[question.id] = "5";
      else if (question.type === "choice" || question.type === "cards") {
        answers[question.id] = question.options![question.options!.length - 1].label;
      }
    }
    const result = computeScores(questions, categories, levels, answers);
    expect(result.overall).toBe(100);
    expect(result.level.key).toBe("leading");
    expect(result.complete).toBe(true);
    expect(Object.values(result.categoryScores).every((s) => s === 100)).toBe(true);
  });

  it("averages within each category and across categories", () => {
    const two = [q({ id: "a1", type: "likert" }), q({ id: "a2", type: "likert" })];
    const cat = [{ id: "awareness", label: "L", short: "S", blurb: "B" }];
    const result = computeScores(two, cat, levels, { a1: "1", a2: "5" });
    expect(result.categoryScores.awareness).toBe(50);
    expect(result.overall).toBe(50);
    expect(levelFor(result.overall, levels).key).toBe("developing");
  });
});

describe("strengthsAndGaps", () => {
  it("bands scores into strengths, watch and gaps", () => {
    const cat = [
      { id: "a", label: "A", short: "A", blurb: "" },
      { id: "b", label: "B", short: "B", blurb: "" },
      { id: "c", label: "C", short: "C", blurb: "" },
      { id: "d", label: "D", short: "D", blurb: "" },
    ];
    const { strengths, watch, gaps } = strengthsAndGaps(
      { a: 80, b: 95, c: 20, d: 60 },
      cat
    );
    expect(strengths.map((s) => s.category.id)).toEqual(["b", "a"]);
    expect(watch.map((s) => s.category.id)).toEqual(["d"]);
    expect(gaps.map((s) => s.category.id)).toEqual(["c"]);
  });

  it("handles missing categories as zero", () => {
    const cat = [
      { id: "a", label: "A", short: "A", blurb: "" },
      { id: "b", label: "B", short: "B", blurb: "" },
    ];
    const { gaps } = strengthsAndGaps({ b: 100 }, cat);
    expect(gaps.map((s) => s.category.id)).toEqual(["a"]);
  });
});

describe("roleMatches", () => {
  it("sorts roles by fit descending and reports top drivers", () => {
    const matches = roleMatches(
      { awareness: 100, tools: 100, digital: 100, problem: 100, adaptable: 100, collaboration: 100, responsible: 100, role: 100 },
      roles
    );
    expect(matches.length).toBe(roles.length);
    expect(matches.every((m) => m.fit === 100)).toBe(true);
    expect(matches[0].topDrivers.length).toBe(2);
  });

  it("ranks a data-heavy profile toward data roles", () => {
    const matches = roleMatches(
      { awareness: 20, tools: 30, digital: 100, problem: 90, adaptable: 30, collaboration: 20, responsible: 20, role: 40 },
      roles
    );
    const analyst = matches.find((m) => m.role.id === "business-analyst");
    const data = matches.find((m) => m.role.id === "data-insights");
    expect(data!.fit).toBeGreaterThan(analyst!.fit);
    expect(matches[0].fit).toBeGreaterThanOrEqual(matches[matches.length - 1].fit);
  });
});

describe("validateAnswers", () => {
  it("reports missing scored questions but ignores text questions", () => {
    const set = [
      q({ id: "a1", type: "likert" }),
      q({ id: "a2", type: "choice", options: [{ label: "X", score: 100 }] }),
      q({ id: "t1", type: "text", optional: true }),
    ];
    expect(validateAnswers(set, { a1: "3", a2: "X" }).valid).toBe(true);
    const missing = validateAnswers(set, { a1: "3" });
    expect(missing.valid).toBe(false);
    expect(missing.missing).toEqual(["a2"]);
  });
});