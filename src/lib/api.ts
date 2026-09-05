import type { Answers, ResultPayload, UserInfo } from "../types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string })?.error || `Request failed (${res.status})`);
  }
  return body as T;
}

export function getSessionId() {
  let id = sessionStorage.getItem("scopeai_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("scopeai_session_id", id);
  }
  return id;
}

export async function saveSession(userInfo: UserInfo) {
  return request<{ ok: boolean; userId?: string }>("/api/session/save", {
    method: "POST",
    body: JSON.stringify({ sessionId: getSessionId(), ...userInfo }),
  });
}

export async function saveDraft(stepIndex: number, answers: Answers) {
  return request<{ ok: boolean }>("/api/draft/save", {
    method: "POST",
    body: JSON.stringify({
      sessionId: getSessionId(),
      stepIndex,
      payload: { answers, updatedAt: new Date().toISOString() },
    }),
  });
}

export async function submitAssessment(userInfo: UserInfo, answers: Answers) {
  return request<ResultPayload & { ok?: boolean }>(
    "/api/assessment/submit",
    {
      method: "POST",
      body: JSON.stringify({
        sessionId: getSessionId(),
        ...userInfo,
        answers,
      }),
    }
  );
}

export async function downloadOrgExport() {
  const res = await fetch("/api/export");
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Export failed" }));
    throw new Error((body as { error?: string }).error || "Export failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "scopeai_assessments_export.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function pingHealth() {
  return request<{ ok: boolean; db: string }>("/api/health");
}