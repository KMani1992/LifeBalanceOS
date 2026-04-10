
export type LifePillar = "career" | "family" | "finance" | "peace";

export type DailyTaskCategory =
  | "career"
  | "health"
  | "family"
  | "kids"
  | "finance"
  | "personal";

export type GoalCategory = "career" | "family" | "finance" | "peace";

export type KidsActivityType =
  | "study"
  | "behavior"
  | "physical"
  | "creativity";

export type FinanceEntryType =
  | "income"
  | "expense"
  | "savings"
  | "investment";

export type HabitCategory =
  | "learning"
  | "exercise"
  | "kids"
  | "family"
  | "reflection";

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  title: string;
  category: DailyTaskCategory;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  careerScore: number;
  familyScore: number;
  financeScore: number;
  peaceScore: number;
  lifeBalanceScore: number;
  notes: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface KidsActivity {
  id: string;
  childName: string;
  activityType: KidsActivityType;
  description: string;
  activityDate: string;
  rating: number;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  type: FinanceEntryType;
  category: string;
  amount: number;
  notes: string;
  entryDate: string;
  createdAt: string;
}

export interface Reflection {
  id: string;
  reflectionDate: string;
  wentWell: string;
  learnedToday: string;
  improveTomorrow: string;
  mood: number;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  targetFrequency: number;
  streak: number;
  completedToday: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedDate: string;
  createdAt: string;
}

export interface GardenTask {
  id: string;
  taskName: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface PillarSummary {
  key: LifePillar;
  title: string;
  description: string;
  score: number;
  color: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface UserProfileRow {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
}

export interface DailyTaskRow {
  id: string;
  user_id: string;
  title: string;
  category: DailyTaskCategory;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface WeeklyReviewRow {
  id: string;
  user_id: string;
  week_start: string;
  career_score: number;
  family_score: number;
  finance_score: number;
  peace_score: number;
  life_balance_score: number;
  notes: string | null;
  created_at: string;
}

export interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  target_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface KidsActivityRow {
  id: string;
  user_id: string;
  child_name: string | null;
  activity_type: KidsActivityType;
  description: string | null;
  activity_date: string | null;
  rating: number | null;
  created_at: string;
}

export interface FinanceEntryRow {
  id: string;
  user_id: string;
  type: FinanceEntryType;
  category: string | null;
  amount: number;
  notes: string | null;
  entry_date: string | null;
  created_at: string;
}

export interface ReflectionRow {
  id: string;
  user_id: string;
  reflection_date: string | null;
  went_well: string | null;
  learned_today: string | null;
  improve_tomorrow: string | null;
  mood: number | null;
  created_at: string;
}

export interface HabitRow {
  id: string;
  user_id: string;
  title: string;
  category: HabitCategory;
  target_frequency: number;
  created_at: string;
}

export interface HabitLogRow {
  id: string;
  habit_id: string;
  completed_date: string | null;
  created_at: string;
}

export interface GardenTaskRow {
  id: string;
  user_id: string;
  task_name: string | null;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export const moduleColors: Record<LifePillar, string> = {
  career: "#1E88E5",
  family: "#43A047",
  finance: "#FB8C00",
  peace: "#8E24AA",
};
