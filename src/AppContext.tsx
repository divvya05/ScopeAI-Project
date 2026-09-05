import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { getSessionId } from "./lib/api";
import { loadJson, saveJson } from "./lib/format";
import type { Answers, ResultPayload, UserInfo } from "./types";

export type Route = "landing" | "setup" | "assessment" | "results" | "roles" | "plan";

export interface AppState {
  route: Route;
  navigate: (route: Route) => void;
  scrollToSection: (id: string) => void;
  userInfo: UserInfo;
  setUserInfo: (u: UserInfo) => void;
  answers: Answers;
  setAnswers: (a: Answers) => void;
  results: ResultPayload | null;
  setResults: (r: ResultPayload | null) => void;
  saving: boolean;
  setSaving: (b: boolean) => void;
  error: string | null;
  setError: (msg: string | null) => void;
}

const AppContext = createContext<AppState | null>(null);

const ROUTE_MAP: Record<string, Route> = {
  "": "landing",
  "/": "landing",
  "/setup": "setup",
  "/assessment": "assessment",
  "/results": "results",
  "/roles": "roles",
  "/plan": "plan",
};

function routeFromHash(): Route {
  const h = window.location.hash.replace(/^#/, "");
  return ROUTE_MAP[h] ?? "landing";
}

const defaultUserInfo: UserInfo = {
  type: "self",
  name: "",
  email: "",
  role: "",
  organization: "",
  industry: "",
  teamSize: "",
  aiExperienceLevel: "",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => routeFromHash());
  const [userInfo, setUserInfo] = useState<UserInfo>(() => loadJson("scopeai_draft_user", defaultUserInfo));
  const [answers, setAnswers] = useState<Answers>(() => loadJson("scopeai_draft_answers", {}));
  const [results, setResults] = useState<ResultPayload | null>(() => loadJson("scopeai_results", null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((r: Route) => {
    window.location.hash = r === "landing" ? "#/" : `#/${r}`;
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToSection = useCallback((id: string) => {
    navigate("landing");
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, [navigate]);

  useEffect(() => {
    getSessionId();
  }, []);

  useEffect(() => {
    saveJson("scopeai_draft_user", userInfo);
  }, [userInfo]);

  useEffect(() => {
    saveJson("scopeai_draft_answers", answers);
  }, [answers]);

  useEffect(() => {
    saveJson("scopeai_results", results);
  }, [results]);

  const value = useMemo<AppState>(
    () => ({
      route,
      navigate,
      scrollToSection,
      userInfo,
      setUserInfo,
      answers,
      setAnswers,
      results,
      setResults,
      saving,
      setSaving,
      error,
      setError,
    }),
    [route, navigate, scrollToSection, userInfo, answers, results, saving, error]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}