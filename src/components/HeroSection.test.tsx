import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../AppContext";
import { copy } from "../config/assessmentConfig";

import { HeroSection } from "./HeroSection";

function renderHero() {
  return render(
    <AppProvider>
      <HeroSection />
    </AppProvider>
  );
}

describe("HeroSection", () => {
  it("renders the headline, sub and primary CTA", () => {
    renderHero();
    expect(screen.getByRole("heading", { name: "Know your team's AI potential." })).toBeInTheDocument();
    expect(screen.getByText(copy.hero.sub)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start assessment." })).toBeInTheDocument();
  });

  it("navigates to setup when the primary CTA is clicked", async () => {
    renderHero();
    await userEvent.click(screen.getByRole("button", { name: "Start assessment." }));
    expect(window.location.hash).toBe("#/setup");
  });

  it("renders the secondary CTA", () => {
    renderHero();
    expect(screen.getByRole("button", { name: "See how ScopeAI works." })).toBeInTheDocument();
  });
});