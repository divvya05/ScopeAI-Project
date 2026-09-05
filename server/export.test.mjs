// @vitest-environment node

import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EXPORT_FILE,
  csvCell,
  csvRow,
  planTopActions,
  rolesToText,
  skillsToText,
  writeExport,
} from "./export.js";

afterEach(() => {
  vi.restoreAllMocks();
});

const config = {
  categories: [{ id: "awareness" }, { id: "tools" }],
};

const sampleRow = {
  assessment_id: "a1",
  user_id: "u1",
  name: "Alexa",
  email: "alex@gmail.com",
  role: "Scrum Master",
  organization: "Acme",
  industry: "Technology",
  team_size: "5",
  ai_experience_level: "Beginner",
  assessment_type: "self",
  overall_score: 100,
  readiness_level: "Leading",
  scores: JSON.stringify({ awareness: 100, tools: 50 }),
  created_at: new Date("2026-01-02T03:04:05.000Z"),
  summary: "Great report",
  next_steps: "Keep going",
  recommended_roles: JSON.stringify([{ role: { title: "AI-enabled business analyst" } }]),
  skill_focus: JSON.stringify(["Prompt design", "Data literacy"]),
  capability_plan: JSON.stringify({
    phases: [{ items: [{ text: "Learn AI basics" }, { text: "Automate a task" }, { text: "Coach a teammate" }] }],
  }),
};

describe("csv helpers", () => {
  it("quotes cells containing commas, quotes or newlines", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell("a, b")).toBe('"a, b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
    expect(csvCell(42)).toBe("42");
  });

  it("joins cells into a row", () => {
    expect(csvRow(["a", "b, c", null])).toBe('a,"b, c",');
  });
});

describe("report field formatters", () => {
  it("flattens recommended roles into a pipe-joined string", () => {
    expect(rolesToText([{ role: { title: "Analyst" } }, { role: { title: "Champion" } }])).toBe("Analyst | Champion");
    expect(rolesToText(JSON.stringify([{ title: "Analyst" }]))).toBe("Analyst");
    expect(rolesToText("not json")).toBe("");
  });

  it("flattens skill focus and top plan actions", () => {
    expect(skillsToText(["Prompt design", "Data literacy"])).toBe("Prompt design | Data literacy");
    expect(skillsToText("bad json")).toBe("");
    const plan = { phases: [{ items: [{ text: "A" }, { text: "B" }, { text: "C" }, { text: "D" }] }] };
    expect(planTopActions(plan, 3)).toBe("A | B | C");
    expect(planTopActions(null, 3)).toBe("");
  });
});

describe("writeExport", () => {
  it("writes a BOM-prefixed CSV with header and data rows", async () => {
    const pool = { query: vi.fn().mockResolvedValue({ rows: [sampleRow] }) };
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    const result = await writeExport(pool, config);

    expect(result.count).toBe(1);
    expect(result.file).toBe(EXPORT_FILE);
    expect(writeSpy).toHaveBeenCalledTimes(2);

    const body = writeSpy.mock.calls[0][1];
    expect(body.startsWith("\uFEFF")).toBe(true);
    expect(body).toMatch(/^\uFEFFassessment_id,user_id,name,email,role,organization,industry,team_size,ai_experience_level,assessment_type,overall_score,readiness_level,score_awareness,score_tools,recommended_roles,skill_focus,top_3_actions,summary,created_at/);
    expect(body).toContain("Alexa");
    expect(body).toContain("alex@gmail.com");
    expect(body).toContain("AI-enabled business analyst");
    expect(body).toContain("Prompt design | Data literacy");
    expect(body).toContain("Learn AI basics | Automate a task | Coach a teammate");
    expect(body).toContain("2026-01-02T03:04:05.000Z");
  });

  it("writes a header-only export with the timestamped copy", async () => {
    const pool = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    const result = await writeExport(pool, config);

    expect(result.count).toBe(0);
    expect(writeSpy).toHaveBeenCalledTimes(2);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    expect(writeSpy.mock.calls[1][0]).toBe(
      path.join(path.dirname(EXPORT_FILE), `scopeai_assessments_export_${stamp}.csv`)
    );
  });

  it("propagates pool query failures", async () => {
    const pool = { query: vi.fn().mockRejectedValue(new Error("db down")) };
    await expect(writeExport(pool, config)).rejects.toThrow("db down");
  });
});