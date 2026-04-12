export const OVERVIEW_SPOTLIGHT_STATS = [
  {
    label: "Career",
    value: "Goals + habits",
    support: "Keep learning, execution, and review loops visible together.",
    accent: "#1E88E5",
  },
  {
    label: "Family",
    value: "Kids + routines",
    support: "Notice patterns in attention, consistency, and presence at home.",
    accent: "#43A047",
  },
  {
    label: "Finance",
    value: "Cash flow clarity",
    support: "Track income, spending, savings, and investment momentum in one place.",
    accent: "#FB8C00",
  },
  {
    label: "Peace",
    value: "Reflection + recovery",
    support: "Make calm measurable through rhythms, reviews, and daily reflection.",
    accent: "#8E24AA",
  },
] as const;

export const OVERVIEW_MODULES = [
  {
    title: "Career Growth",
    description: "Goals, learning, and execution rhythms that compound over time.",
    href: "/dashboard",
  },
  {
    title: "Family Stability",
    description: "Shared routines, kids development, and intentional relationships.",
    href: "/kids",
  },
  {
    title: "Financial Security",
    description: "Income, spending, savings, investing, and confidence in the numbers.",
    href: "/finance",
  },
  {
    title: "Personal Peace",
    description: "Habits, reflections, calm review loops, and sustainable energy.",
    href: "/reflections",
  },
] as const;
