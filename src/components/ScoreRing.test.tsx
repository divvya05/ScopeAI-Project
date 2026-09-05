import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScoreRing } from "./ScoreRing";

describe("ScoreRing", () => {
  it("renders the score, label and accessible description", () => {
    render(<ScoreRing score={75} color="#06B6D4" label="Overall readiness" animated={false} />);
    expect(screen.getByRole("img", { name: "Overall readiness score: 75 out of 100" })).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
    expect(screen.getByText("Overall readiness")).toBeInTheDocument();
  });

  it("clamps edge values like 100", () => {
    render(<ScoreRing score={100} color="#10B981" label="Leading" animated={false} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
  });

  it("starts at zero and animates to the score", async () => {
    render(<ScoreRing score={80} color="#2563EB" label="Developing" animated />);
    expect(screen.getByText("0")).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 120));
    expect(screen.getByText("80")).toBeInTheDocument();
  });
});