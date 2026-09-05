// ============================================================
// ScopeAI — assessment configuration (single source of truth)
// Shared between the Vite frontend and the Express backend.
// Edit questions, dimensions, roles and copy here only.
// ============================================================

export const categories = [
  {
    id: "awareness",
    label: "AI awareness & concepts",
    short: "AI awareness",
    blurb:
      "Understanding what AI can and can't do, and how it shows up in everyday work.",
  },
  {
    id: "tools",
    label: "AI tool usage & workflows",
    short: "Tool usage",
    blurb:
      "Hands-on fluency with AI assistants, copilots and generators in real workflows.",
  },
  {
    id: "digital",
    label: "Digital fluency & data literacy",
    short: "Data & digital",
    blurb:
      "Comfort reading data, using digital tools and telling trustworthy numbers from noise.",
  },
  {
    id: "problem",
    label: "Problem solving & critical thinking",
    short: "Problem solving",
    blurb:
      "Structured thinking, breaking problems down, and critically evaluating AI outputs.",
  },
  {
    id: "adaptable",
    label: "Adaptability & learning mindset",
    short: "Adaptability",
    blurb:
      "How quickly people adopt new tools, learn on their own and recover from AI hiccups.",
  },
  {
    id: "collaboration",
    label: "Collaboration & communication in AI contexts",
    short: "Collaboration",
    blurb:
      "Discussing AI with teammates, sharing tool knowledge and working on AI-powered projects.",
  },
  {
    id: "responsible",
    label: "Responsible & ethical AI awareness",
    short: "Responsible AI",
    blurb:
      "Privacy, bias and impact awareness when using AI in decisions that affect people.",
  },
  {
    id: "role",
    label: "Role-specific readiness",
    short: "Role readiness",
    blurb:
      "Readiness to apply and champion AI within their own role, team or organization.",
  },
];

// Low / high anchors for 1-5 scale questions.
export const likertAnchors = { low: "Not yet", high: "Very much" };

// Every scored option carries an explicit 0-100 score; text questions are optional context.
export const questions = [
  // ---- AI awareness & concepts -----------------------------------
  {
    id: "awareness-1",
    category: "awareness",
    type: "likert",
    prompt: "How familiar are you with what AI can do in everyday work today?",
    lowLabel: "Not at all familiar",
    highLabel: "Very familiar",
    help: "Think about conversational assistants, image tools, spell-checkers, recommendations and similar.",
  },
  {
    id: "awareness-2",
    category: "awareness",
    type: "choice",
    prompt: "How would you describe your current understanding of AI and how it works?",
    options: [
      { label: "I haven't had much exposure — AI still feels abstract.", score: 0 },
      { label: "I have a general sense of AI and a few everyday examples.", score: 25 },
      { label: "I understand the main types of AI (chatbots, writers, image tools) and how people use them.", score: 50 },
      { label: "I can explain ideas like models, training and prompts to others.", score: 75 },
      { label: "I follow AI developments closely and can evaluate new tools critically.", score: 100 },
    ],
  },
  {
    id: "awareness-3",
    category: "awareness",
    type: "cards",
    prompt: "Which statement best matches how you think about AI's role in work today?",
    options: [
      { label: "AI is a trend I'm curious about, but I'm not sure it affects me yet.", score: 25 },
      { label: "AI is becoming part of everyday tools — I want to use it well.", score: 50 },
      { label: "AI is already reshaping my field — I need to stay ahead of it.", score: 75 },
      { label: "AI is central to my work — I actively shape how it's used.", score: 100 },
    ],
  },

  // ---- AI tool usage & workflows ---------------------------------
  {
    id: "tools-1",
    category: "tools",
    type: "likert",
    prompt: "How often do you use AI tools (chat assistants, copilots, writers, image generators) in your day-to-day work?",
    lowLabel: "Never",
    highLabel: "Several times a day",
  },
  {
    id: "tools-2",
    category: "tools",
    type: "choice",
    prompt: "Which best describes how AI fits into your workflows today?",
    options: [
      { label: "I don't use AI tools at work yet.", score: 0 },
      { label: "I've tried a few tools here and there.", score: 25 },
      { label: "I use one or two AI tools regularly for specific tasks.", score: 50 },
      { label: "I use several AI tools across different parts of my work.", score: 75 },
      { label: "I design workflows that rely on AI, or coach others on it.", score: 100 },
    ],
  },
  {
    id: "tools-3",
    category: "tools",
    type: "likert",
    prompt: "How confident are you in shaping AI output — for example, writing a clear prompt or adjusting one until the result is useful?",
    lowLabel: "Not confident",
    highLabel: "Very confident",
  },
  {
    id: "tools-4",
    category: "tools",
    type: "text",
    prompt: "Which AI tools do you currently use (if any)? Name a few — it helps us tailor your report.",
    placeholder: "e.g. a chat assistant, a copilot in my editor, a meeting summarizer…",
    optional: true,
  },

  // ---- Digital fluency & data literacy ---------------------------
  {
    id: "digital-1",
    category: "digital",
    type: "likert",
    prompt: "How comfortable are you working with spreadsheets, dashboards or structured data?",
    lowLabel: "Not comfortable",
    highLabel: "Very comfortable",
  },
  {
    id: "digital-2",
    category: "digital",
    type: "choice",
    prompt: "When you look at a chart or a table of results, how comfortable are you drawing a simple, correct conclusion?",
    options: [
      { label: "I usually skip them or find them hard to follow.", score: 0 },
      { label: "I can read most charts with some effort.", score: 25 },
      { label: "I can interpret most charts and numbers on my own.", score: 50 },
      { label: "I regularly use data to inform decisions.", score: 75 },
      { label: "I'm comfortable exploring and analyzing data independently.", score: 100 },
    ],
  },
  {
    id: "digital-3",
    category: "digital",
    type: "likert",
    prompt: "How comfortable are you judging whether a number or statistic is trustworthy and meaningful?",
    lowLabel: "Not comfortable",
    highLabel: "Very comfortable",
  },

  // ---- Problem solving & critical thinking -----------------------
  {
    id: "problem-1",
    category: "problem",
    type: "choice",
    prompt: "When you face a new problem at work, how do you usually start?",
    options: [
      { label: "I look for a ready-made solution or wait for instructions.", score: 0 },
      { label: "I brainstorm with others before diving in.", score: 50 },
      { label: "I break it down into smaller pieces and test ideas.", score: 75 },
      { label: "I clarify the goal, gather evidence, then iterate.", score: 100 },
    ],
  },
  {
    id: "problem-2",
    category: "problem",
    type: "likert",
    prompt: "How comfortable are you breaking a large task into clear, manageable steps?",
    lowLabel: "Not comfortable",
    highLabel: "Very comfortable",
  },
  {
    id: "problem-3",
    category: "problem",
    type: "likert",
    prompt: "When AI gives you a quick answer, how likely are you to check it for accuracy before acting on it?",
    lowLabel: "Almost never",
    highLabel: "Almost always",
  },

  // ---- Adaptability & learning mindset ---------------------------
  {
    id: "adaptable-1",
    category: "adaptable",
    type: "choice",
    prompt: "When new technology changes the way you work, your typical reaction is…",
    options: [
      { label: "Resistant or worried about the change.", score: 0 },
      { label: "I go along with it when it's required of me.", score: 25 },
      { label: "Curious and willing to try it.", score: 75 },
      { label: "I look for ways to adopt it early.", score: 100 },
    ],
  },
  {
    id: "adaptable-2",
    category: "adaptable",
    type: "likert",
    prompt: "How often do you learn new skills or tools on your own time?",
    lowLabel: "Rarely",
    highLabel: "All the time",
  },
  {
    id: "adaptable-3",
    category: "adaptable",
    type: "choice",
    prompt: "If an AI tool gives you a wrong or strange result, what do you usually do?",
    options: [
      { label: "Give up on the tool.", score: 0 },
      { label: "Retry once or twice, then give up.", score: 25 },
      { label: "Rephrase my request and try again.", score: 75 },
      { label: "Debug the prompt, inspect the process and improve it.", score: 100 },
    ],
  },

  // ---- Collaboration & communication -------------------------------
  {
    id: "collaboration-1",
    category: "collaboration",
    type: "likert",
    prompt: "How comfortable are you discussing AI topics with colleagues?",
    lowLabel: "Not comfortable",
    highLabel: "Very comfortable",
  },
  {
    id: "collaboration-2",
    category: "collaboration",
    type: "choice",
    prompt: "Have you ever shown or explained an AI tool to someone else?",
    options: [
      { label: "No, never.", score: 0 },
      { label: "I've mentioned AI tools in conversation.", score: 25 },
      { label: "I've shown a colleague how to use one.", score: 50 },
      { label: "I regularly help teammates use AI tools.", score: 75 },
      { label: "I lead sessions or documentation on AI use at work.", score: 100 },
    ],
  },
  {
    id: "collaboration-3",
    category: "collaboration",
    type: "likert",
    prompt: "How confident are you collaborating on projects that include AI tools or AI-produced outputs?",
    lowLabel: "Not confident",
    highLabel: "Very confident",
  },

  // ---- Responsible & ethical AI awareness -------------------------
  {
    id: "responsible-1",
    category: "responsible",
    type: "choice",
    prompt: "When using AI at work, how do you typically handle privacy and sensitive information?",
    options: [
      { label: "I haven't thought about it.", score: 0 },
      { label: "I assume tools handle data safely on their own.", score: 25 },
      { label: "I'm careful about what I share, but rely on the tool's defaults.", score: 50 },
      { label: "I check privacy settings and avoid entering sensitive data.", score: 75 },
      { label: "I apply data-handling guidance and flag risks to others.", score: 100 },
    ],
  },
  {
    id: "responsible-2",
    category: "responsible",
    type: "choice",
    prompt: "Which best describes how you think about bias in AI outputs?",
    options: [
      { label: "I haven't considered it.", score: 0 },
      { label: "I've heard AI can be biased, but I'm unsure what it means for me.", score: 25 },
      { label: "I understand AI can reflect bias and I try to review outputs accordingly.", score: 50 },
      { label: "I actively look for skewed or unfair results in what AI produces.", score: 75 },
      { label: "I check for bias and help shape fairer AI use in my team.", score: 100 },
    ],
  },
  {
    id: "responsible-3",
    category: "responsible",
    type: "likert",
    prompt: "How aware are you of who could be affected — positively or negatively — by decisions informed by AI?",
    lowLabel: "Not aware",
    highLabel: "Very aware",
  },

  // ---- Role-specific readiness -------------------------------------
  {
    id: "role-1",
    category: "role",
    type: "likert",
    prompt: "How ready are you to use AI to improve the core parts of your role (or your team's work)?",
    lowLabel: "Not ready",
    highLabel: "Very ready",
  },
  {
    id: "role-2",
    category: "role",
    type: "choice",
    prompt: "If you were offered a chance to work on an AI-related initiative, you would most likely…",
    options: [
      { label: "Prefer to stay with tasks I already know.", score: 0 },
      { label: "Get involved if someone guides me.", score: 50 },
      { label: "Volunteer and bring ideas to the table.", score: 75 },
      { label: "Take a lead or coordinating role.", score: 100 },
    ],
  },
  {
    id: "role-3",
    category: "role",
    type: "likert",
    prompt: "How comfortable would you be supporting or guiding others to use AI responsibly at work?",
    lowLabel: "Not comfortable",
    highLabel: "Very comfortable",
  },
  {
    id: "role-4",
    category: "role",
    type: "text",
    prompt: "What is the biggest AI-related question you'd like to answer for your role or team?",
    placeholder: "e.g. Which tasks can we safely hand to AI? How do we get started?",
    optional: true,
  },
];

export const levels = [
  {
    key: "emerging",
    min: 0,
    max: 39,
    label: "Emerging",
    color: "#F59E0B",
    description:
      "You're at the start of the AI journey. With a focused foundation in AI basics and tool practice, momentum can come quickly.",
  },
  {
    key: "developing",
    min: 40,
    max: 59,
    label: "Developing",
    color: "#2563EB",
    description:
      "A solid base is in place. Strengthening hands-on practice and data comfort will turn early familiarity into dependable skill.",
  },
  {
    key: "ready",
    min: 60,
    max: 79,
    label: "Ready",
    color: "#06B6D4",
    description:
      "Capable and dependable with AI tools. You're positioned to apply AI across real workflows and support teammates.",
  },
  {
    key: "leading",
    min: 80,
    max: 100,
    label: "Leading",
    color: "#10B981",
    description:
      "Advanced AI fluency. Ideal for guiding adoption, designing workflows and shaping how your organization works with AI.",
  },
];

export const roles = [
  {
    id: "business-analyst",
    title: "AI-enabled business analyst",
    summary:
      "Uses AI to sharpen analysis — summarizing large amounts of information, spotting patterns and turning data into clear recommendations.",
    focus: ["Analysis & reporting", "Data storytelling", "AI-assisted research"],
    weights: { awareness: 1, tools: 2, digital: 3, problem: 3, adaptable: 2, collaboration: 2, responsible: 1, role: 2 },
  },
  {
    id: "product-specialist",
    title: "AI product specialist",
    summary:
      "Helps choose, evaluate and adopt AI products for a team — bridging what users need with what tools can deliver.",
    focus: ["Tool evaluation", "User needs", "Adoption & rollout"],
    weights: { awareness: 2, tools: 3, digital: 2, problem: 3, adaptable: 3, collaboration: 3, responsible: 2, role: 2 },
  },
  {
    id: "prompt-designer",
    title: "Prompt & workflow designer",
    summary:
      "An emerging craft of writing effective prompts and chaining AI steps into reliable, reusable workflows.",
    focus: ["Prompt design", "Workflow automation", "Output quality"],
    weights: { awareness: 2, tools: 3, digital: 1, problem: 2, adaptable: 2, collaboration: 2, responsible: 1, role: 2 },
  },
  {
    id: "data-insights",
    title: "Data & insights specialist",
    summary:
      "Comfortable with numbers: cleans, interprets and visualizes data, and uses AI to move from raw data to insight faster.",
    focus: ["Data analysis", "Visualization", "Statistical thinking"],
    weights: { awareness: 1, tools: 2, digital: 3, problem: 3, adaptable: 1, collaboration: 2, responsible: 1, role: 1 },
  },
  {
    id: "automation",
    title: "Automation specialist",
    summary:
      "Finds repetitive, rule-based tasks and designs AI-assisted automation so the team spends time on higher-value work.",
    focus: ["Process mapping", "Automation", "ROI-minded thinking"],
    weights: { awareness: 1, tools: 3, digital: 2, problem: 3, adaptable: 2, collaboration: 1, responsible: 1, role: 2 },
  },
  {
    id: "project-coordinator",
    title: "AI project coordinator",
    summary:
      "Keeps AI initiatives moving — planning, communicating, tracking risks and making sure people and timelines stay aligned.",
    focus: ["Planning & tracking", "Stakeholder comms", "Risk spotting"],
    weights: { awareness: 2, tools: 2, digital: 1, problem: 2, adaptable: 2, collaboration: 3, responsible: 2, role: 3 },
  },
  {
    id: "responsible-ai",
    title: "Responsible AI champion",
    summary:
      "The voice of safe, fair AI use in the team — privacy, bias, transparency and honest guardrails.",
    focus: ["Privacy & security", "Bias awareness", "Governance basics"],
    weights: { awareness: 3, tools: 1, digital: 1, problem: 2, adaptable: 2, collaboration: 3, responsible: 3, role: 2 },
  },
  {
    id: "transformation-lead",
    title: "AI transformation lead",
    summary:
      "Connects strategy to practice — helps leadership set an AI agenda and equips the organization to execute on it.",
    focus: ["Strategy & roadmaps", "Change management", "Executive communication"],
    weights: { awareness: 3, tools: 2, digital: 2, problem: 3, adaptable: 3, collaboration: 3, responsible: 3, role: 3 },
  },
];

export const industries = [
  "Technology",
  "Professional services",
  "Finance & banking",
  "Healthcare & life sciences",
  "Education",
  "Retail & e-commerce",
  "Manufacturing & logistics",
  "Media & marketing",
  "Government & public sector",
  "Energy & utilities",
  "Non-profit",
  "Other",
];

export const experienceLevels = [
  { label: "None", hint: "Little or no hands-on AI use yet." },
  { label: "Beginner", hint: "Tried a few AI tools, still learning." },
  { label: "Intermediate", hint: "Using AI tools regularly in work." },
  { label: "Advanced", hint: "Deeply embedded; could coach others." },
];

// Learning catalogue used by rule-based recommendations and capability plans.
export const resources = {
  awareness: {
    skill: "AI fundamentals",
    micro: "Get comfortable with what AI is — and is not.",
    courses: ["Google AI Essentials (no-cost starter)", "Elements of AI (University of Helsinki, free)", "So You Want to Be an AI Expert (no-cost mini-course)"],
    project: "Pick three work tasks you do weekly and identify which are automatable or could use an AI assistant.",
  },
  tools: {
    skill: "Hands-on tool fluency & prompt design",
    micro: "Turn curiosity about AI tools into dependable daily practice.",
    courses: ["Prompt Engineering for Everyone (short course)", "AI Tool Playbooks for your job family (no-cost guides)", "Google Prompting Essentials (practice-based)"],
    project: "Build a small RAG chatbot for internal docs — start with a short prompt library over your own team documents.",
  },
  digital: {
    skill: "Data literacy",
    micro: "Get comfortable reading, questioning and presenting numbers.",
    courses: ["Data-Driven Decision Making foundations", "Spreadsheet & dashboard basics for non-analysts", "Analyzing Data with AI (Beginner)"],
    project: "Take one monthly report you receive, rebuild it in a spreadsheet, and surface one insight with AI assistance.",
  },
  problem: {
    skill: "Structured problem solving",
    micro: "Strengthen the thinking that makes AI outputs trustworthy.",
    courses: ["Critical Thinking for the AI Age", "Framework for breaking down ambiguous problems", "Evaluating AI outputs: checks and red flags"],
    project: "Run a small experiment: give an AI task to three tools, compare outputs, and document a verdict for each.",
  },
  adaptable: {
    skill: "Learning mindset & tool adoption",
    micro: "Build routines that make adopting new tools a habit, not an event.",
    courses: ["Learning how to learn (free, universally loved)", "Digital habits for continuous upskilling"],
    project: "Adopt one new AI tool per month for a real task; keep a 2-line log of what worked and what didn't.",
  },
  collaboration: {
    skill: "AI communication & knowledge sharing",
    micro: "Turn personal tool knowledge into team capability.",
    courses: ["Communicating AI value to non-technical audiences", "Leading AI adoption on small teams"],
    project: "Run a 30-minute 'AI show-and-tell' for your team, then document the top-3 tips as a one-pager.",
  },
  responsible: {
    skill: "Responsible & ethical AI practice",
    micro: "The confidence to use AI in ways that are safe, fair and defensible.",
    courses: ["Responsible AI practices (no-cost)", "Privacy and security first steps with AI tools", "Spotting bias in AI outputs"],
    project: "Create a short 'safe sharing' guide for your team: what can and can't go into public AI tools.",
  },
  role: {
    skill: "Role-specific AI application",
    micro: "Connect AI capabilities directly to the outcomes your role owns.",
    courses: ["AI in your function: intro playbooks (marketing, ops, service, finance, and more)"],
    project: "Map the top 5 tasks in your role, rate each for AI-readiness, and prototype AI help for the top one.",
  },
};

export const capabilityPlanCatalog = {
  short: (gaps, resources_by_id) => [
    `Start with ${gaps.slice(0, 2).map((g) => resources_by_id[g].skill.toLowerCase()).join(" and ")}.`,
    "Use an AI assistant for one routine task each week and compare the result with your own work.",
    "Complete one foundation course from the recommended resources.",
  ],
  medium: (gaps, resources_by_id) => [
    `Deepen the highest-priority skill: ${resources_by_id[gaps[0]].skill}.`,
    "Build the recommended starter project and document what you learned.",
    "Automate at least one 30-minute weekly task with an AI workflow.",
  ],
  long: [
    "Coach one teammate on an AI task they find difficult.",
    "Lead a small responsible-AI review (privacy and bias check) for your team's tools.",
    "Define a personal goal to connect AI skill to a measurable business outcome.",
  ],
};

export const aiModels = {
  general: {
    // General-purpose open model for summaries & role-match copy.
    name: "Llama 3.1 (8B)",
    modelId: "llama3.1",
    when: "After scores are computed — generates the natural-language report summary and refines role-match descriptions.",
    promptExample:
      "Given this AI readiness score and category breakdown, generate a 3-paragraph summary of strengths, gaps, and next steps in simple language.",
  },
  fast: {
    // Small, fast open model for microcopy and short explanations.
    name: "Gemma 2 (9B)",
    modelId: "gemma2",
    when: "For quick explanation snippets and microcopy inside the results dashboard.",
    promptExample:
      "Given these category scores and role preferences, list 3 potential AI-related roles and explain why they might fit.",
  },
};

export const disclaimers = {
  results:
    "ScopeAI provides directional insights into AI readiness and potential. Results should be used as guidance, not as a formal evaluation or guarantee of performance or career outcomes.",
  matching:
    "Role matches are suggestions based on assessment results and general ability patterns — not a guarantee of fit, hireability or job performance.",
};

// Brand copy — one hero headline, a concise supporting line, and the
// remaining taglines reused across sections and cards.
export const copy = {
  hero: {
    headline: "Know your team's AI potential.",
    sub: "Clear insights into AI readiness — for every role and every team.",
    ctaPrimary: "Start assessment.",
    ctaSecondary: "See how ScopeAI works.",
  },
  taglines: [
    "Are you ready for the AI revolution? ScopeAI gives you a grounded, honest answer.",
    "AI Era Readiness Calculator for individuals, teams, and organizations.",
    "Bridge the gap to AI capability.",
    "Match the right talent to the right AI role.",
  ],
  sections: {
    whatItMeasures: "What ScopeAI measures",
    whyItMatters: "Why AI readiness matters",
    whatYouGet: "What you get after the assessment",
    howItWorks: "How ScopeAI works",
  },
  ctaFinal: {
    headline: "Bridge the gap to AI capability.",
    sub: "A 5-minute assessment. A clear picture of readiness. A path forward that fits.",
    cta: "Start assessment.",
  },
};

export default {
  categories,
  questions,
  levels,
  roles,
  industries,
  experienceLevels,
  resources,
  capabilityPlanCatalog,
  aiModels,
  disclaimers,
  copy,
  likertAnchors,
};