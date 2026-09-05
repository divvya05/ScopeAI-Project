import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { Question } from "../types";

import { QuestionCard } from "./QuestionCard";

function q(over: Partial<Question>): Question {
  return { id: "q1", category: "awareness", type: "likert", prompt: "How prepared are you?", ...over };
}

describe("QuestionCard", () => {
  it("renders the prompt and required marker", () => {
    render(<QuestionCard question={q({})} value="" onChange={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "How prepared are you?" })).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("shows Answered once a value is set", () => {
    render(<QuestionCard question={q({})} value="3" onChange={vi.fn()} />);
    expect(screen.getByText("Answered")).toBeInTheDocument();
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });

  it("fires onChange with the likert level", async () => {
    const onChange = vi.fn();
    render(<QuestionCard question={q({})} value="" onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "3" }));
    expect(onChange).toHaveBeenCalledWith("q1", "3");
  });

  it("fires onChange with the selected choice option", async () => {
    const onChange = vi.fn();
    const question = q({
      type: "choice",
      options: [
        { label: "Beginner", score: 25 },
        { label: "Advanced", score: 100 },
      ],
    });
    render(<QuestionCard question={question} value="" onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Advanced" }));
    expect(onChange).toHaveBeenCalledWith("q1", "Advanced");
  });

  it("marks the active option as checked", () => {
    const question = q({
      type: "choice",
      options: [
        { label: "Beginner", score: 25 },
        { label: "Advanced", score: 100 },
      ],
    });
    render(<QuestionCard question={question} value="Advanced" onChange={vi.fn()} />);
    const group = screen.getByRole("radiogroup", { name: "How prepared are you?" });
    expect(within(group).getByRole("radio", { name: "Advanced" })).toHaveAttribute("aria-checked", "true");
    expect(within(group).getByRole("radio", { name: "Beginner" })).toHaveAttribute("aria-checked", "false");
  });

  it("edits text questions without marking them required", async () => {
    let current = "";
    function Harness() {
      const [value, setValue] = useState("");
      return (
        <QuestionCard
          question={q({ type: "text", optional: true })}
          value={value}
          onChange={(id, v) => {
            current = v;
            setValue(v);
          }}
        />
      );
    }
    render(<Harness />);
    const textarea = screen.getByRole("textbox", { name: "How prepared are you?" });
    await userEvent.type(textarea, "Hello");
    expect(current).toBe("Hello");
    expect(textarea).toHaveValue("Hello");
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });
});