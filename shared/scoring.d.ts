// Ambient types for the shared scoring module (plain JS logic).
// The frontend wrapper (src/lib/scoring.ts) casts to full signatures.

export declare const scoreAnswer: (question: any, answer?: string) => number | undefined;
export declare const computeScores: any;
export declare const levelFor: any;
export declare const strengthsAndGaps: any;
export declare const roleMatches: any;
export declare const buildReportSummary: any;
export declare const buildCapabilityPlan: any;
export declare const validateAnswers: any;