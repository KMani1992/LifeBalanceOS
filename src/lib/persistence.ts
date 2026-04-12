
import { User } from "@supabase/supabase-js";
import { calculateLifeBalanceScore } from "@/lib/score";
import { supabase } from "@/lib/supabaseClient";
import {
  DailyTask,
  DailyTaskCategory,
  DailyTaskRow,
  FinanceEntry,
  FinanceEntryRow,
  FinanceEntryType,
  GardenTask,
  GardenTaskRow,
  Goal,
  GoalSubTask,
  GoalSubTaskRow,
  GoalCategory,
  GoalRow,
  Habit,
  HabitCategory,
  HabitLogRow,
  HabitRow,
  KidsActivity,
  KidsActivityRow,
  KidsActivityType,
  Reflection,
  ReflectionRow,
  UserProfile,
  UserProfileRow,
  WeeklyReview,
  WeeklyReviewRow,
} from "@/types";

export interface ApplicationData {
  dailyTasks: DailyTask[];
  weeklyReviews: WeeklyReview[];
  goals: Goal[];
  kidsActivities: KidsActivity[];
  financeEntries: FinanceEntry[];
  reflections: Reflection[];
  habits: Habit[];
}

export interface AuthSubmissionResult {
  requiresEmailConfirmation: boolean;
}

export interface PasswordResetRequestResult {
  emailRedirectTo: string;
}

export interface OAuthSignInResult {
  redirectTo: string;
}

interface UserProfileUpsertBuilder {
  upsert: (value: { id: string; email: string | null; name: string | null }) => {
    select: (columns: string) => {
      single: () => Promise<{ data: UserProfileRow | null; error: { message?: string } | null }>;
    };
  };
}

type AnyTable = any;

/**
 * Returns the configured Supabase client or throws a descriptive error.
 * The .from() calls are typed via safe local casts at each call site.
 */
function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  return supabase as Omit<typeof supabase, "from"> & {
    from: (table: string) => AnyTable;
  };
}

/**
 * Converts a timestamp to a YYYY-MM-DD date string.
 */
function toDateOnly(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

/**
 * Maps a profile row to the application profile model.
 */
function mapUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  };
}

/**
 * Maps a daily task row to the application model.
 */
function mapDailyTask(row: DailyTaskRow): DailyTask {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    completed: row.completed,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

/**
 * Maps a weekly review row to the application model.
 */
function mapWeeklyReview(row: WeeklyReviewRow): WeeklyReview {
  return {
    id: row.id,
    weekStart: row.week_start,
    careerScore: row.career_score,
    familyScore: row.family_score,
    financeScore: row.finance_score,
    peaceScore: row.peace_score,
    lifeBalanceScore: Number(row.life_balance_score),
    notes: row.notes ?? "",
    createdAt: row.created_at,
  };
}

/**
 * Maps a goal row to the application model.
 */
function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    category: row.category,
    targetDate: row.target_date,
    completed: row.completed,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

/**
 * Maps a goal subtask row to the application model.
 */
function mapGoalSubTask(row: GoalSubTaskRow): GoalSubTask {
  return {
    id: row.id,
    goalId: row.goal_id,
    title: row.title,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

/**
 * Maps a kids activity row to the application model.
 */
function mapKidsActivity(row: KidsActivityRow): KidsActivity {
  return {
    id: row.id,
    childName: row.child_name ?? "",
    activityType: row.activity_type,
    description: row.description ?? "",
    activityDate: row.activity_date ?? toDateOnly(row.created_at),
    rating: row.rating ?? 3,
    createdAt: row.created_at,
  };
}

/**
 * Maps a finance row to the application model.
 */
function mapFinanceEntry(row: FinanceEntryRow): FinanceEntry {
  const normalizedType: FinanceEntryType =
    String(row.type) === "others" ? "other" : row.type;

  return {
    id: row.id,
    type: normalizedType,
    category: row.category ?? "General",
    amount: Number(row.amount),
    notes: row.notes ?? "",
    entryDate: row.entry_date ?? toDateOnly(row.created_at),
    createdAt: row.created_at,
  };
}

/**
 * Maps a reflection row to the application model.
 */
function mapReflection(row: ReflectionRow): Reflection {
  return {
    id: row.id,
    reflectionDate: row.reflection_date ?? toDateOnly(row.created_at),
    wentWell: row.went_well ?? "",
    learnedToday: row.learned_today ?? "",
    improveTomorrow: row.improve_tomorrow ?? "",
    mood: row.mood ?? 7,
    createdAt: row.created_at,
  };
}

/**
 * Returns whether a date string matches today's date.
 */
function isToday(dateValue: string | null | undefined): boolean {
  return Boolean(dateValue && dateValue === new Date().toISOString().slice(0, 10));
}

/**
 * Calculates the current streak from a habit's completion log dates.
 */
function calculateHabitStreak(logs: HabitLogRow[]): number {
  const uniqueDates = Array.from(
    new Set(logs.map((log) => log.completed_date).filter(Boolean) as string[]),
  ).sort((left, right) => right.localeCompare(left));

  if (uniqueDates.length === 0) {
    return 0;
  }

  let expected = new Date(`${uniqueDates[0]}T00:00:00.000Z`);
  let streak = 0;

  for (const dateValue of uniqueDates) {
    const current = new Date(`${dateValue}T00:00:00.000Z`);
    if (current.getTime() !== expected.getTime()) {
      if (streak === 0) {
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        if (current.getTime() !== Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate())) {
          return 0;
        }
      } else {
        break;
      }
    }

    streak += 1;
    expected = new Date(current);
    expected.setUTCDate(expected.getUTCDate() - 1);
  }

  return streak;
}

/**
 * Maps a habit row and its logs to the application model.
 */
function mapHabit(row: HabitRow, logs: HabitLogRow[]): Habit {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    targetFrequency: row.target_frequency,
    streak: calculateHabitStreak(logs),
    completedToday: logs.some((log) => isToday(log.completed_date)),
    createdAt: row.created_at,
  };
}

/**
 * Maps a garden task row to the application model.
 */
function mapGardenTask(row: GardenTaskRow): GardenTask {
  return {
    id: row.id,
    taskName: row.task_name ?? "",
    description: row.description ?? "",
    completed: row.completed,
    dueDate: row.due_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

/**
 * Signs in a user with email and password.
 */
export async function signInWithPassword(email: string, password: string) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Starts Google OAuth sign-in and redirects directly to home page.
 * The auth context will handle session establishment from the OAuth tokens.
 */
export async function signInWithGoogle(): Promise<OAuthSignInResult> {
  const client = requireSupabase();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard`
      : "/dashboard";

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return { redirectTo };
}

/**
 * Creates a new user account using Supabase password auth.
 */
export async function signUpWithPassword(email: string, password: string, name?: string): Promise<AuthSubmissionResult> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name?.trim() || undefined,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    requiresEmailConfirmation: !data.session,
  };
}

/**
 * Sends a password reset email to the user.
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResult> {
  const client = requireSupabase();
  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/reset-password`
      : "/auth/reset-password";

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: emailRedirectTo,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { emailRedirectTo };
}

/**
 * Updates the current authenticated user's password.
 */
export async function updateCurrentUserPassword(password: string) {
  const client = requireSupabase();
  const { error } = await client.auth.updateUser({ password });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOutUser() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Ensures the optional public user profile row exists for the authenticated user.
 */
export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const client = requireSupabase();
  const payload = {
    id: user.id,
    email: user.email ?? null,
    name:
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null,
  };

  const usersTable = client.from("users") as unknown as UserProfileUpsertBuilder;
  const { data, error } = await usersTable.upsert(payload).select("*").single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to ensure user profile.");
  }

  return mapUserProfile(data);
}

/**
 * Loads all persisted module data required by the application shell.
 */
export async function loadApplicationData(): Promise<ApplicationData> {
  const [dailyTasks, weeklyReviews, goals, kidsActivities, financeEntries, reflections, habits] =
    await Promise.all([
      listDailyTasks(),
      listWeeklyReviews(),
      listGoals(),
      listKidsActivities(),
      listFinanceEntries(),
      listReflections(),
      listHabits(),
    ]);

  return {
    dailyTasks,
    weeklyReviews,
    goals,
    kidsActivities,
    financeEntries,
    reflections,
    habits,
  };
}

/**
 * Fetches the authenticated user's daily tasks.
 */
export async function listDailyTasks(): Promise<DailyTask[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("daily_tasks").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load daily tasks.");
  }

  return ((data ?? []) as DailyTaskRow[]).map(mapDailyTask);
}

/**
 * Creates a daily task for the authenticated user.
 */
export async function createDailyTask(userId: string, payload: { title: string; category: DailyTaskCategory }): Promise<DailyTask> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("daily_tasks")
    .insert({ user_id: userId, title: payload.title, category: payload.category, completed: false })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create daily task.");
  }

  return mapDailyTask(data as DailyTaskRow);
}

/**
 * Updates the completion state of a daily task.
 */
export async function updateDailyTaskCompletion(id: string, completed: boolean): Promise<DailyTask> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("daily_tasks")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to update daily task.");
  }

  return mapDailyTask(data as DailyTaskRow);
}

/**
 * Updates editable fields of a daily task.
 */
export async function updateDailyTask(
  id: string,
  payload: { title: string; category: DailyTaskCategory },
): Promise<DailyTask> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("daily_tasks")
    .update({ title: payload.title, category: payload.category })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to update daily task.");
  }

  return mapDailyTask(data as DailyTaskRow);
}

/**
 * Deletes a daily task.
 */
export async function deleteDailyTask(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("daily_tasks").delete().eq("id", id);

  if (error) {
    throw new Error(error.message ?? "Failed to delete daily task.");
  }
}

/**
 * Fetches the authenticated user's weekly reviews.
 */
export async function listWeeklyReviews(): Promise<WeeklyReview[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("weekly_reviews").select("*").order("week_start", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load weekly reviews.");
  }

  return ((data ?? []) as WeeklyReviewRow[]).map(mapWeeklyReview);
}

/**
 * Creates a weekly review and stores the computed balance score.
 */
export async function createWeeklyReview(
  userId: string,
  payload: {
    weekStart: string;
    careerScore: number;
    familyScore: number;
    financeScore: number;
    peaceScore: number;
    notes: string;
  },
): Promise<WeeklyReview> {
  const client = requireSupabase();
  const lifeBalanceScore = calculateLifeBalanceScore(
    payload.careerScore,
    payload.familyScore,
    payload.financeScore,
    payload.peaceScore,
  );

  const { data, error } = await client
    .from("weekly_reviews")
    .insert({
      user_id: userId,
      week_start: payload.weekStart,
      career_score: payload.careerScore,
      family_score: payload.familyScore,
      finance_score: payload.financeScore,
      peace_score: payload.peaceScore,
      life_balance_score: lifeBalanceScore,
      notes: payload.notes,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create weekly review.");
  }

  return mapWeeklyReview(data as WeeklyReviewRow);
}

/**
 * Fetches the authenticated user's goals.
 */
export async function listGoals(): Promise<Goal[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("goals").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load goals.");
  }

  return ((data ?? []) as GoalRow[]).map(mapGoal);
}

/**
 * Creates a goal for the authenticated user.
 */
export async function createGoal(
  userId: string,
  payload: { title: string; description: string; category: GoalCategory; targetDate: string | null },
): Promise<Goal> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("goals")
    .insert({
      user_id: userId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      target_date: payload.targetDate,
      completed: false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create goal.");
  }

  return mapGoal(data as GoalRow);
}

/**
 * Updates a goal's completion status.
 */
export async function updateGoalCompletion(id: string, completed: boolean): Promise<Goal> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("goals")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to update goal.");
  }

  return mapGoal(data as GoalRow);
}

/**
 * Checks whether the goal_subtasks table is available in the database.
 * Returns false when the table hasn't been migrated yet.
 */
export async function checkGoalSubTasksAvailable(): Promise<boolean> {
  const client = requireSupabase();
  const { error } = await client.from("goal_subtasks").select("id").limit(1);
  return !error;
}

/**
 * Fetches subtasks for a specific goal.
 */
export async function listGoalSubTasks(goalId: string): Promise<GoalSubTask[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("goal_subtasks")
    .select("*")
    .eq("goal_id", goalId)
    .order("created_at", { ascending: true });

  if (error) {
    // Gracefully return empty list when the table doesn't exist yet (schema not yet migrated).
    if (error.message?.includes("schema cache") || error.code === "42P01" || error.message?.includes("goal_subtasks")) {
      return [];
    }
    throw new Error(error.message ?? "Failed to load goal subtasks.");
  }

  return ((data ?? []) as GoalSubTaskRow[]).map(mapGoalSubTask);
}

/**
 * Creates a subtask under a goal.
 */
export async function createGoalSubTask(goalId: string, title: string): Promise<GoalSubTask> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("goal_subtasks")
    .insert({ goal_id: goalId, title: title.trim(), completed: false })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create goal subtask.");
  }

  return mapGoalSubTask(data as GoalSubTaskRow);
}

/**
 * Updates editable fields of a goal subtask.
 */
export async function updateGoalSubTask(
  id: string,
  payload: { title?: string; completed?: boolean },
): Promise<GoalSubTask> {
  const client = requireSupabase();
  const updatePayload: { title?: string; completed?: boolean } = {};
  if (typeof payload.title === "string") {
    updatePayload.title = payload.title.trim();
  }
  if (typeof payload.completed === "boolean") {
    updatePayload.completed = payload.completed;
  }

  const { data, error } = await client
    .from("goal_subtasks")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to update goal subtask.");
  }

  return mapGoalSubTask(data as GoalSubTaskRow);
}

/**
 * Deletes a goal subtask.
 */
export async function deleteGoalSubTask(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("goal_subtasks").delete().eq("id", id);

  if (error) {
    throw new Error(error.message ?? "Failed to delete goal subtask.");
  }
}

/**
 * Fetches the authenticated user's kids activities.
 */
export async function listKidsActivities(): Promise<KidsActivity[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("kids_activities").select("*").order("activity_date", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load kids activities.");
  }

  return ((data ?? []) as KidsActivityRow[]).map(mapKidsActivity);
}

/**
 * Creates a kids activity record.
 */
export async function createKidsActivity(
  userId: string,
  payload: {
    childName: string;
    activityType: KidsActivityType;
    description: string;
    activityDate: string;
    rating: number;
  },
): Promise<KidsActivity> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("kids_activities")
    .insert({
      user_id: userId,
      child_name: payload.childName,
      activity_type: payload.activityType,
      description: payload.description,
      activity_date: payload.activityDate,
      rating: payload.rating,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create kids activity.");
  }

  return mapKidsActivity(data as KidsActivityRow);
}

/**
 * Fetches the authenticated user's finance entries.
 */
export async function listFinanceEntries(): Promise<FinanceEntry[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("finance_entries").select("*").order("entry_date", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load finance entries.");
  }

  return ((data ?? []) as FinanceEntryRow[]).map(mapFinanceEntry);
}

/**
 * Creates a finance entry.
 */
export async function createFinanceEntry(
  userId: string,
  payload: { type: FinanceEntryType; category: string; amount: number; notes: string; entryDate: string },
): Promise<FinanceEntry> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("finance_entries")
    .insert({
      user_id: userId,
      type: payload.type,
      category: payload.category,
      amount: payload.amount,
      notes: payload.notes,
      entry_date: payload.entryDate,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create finance entry.");
  }

  return mapFinanceEntry(data as FinanceEntryRow);
}

/**
 * Deletes a finance entry.
 */
export async function deleteFinanceEntry(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("finance_entries").delete().eq("id", id);

  if (error) {
    throw new Error(error.message ?? "Failed to delete finance entry.");
  }
}

/**
 * Fetches the authenticated user's reflections.
 */
export async function listReflections(): Promise<Reflection[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("reflections").select("*").order("reflection_date", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load reflections.");
  }

  return ((data ?? []) as ReflectionRow[]).map(mapReflection);
}

/**
 * Creates a reflection entry.
 */
export async function createReflection(
  userId: string,
  payload: { reflectionDate: string; wentWell: string; learnedToday: string; improveTomorrow: string; mood: number },
): Promise<Reflection> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("reflections")
    .insert({
      user_id: userId,
      reflection_date: payload.reflectionDate,
      went_well: payload.wentWell,
      learned_today: payload.learnedToday,
      improve_tomorrow: payload.improveTomorrow,
      mood: payload.mood,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create reflection.");
  }

  return mapReflection(data as ReflectionRow);
}

/**
 * Fetches habits and derives streaks from their completion log rows.
 */
export async function listHabits(): Promise<Habit[]> {
  const client = requireSupabase();
  const { data: habitData, error: habitError } = await client.from("habits").select("*").order("created_at", { ascending: false });

  if (habitError) {
    throw new Error(habitError.message ?? "Failed to load habits.");
  }

  const habits = (habitData ?? []) as HabitRow[];
  if (habits.length === 0) {
    return [];
  }

  const { data: logData, error: logError } = await client
    .from("habit_logs")
    .select("*")
    .in("habit_id", habits.map((habit) => habit.id))
    .order("completed_date", { ascending: false });

  if (logError) {
    throw new Error(logError.message ?? "Failed to load habit logs.");
  }

  const logs = (logData ?? []) as HabitLogRow[];
  return habits.map((habit) => mapHabit(habit, logs.filter((log) => log.habit_id === habit.id)));
}

/**
 * Creates a habit record.
 */
export async function createHabit(
  userId: string,
  payload: { title: string; category: HabitCategory; targetFrequency: number },
): Promise<Habit> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("habits")
    .insert({
      user_id: userId,
      title: payload.title,
      category: payload.category,
      target_frequency: payload.targetFrequency,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create habit.");
  }

  return mapHabit(data as HabitRow, []);
}

/**
 * Toggles today's completion log for a habit and returns the refreshed habit list.
 */
export async function toggleHabitCompletion(habitId: string, complete: boolean): Promise<Habit[]> {
  const client = requireSupabase();
  const today = new Date().toISOString().slice(0, 10);
  const { data: existingLog, error: lookupError } = await client
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .eq("completed_date", today)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message ?? "Failed to inspect habit log.");
  }

  if (complete && !existingLog) {
    const { error } = await client.from("habit_logs").insert({ habit_id: habitId, completed_date: today });
    if (error) {
      throw new Error(error.message ?? "Failed to mark habit complete.");
    }
  }

  if (!complete && existingLog) {
    const { error } = await client.from("habit_logs").delete().eq("id", existingLog.id);
    if (error) {
      throw new Error(error.message ?? "Failed to remove habit completion log.");
    }
  }

  return listHabits();
}

/**
 * Fetches the authenticated user's garden tasks.
 */
export async function listGardenTasks(): Promise<GardenTask[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("garden_tasks").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load garden tasks.");
  }

  return ((data ?? []) as GardenTaskRow[]).map(mapGardenTask);
}

/**
 * Creates a garden task.
 */
export async function createGardenTask(
  userId: string,
  payload: { taskName: string; description: string; dueDate: string | null },
): Promise<GardenTask> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("garden_tasks")
    .insert({
      user_id: userId,
      task_name: payload.taskName,
      description: payload.description,
      due_date: payload.dueDate,
      completed: false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create garden task.");
  }

  return mapGardenTask(data as GardenTaskRow);
}

/**
 * Updates a garden task's completion state.
 */
export async function updateGardenTaskCompletion(id: string, completed: boolean): Promise<GardenTask> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("garden_tasks")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to update garden task.");
  }

  return mapGardenTask(data as GardenTaskRow);
}

/**
 * Updates a garden task's editable fields.
 */
export async function updateGardenTask(
  id: string,
  payload: { taskName: string; description: string; dueDate: string | null },
): Promise<GardenTask> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("garden_tasks")
    .update({
      task_name: payload.taskName,
      description: payload.description,
      due_date: payload.dueDate,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to update garden task.");
  }

  return mapGardenTask(data as GardenTaskRow);
}

/**
 * Deletes a garden task.
 */
export async function deleteGardenTask(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("garden_tasks").delete().eq("id", id);

  if (error) {
    throw new Error(error.message ?? "Failed to delete garden task.");
  }
}

/**
 * Updates a goal's editable fields.
 */
export async function updateGoal(
  id: string,
  payload: { title: string; description: string; category: GoalCategory; targetDate: string | null },
): Promise<Goal> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("goals")
    .update({ title: payload.title, description: payload.description, category: payload.category, target_date: payload.targetDate })
    .eq("id", id)
    .select("*")
    .single();
  if (error) { throw new Error(error.message ?? "Failed to update goal."); }
  return mapGoal(data as GoalRow);
}

/** Deletes a goal. */
export async function deleteGoal(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("goals").delete().eq("id", id);
  if (error) { throw new Error(error.message ?? "Failed to delete goal."); }
}

/**
 * Updates a finance entry's editable fields.
 */
export async function updateFinanceEntry(
  id: string,
  payload: { type: FinanceEntryType; category: string; amount: number; notes: string; entryDate: string },
): Promise<FinanceEntry> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("finance_entries")
    .update({ type: payload.type, category: payload.category, amount: payload.amount, notes: payload.notes, entry_date: payload.entryDate })
    .eq("id", id)
    .select("*")
    .single();
  if (error) { throw new Error(error.message ?? "Failed to update finance entry."); }
  return mapFinanceEntry(data as FinanceEntryRow);
}

/**
 * Updates a reflection's editable fields.
 */
export async function updateReflection(
  id: string,
  payload: { wentWell: string; learnedToday: string; improveTomorrow: string; mood: number },
): Promise<Reflection> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("reflections")
    .update({ went_well: payload.wentWell, learned_today: payload.learnedToday, improve_tomorrow: payload.improveTomorrow, mood: payload.mood })
    .eq("id", id)
    .select("*")
    .single();
  if (error) { throw new Error(error.message ?? "Failed to update reflection."); }
  return mapReflection(data as ReflectionRow);
}

/** Deletes a reflection. */
export async function deleteReflection(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("reflections").delete().eq("id", id);
  if (error) { throw new Error(error.message ?? "Failed to delete reflection."); }
}

/**
 * Updates a kids activity's editable fields.
 */
export async function updateKidsActivity(
  id: string,
  payload: { childName: string; activityType: KidsActivityType; description: string; activityDate: string; rating: number },
): Promise<KidsActivity> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("kids_activities")
    .update({ child_name: payload.childName, activity_type: payload.activityType, description: payload.description, activity_date: payload.activityDate, rating: payload.rating })
    .eq("id", id)
    .select("*")
    .single();
  if (error) { throw new Error(error.message ?? "Failed to update kids activity."); }
  return mapKidsActivity(data as KidsActivityRow);
}

/** Deletes a kids activity. */
export async function deleteKidsActivity(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("kids_activities").delete().eq("id", id);
  if (error) { throw new Error(error.message ?? "Failed to delete kids activity."); }
}

/** Deletes a habit and its associated logs. */
export async function deleteHabit(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("habits").delete().eq("id", id);
  if (error) { throw new Error(error.message ?? "Failed to delete habit."); }
}

/** Updates a habit's title, category, and target frequency. */
export async function updateHabit(
  id: string,
  payload: { title: string; category: HabitCategory; targetFrequency: number },
): Promise<Habit> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("habits")
    .update({ title: payload.title, category: payload.category, target_frequency: payload.targetFrequency })
    .eq("id", id)
    .select()
    .single();
  if (error) { throw new Error(error.message ?? "Failed to update habit."); }
  return mapHabit(data as HabitRow, []);
}
