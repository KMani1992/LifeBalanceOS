import { DailyTaskCategory, FinanceEntryType, GoalCategory, HabitCategory, SubCategory, FamilySubCategory, PeaceSubCategory } from "@/types";

export const FINANCE_ENTRY_TYPES: FinanceEntryType[] = ["income", "expense", "savings", "investment", "other"];

export const GOAL_CATEGORIES: GoalCategory[] = ["career", "family", "finance", "peace"];

export const SUB_CATEGORIES: SubCategory[] = ["kids", "health", "personal", "general"];

export const FAMILY_SUB_CATEGORIES: FamilySubCategory[] = ["kids", "general"];

export const PEACE_SUB_CATEGORIES: PeaceSubCategory[] = ["health", "personal", "general"];

/**
 * Map category to available sub-categories
 */
export function getSubCategoryOptions(category: DailyTaskCategory): SubCategory[] {
  switch (category) {
    case "family":
      return FAMILY_SUB_CATEGORIES;
    case "peace":
      return PEACE_SUB_CATEGORIES;
    default:
      return ["general"];
  }
}

/**
 * Map old 6-category values to 4-pillar + sub_category for backward compatibility
 */
export function normalizeDailyTaskCategory(
  oldCategory: string,
): { category: DailyTaskCategory; subCategory?: SubCategory } {
  switch (oldCategory) {
    case "kids":
      return { category: "family", subCategory: "kids" };
    case "health":
      return { category: "peace", subCategory: "health" };
    case "personal":
      return { category: "peace", subCategory: "personal" };
    case "career":
    case "family":
    case "finance":
    case "peace":
      return { category: oldCategory as DailyTaskCategory, subCategory: "general" };
    default:
      return { category: "peace", subCategory: "general" };
  }
}

export const HABIT_CATEGORIES: HabitCategory[] = ["learning", "exercise", "kids", "family", "reflection", "other"];

export const KIDS_PERFORMANCE_LEVELS = ["Good", "Avg", "Low"] as const;

export const KIDS_FOCUS_AREAS = ["Study", "Discipline", "Health", "Emotional", "Creativity", "Social", "Other"] as const;

export const DAILY_DEFAULT_RECURRING_TASKS: Array<{ title: string; category: DailyTaskCategory }> = [
  { title: "Kids Time", category: "family" },
  { title: "Teaching", category: "career" },
  { title: "Play", category: "family" },
  { title: "Reflection", category: "peace" },
];
