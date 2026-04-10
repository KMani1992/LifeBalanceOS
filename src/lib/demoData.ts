
import {
  DailyTask,
  FinanceEntry,
  GardenTask,
  Goal,
  Habit,
  KidsActivity,
  Reflection,
  WeeklyReview,
} from "@/types";
import { calculateLifeBalanceScore } from "@/lib/score";

const now = "2026-04-10T08:30:00.000Z";

export const demoDailyTasks: DailyTask[] = [
  {
    id: "task-1",
    title: "Refine leadership presentation",
    category: "career",
    completed: true,
    createdAt: now,
    completedAt: now,
  },
  {
    id: "task-2",
    title: "30 minute mobility session",
    category: "health",
    completed: false,
    createdAt: now,
    completedAt: null,
  },
];

export const demoWeeklyReviews: WeeklyReview[] = [
  {
    id: "review-1",
    weekStart: "2026-03-30",
    careerScore: 7,
    familyScore: 8,
    financeScore: 6,
    peaceScore: 7,
    lifeBalanceScore: calculateLifeBalanceScore(7, 8, 6, 7),
    notes: "Protected focus time improved work quality.",
    createdAt: now,
  },
  {
    id: "review-2",
    weekStart: "2026-04-06",
    careerScore: 8,
    familyScore: 8,
    financeScore: 7,
    peaceScore: 6,
    lifeBalanceScore: calculateLifeBalanceScore(8, 8, 7, 6),
    notes: "Energy dipped mid-week, but routines held.",
    createdAt: now,
  },
];

export const demoGoals: Goal[] = [
  {
    id: "goal-1",
    title: "Complete cloud architecture certification",
    description: "Finish the final labs and schedule the exam.",
    category: "career",
    targetDate: "2026-06-30",
    completed: false,
    completedAt: null,
    createdAt: now,
  },
  {
    id: "goal-2",
    title: "Build emergency fund to six months",
    description: "Increase monthly transfer into the reserve account.",
    category: "finance",
    targetDate: "2026-12-31",
    completed: false,
    completedAt: null,
    createdAt: now,
  },
];

export const demoKidsActivities: KidsActivity[] = [
  {
    id: "kids-1",
    childName: "Aadhav",
    activityType: "study",
    description: "Reading practice with flash cards.",
    activityDate: "2026-04-10",
    rating: 4,
    createdAt: now,
  },
];

export const demoFinanceEntries: FinanceEntry[] = [
  {
    id: "finance-1",
    type: "income",
    category: "Salary",
    amount: 6500,
    notes: "Monthly salary deposit",
    entryDate: "2026-04-01",
    createdAt: now,
  },
  {
    id: "finance-2",
    type: "expense",
    category: "Housing",
    amount: 1800,
    notes: "Rent payment",
    entryDate: "2026-04-02",
    createdAt: now,
  },
];

export const demoReflections: Reflection[] = [
  {
    id: "reflection-1",
    reflectionDate: "2026-04-10",
    wentWell: "I stayed present in meetings and at dinner.",
    learnedToday: "My energy is better when I block deep work before lunch.",
    improveTomorrow: "Start the day without checking messages immediately.",
    mood: 8,
    createdAt: now,
  },
];

export const demoHabits: Habit[] = [
  {
    id: "habit-1",
    title: "Learning",
    category: "learning",
    targetFrequency: 7,
    streak: 8,
    completedToday: true,
    createdAt: now,
  },
  {
    id: "habit-2",
    title: "Family conversation",
    category: "family",
    targetFrequency: 7,
    streak: 12,
    completedToday: true,
    createdAt: now,
  },
];

export const demoGardenTasks: GardenTask[] = [
  {
    id: "garden-1",
    taskName: "Water raised beds",
    description: "Focus on tomatoes and greens before sunset.",
    dueDate: "2026-04-10",
    completed: false,
    completedAt: null,
    createdAt: now,
  },
];
