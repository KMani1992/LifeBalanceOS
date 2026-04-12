export type RouteMeta = {
  title: string;
  subtitle: string;
};

export const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "Overview",
    subtitle: "Design a week that feels calm, intentional, and measurable.",
  },
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Monitor balance across the four life pillars and today's execution.",
  },
  "/daily": {
    title: "Daily Planner",
    subtitle: "Keep the day finite, visible, and actionable.",
  },
  "/weekly-review": {
    title: "Weekly Review",
    subtitle: "Review the week honestly and reset the next one with clarity.",
  },
  "/goals": {
    title: "Goals",
    subtitle: "Translate long-term direction into a few meaningful active commitments.",
  },
  "/kids": {
    title: "Kids",
    subtitle: "Track small observations that compound into growth over time.",
  },
  "/finance": {
    title: "Finance",
    subtitle: "Watch cash flow, savings momentum, and confidence in the numbers.",
  },
  "/habits": {
    title: "Habits",
    subtitle: "Keep rhythm-based behaviors visible enough to sustain them.",
  },
  "/reflections": {
    title: "Reflections",
    subtitle: "Capture lessons, wins, and tomorrow's adjustment while it is fresh.",
  },
  "/garden": {
    title: "Garden",
    subtitle: "Keep recurring home care simple, visible, and easy to complete.",
  },
  "/knowledge-base": {
    title: "Knowledge Base",
    subtitle: "Bilingual quick guide for daily rhythm and intentional decisions.",
  },
};
