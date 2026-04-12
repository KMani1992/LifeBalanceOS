import { DailyTaskCategory, FinanceEntryType, GoalCategory, HabitCategory } from "@/types";

export const FINANCE_ENTRY_TYPES: FinanceEntryType[] = ["income", "expense", "savings", "investment", "other"];

export const GOAL_CATEGORIES: GoalCategory[] = ["career", "family", "finance", "peace"];

export const HABIT_CATEGORIES: HabitCategory[] = ["learning", "exercise", "kids", "family", "reflection", "other"];

export const KIDS_PERFORMANCE_LEVELS = ["Good", "Avg", "Low"] as const;

export const KIDS_FOCUS_AREAS = ["Study", "Discipline", "Health", "Emotional", "Creativity", "Social", "Other"] as const;

export const DAILY_DEFAULT_RECURRING_TASKS: Array<{ title: string; category: DailyTaskCategory }> = [
  { title: "Kids Time", category: "kids" },
  { title: "Teaching", category: "career" },
  { title: "Play", category: "family" },
  { title: "Reflection", category: "personal" },
];
