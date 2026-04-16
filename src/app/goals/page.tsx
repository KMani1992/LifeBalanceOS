"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Checkbox,
  Collapse,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import UnfoldLessRoundedIcon from "@mui/icons-material/UnfoldLessRounded";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/lib/auth-context";
import {
  createGoal,
  updateGoal,
  updateGoalCompletion,
  deleteGoal,
  promoteGoalLevel,
  listGoalSubTasks,
  createGoalSubTask,
  updateGoalSubTask,
  deleteGoalSubTask,
  checkGoalSubTasksAvailable,
} from "@/lib/persistence";
import { addGoal, replaceGoal, removeGoal } from "@/store/slices/goalsSlice";
import { AppDispatch, RootState } from "@/store/store";
import { GoalCategory, GoalPeriod, GoalRepeat, GoalSubTask, GoalType, SubCategory } from "@/types";
import { GOAL_CATEGORIES, getSubCategoryOptions } from "@/constants/options";
import { STORAGE_KEYS } from "@/constants/storage";
import { formatDateTimeHms } from "@/lib/date-time";
import { getGoalLevelSnapshot } from "@/lib/goal-level";
import { getRecurringGoalLabel } from "@/lib/goal-templates";
import { cleanupGoalsStructure } from "@/lib/goals-cleanup";

const goalCategories: GoalCategory[] = GOAL_CATEGORIES;

function loadFallbackSubTasks(): Record<string, GoalSubTask[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.goalSubTasksFallback) ?? "{}") as Record<string, GoalSubTask[]>;
  } catch {
    return {};
  }
}

function saveFallbackSubTasks(data: Record<string, GoalSubTask[]>) {
  localStorage.setItem(STORAGE_KEYS.goalSubTasksFallback, JSON.stringify(data));
}

/**
 * Renders the goals system with goal creation and completion tracking.
 */
export default function GoalsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, refreshData } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const goals = useSelector((state: RootState) => state.goals.goals);
  const tasks = useSelector((state: RootState) => state.daily.tasks);
  const reviews = useSelector((state: RootState) => state.weeklyReviews.reviews);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("career");
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [goalType, setGoalType] = useState<GoalType>("task");
  const [period, setPeriod] = useState<GoalPeriod>("one-time");
  const [repeat, setRepeat] = useState<GoalRepeat>("none");
  const [levelCurrent, setLevelCurrent] = useState(1);
  const [levelTarget, setLevelTarget] = useState(5);
  const [editingGoal, setEditingGoal] = useState<null | typeof goals[0]>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<GoalCategory>("career");
  const [editSubCategory, setEditSubCategory] = useState<SubCategory | null>(null);
  const [editTargetDate, setEditTargetDate] = useState("");
  const [editGoalType, setEditGoalType] = useState<GoalType>("task");
  const [editPeriod, setEditPeriod] = useState<GoalPeriod>("one-time");
  const [editRepeat, setEditRepeat] = useState<GoalRepeat>("none");
  const [editLevelCurrent, setEditLevelCurrent] = useState(1);
  const [editLevelTarget, setEditLevelTarget] = useState(5);
  const [goalSubTasks, setGoalSubTasks] = useState<Record<string, GoalSubTask[]>>({});
  const [newSubTaskTitle, setNewSubTaskTitle] = useState<Record<string, string>>({});
  const [editingSubTask, setEditingSubTask] = useState<null | { goalId: string; subTask: GoalSubTask }>(null);
  const [editSubTaskTitle, setEditSubTaskTitle] = useState("");
  // null = unknown, true = DB available, false = using localStorage fallback
  const [subtasksDbAvailable, setSubtasksDbAvailable] = useState<boolean | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [filterCategory, setFilterCategory] = useState<"all" | GoalCategory>("all");
  const [filterGoalType, setFilterGoalType] = useState<"all" | GoalType>("all");
  const [filterRepeat, setFilterRepeat] = useState<"all" | GoalRepeat>("all");
  const [sortBy, setSortBy] = useState<
    | "latest"
    | "oldest"
    | "targetDateSoon"
    | "progressHigh"
    | "status"
    | "monthlyFirst"
    | "longTermFirst"
    | "categoryAZ"
    | "categoryZA"
  >("categoryAZ");
  const [viewMode, setViewMode] = useState<"tile" | "list">("list");
  const [expandedGoalIds, setExpandedGoalIds] = useState<Record<string, boolean>>({});
  const [isGoalsCleanupRunning, setIsGoalsCleanupRunning] = useState(false);
  const [isCleanupConfirmOpen, setIsCleanupConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setGoalSubTasks({});
      return;
    }

    if (goals.length === 0) {
      setGoalSubTasks({});
      return;
    }

    let active = true;

    async function hydrateGoalSubTasks() {
      try {
        const tableAvailable = await checkGoalSubTasksAvailable();

        if (!tableAvailable) {
          setSubtasksDbAvailable(false);
          setGoalSubTasks(loadFallbackSubTasks());
          return;
        }

        setSubtasksDbAvailable(true);
        const tuples = await Promise.all(
          goals.map(async (goal) => [goal.id, await listGoalSubTasks(goal.id)] as const),
        );

        if (!active) {
          return;
        }

        setGoalSubTasks(Object.fromEntries(tuples));
      } catch (subTaskError) {
        if (!active) {
          return;
        }
        // Non-table errors (network, auth) — show them.
        setError(subTaskError instanceof Error ? subTaskError.message : "Failed to load goal subtasks.");
      }
    }

    void hydrateGoalSubTasks();

    return () => {
      active = false;
    };
  }, [goals, user]);

  const progressByGoal = useMemo(() => {
    const progress: Record<string, number> = {};
    goals.forEach((goal) => {
      const subtasks = goalSubTasks[goal.id] ?? [];
      if (subtasks.length === 0) {
        progress[goal.id] = goal.completed ? 100 : 0;
        return;
      }
      const done = subtasks.filter((subtask) => subtask.completed).length;
      progress[goal.id] = Math.round((done / subtasks.length) * 100);
    });
    return progress;
  }, [goalSubTasks, goals]);

  // Generated by GitHub Copilot
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (filterStatus === "active" && goal.completed) {
        return false;
      }

      if (filterStatus === "completed" && !goal.completed) {
        return false;
      }

      if (filterCategory !== "all" && goal.category !== filterCategory) {
        return false;
      }

      if (filterGoalType !== "all" && (goal.goalType ?? "task") !== filterGoalType) {
        return false;
      }

      if (filterRepeat !== "all" && (goal.repeat ?? "none") !== filterRepeat) {
        return false;
      }

      return true;
    });
  }, [filterCategory, filterGoalType, filterRepeat, filterStatus, goals]);

  // Generated by GitHub Copilot
  const sortedGoals = useMemo(() => {
    const copy = [...filteredGoals];
    copy.sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (sortBy === "targetDateSoon") {
        const aDate = a.targetDate ? new Date(a.targetDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.targetDate ? new Date(b.targetDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      }

      if (sortBy === "progressHigh") {
        return (progressByGoal[b.id] ?? 0) - (progressByGoal[a.id] ?? 0);
      }

      if (sortBy === "status") {
        if (a.completed === b.completed) {
          return a.title.localeCompare(b.title);
        }
        return a.completed ? 1 : -1;
      }

      if (sortBy === "categoryAZ") {
        const categoryOrder = a.category.localeCompare(b.category);
        if (categoryOrder !== 0) {
          return categoryOrder;
        }

        const aMonthly = (a.period ?? "one-time") === "monthly" || (a.repeat ?? "none") === "monthly";
        const bMonthly = (b.period ?? "one-time") === "monthly" || (b.repeat ?? "none") === "monthly";
        const aLongTerm = (a.goalType ?? "task") === "master";
        const bLongTerm = (b.goalType ?? "task") === "master";

        const azPriority = (isMonthly: boolean, isLongTerm: boolean) => {
          if (isMonthly) return 0;
          if (isLongTerm) return 1;
          return 2;
        };

        const priorityOrder = azPriority(aMonthly, aLongTerm) - azPriority(bMonthly, bLongTerm);
        if (priorityOrder !== 0) {
          return priorityOrder;
        }

        const createdOrder = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (createdOrder !== 0) {
          return createdOrder;
        }

        return a.title.localeCompare(b.title);
      }

      if (sortBy === "categoryZA") {
        const categoryOrder = b.category.localeCompare(a.category);
        if (categoryOrder !== 0) {
          return categoryOrder;
        }

        const aMonthly = (a.period ?? "one-time") === "monthly" || (a.repeat ?? "none") === "monthly";
        const bMonthly = (b.period ?? "one-time") === "monthly" || (b.repeat ?? "none") === "monthly";
        const aLongTerm = (a.goalType ?? "task") === "master";
        const bLongTerm = (b.goalType ?? "task") === "master";

        const zaPriority = (isMonthly: boolean, isLongTerm: boolean) => {
          if (isMonthly) return 2;
          if (isLongTerm) return 1;
          return 0;
        };

        const priorityOrder = zaPriority(aMonthly, aLongTerm) - zaPriority(bMonthly, bLongTerm);
        if (priorityOrder !== 0) {
          return priorityOrder;
        }

        const createdOrder = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (createdOrder !== 0) {
          return createdOrder;
        }

        return b.title.localeCompare(a.title);
      }

      if (sortBy === "monthlyFirst") {
        const aMonthly = (a.period ?? "one-time") === "monthly" || (a.repeat ?? "none") === "monthly";
        const bMonthly = (b.period ?? "one-time") === "monthly" || (b.repeat ?? "none") === "monthly";
        if (aMonthly !== bMonthly) {
          return aMonthly ? -1 : 1;
        }
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "longTermFirst") {
        const aLongTerm = (a.goalType ?? "task") === "master";
        const bLongTerm = (b.goalType ?? "task") === "master";
        if (aLongTerm !== bLongTerm) {
          return aLongTerm ? -1 : 1;
        }
        return a.title.localeCompare(b.title);
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return copy;
  }, [filteredGoals, progressByGoal, sortBy]);

  // Generated by GitHub Copilot
  const goalTasksByGoalId = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    goals.forEach((goal) => {
      map[goal.id] = tasks.filter((task) => task.goalId === goal.id);
    });
    return map;
  }, [goals, tasks]);

  // Generated by GitHub Copilot
  const goalLevelSnapshots = useMemo(() => {
    const map: Record<string, ReturnType<typeof getGoalLevelSnapshot>> = {};
    goals.forEach((goal) => {
      map[goal.id] = getGoalLevelSnapshot(goal, tasks, reviews);
    });
    return map;
  }, [goals, reviews, tasks]);

  /**
   * Creates a goal when the required fields are present.
   */
  async function handleCreateGoal() {
    if (!user || !title.trim()) {
      return;
    }

    try {
      setError(null);
      const goal = await createGoal(user.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        subCategory,
        targetDate: targetDate || null,
        goalType,
        period,
        repeat,
        levelCurrent,
        levelTarget,
      });
      dispatch(addGoal(goal));
      setTitle("");
      setDescription("");
      setSubCategory(null);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to create goal.");
    }
  }

  /**
   * Toggles a goal's completion state in Supabase.
   */
  async function handleToggleGoal(id: string, completed: boolean) {
    try {
      setError(null);
      const goal = await updateGoalCompletion(id, completed);
      dispatch(replaceGoal(goal));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to update goal.");
    }
  }

  /** Opens edit dialog pre-filled with existing values. */
  function openEdit(goal: typeof goals[0]) {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditDescription(goal.description ?? "");
    setEditCategory(goal.category);
    setEditSubCategory(goal.subCategory ?? null);
    setEditTargetDate(goal.targetDate ?? "");
    setEditGoalType(goal.goalType ?? "task");
    setEditPeriod(goal.period ?? "one-time");
    setEditRepeat(goal.repeat ?? "none");
    setEditLevelCurrent(goal.levelCurrent ?? 1);
    setEditLevelTarget(goal.levelTarget ?? 5);
  }

  /** Saves the edited goal. */
  async function handleSaveEdit() {
    if (!editingGoal) return;
    try {
      setError(null);
      const updated = await updateGoal(editingGoal.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory,
        subCategory: editSubCategory,
        targetDate: editTargetDate || null,
        goalType: editGoalType,
        period: editPeriod,
        repeat: editRepeat,
        levelCurrent: editLevelCurrent,
        levelTarget: editLevelTarget,
      });
      dispatch(replaceGoal(updated));
      setEditingGoal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update goal.");
    }
  }

  /** Deletes a goal. */
  async function handleDeleteGoal(id: string) {
    try {
      setError(null);
      await deleteGoal(id);
      dispatch(removeGoal(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete goal.");
    }
  }

  /** Toggles details visibility for a goal card. */
  function toggleGoalDetails(goalId: string) {
    setExpandedGoalIds((current) => ({
      ...current,
      [goalId]: !current[goalId],
    }));
  }

  function expandAllGoals() {
    const all: Record<string, boolean> = {};
    sortedGoals.forEach((g) => { all[g.id] = true; });
    setExpandedGoalIds(all);
  }

  function collapseAllGoals() {
    setExpandedGoalIds({});
  }

  /**
   * Runs goals cleanup and refreshes all datasets after completion.
   */
  // Generated by GitHub Copilot
  async function runGoalsCleanup() {
    if (!user || isGoalsCleanupRunning) {
      return;
    }

    try {
      setError(null);
      setIsGoalsCleanupRunning(true);
      setIsCleanupConfirmOpen(false);

      const audit = await cleanupGoalsStructure(user.id);
      console.log("[GoalsPage] Cleanup audit:", audit);

      await refreshData();
      setExpandedGoalIds({});
    } catch (cleanupError) {
      setError(cleanupError instanceof Error ? cleanupError.message : "Failed to clean goals structure.");
    } finally {
      setIsGoalsCleanupRunning(false);
    }
  }

  /** Opens cleanup confirmation dialog. */
  function openCleanupConfirmDialog() {
    if (!user || isGoalsCleanupRunning) {
      return;
    }
    setIsCleanupConfirmOpen(true);
  }

  /** Closes cleanup confirmation dialog. */
  function closeCleanupConfirmDialog() {
    if (isGoalsCleanupRunning) {
      return;
    }
    setIsCleanupConfirmOpen(false);
  }

  /**
   * Promotes a goal level only after explicit user confirmation.
   */
  async function handlePromoteLevel(goal: typeof goals[0]) {
    const snapshot = goalLevelSnapshots[goal.id];
    const currentLevel = goal.levelCurrent ?? 1;
    const targetLevel = goal.levelTarget ?? 5;

    if (!snapshot || !snapshot.canPromote || currentLevel >= targetLevel) {
      return;
    }

    const confirmed = window.confirm(`Promote ${goal.title} from Level ${currentLevel} to Level ${snapshot.nextLevel}?`);
    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      const updated = await promoteGoalLevel({
        id: goal.id,
        levelCurrent: currentLevel,
        levelTarget: targetLevel,
      });
      dispatch(replaceGoal(updated));
    } catch (promotionError) {
      setError(promotionError instanceof Error ? promotionError.message : "Failed to promote goal level.");
    }
  }

  async function handleAddSubTask(goalId: string) {
    const subTaskTitle = (newSubTaskTitle[goalId] ?? "").trim();
    if (!subTaskTitle) {
      return;
    }

    if (subtasksDbAvailable === false) {
      // localStorage fallback when DB table doesn't exist yet.
      const localSubTask: GoalSubTask = {
        id: crypto.randomUUID(),
        goalId,
        title: subTaskTitle,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setGoalSubTasks((current) => {
        const updated = { ...current, [goalId]: [...(current[goalId] ?? []), localSubTask] };
        saveFallbackSubTasks(updated);
        return updated;
      });
      setNewSubTaskTitle((current) => ({ ...current, [goalId]: "" }));
      return;
    }

    try {
      setError(null);
      const created = await createGoalSubTask(goalId, subTaskTitle);
      setGoalSubTasks((current) => ({
        ...current,
        [goalId]: [...(current[goalId] ?? []), created],
      }));
      setNewSubTaskTitle((current) => ({ ...current, [goalId]: "" }));
    } catch (subTaskError) {
      setError(subTaskError instanceof Error ? subTaskError.message : "Failed to create sub-task.");
    }
  }

  async function handleToggleSubTask(goalId: string, subTaskId: string) {
    const subtasks = goalSubTasks[goalId] ?? [];
    const currentSubTask = subtasks.find((subtask) => subtask.id === subTaskId);
    if (!currentSubTask) {
      return;
    }

    const updatedList = subtasks.map((subtask) =>
      subtask.id === subTaskId ? { ...subtask, completed: !subtask.completed } : subtask,
    );

    if (subtasksDbAvailable === false) {
      setGoalSubTasks((current) => {
        const updated = { ...current, [goalId]: updatedList };
        saveFallbackSubTasks(updated);
        return updated;
      });
      return;
    }

    try {
      setError(null);
      const updatedSubTask = await updateGoalSubTask(subTaskId, {
        completed: !currentSubTask.completed,
      });
      const syncedList = subtasks.map((subtask) =>
        subtask.id === subTaskId ? updatedSubTask : subtask,
      );

      setGoalSubTasks((current) => ({ ...current, [goalId]: syncedList }));

      const allCompleted = syncedList.length > 0 && syncedList.every((subtask) => subtask.completed);
      const updatedGoal = await updateGoalCompletion(goalId, allCompleted);
      dispatch(replaceGoal(updatedGoal));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sync goal completion from subtasks.");
    }
  }

  async function handleDeleteSubTask(goalId: string, subTaskId: string) {
    const updatedList = (goalSubTasks[goalId] ?? []).filter((subtask) => subtask.id !== subTaskId);

    if (subtasksDbAvailable === false) {
      setGoalSubTasks((current) => {
        const updated = { ...current, [goalId]: updatedList };
        saveFallbackSubTasks(updated);
        return updated;
      });
      return;
    }

    try {
      setError(null);
      await deleteGoalSubTask(subTaskId);
      setGoalSubTasks((current) => ({
        ...current,
        [goalId]: updatedList,
      }));

      if (updatedList.length > 0) {
        const allCompleted = updatedList.every((subtask) => subtask.completed);
        const updatedGoal = await updateGoalCompletion(goalId, allCompleted);
        dispatch(replaceGoal(updatedGoal));
      }
    } catch (subTaskError) {
      setError(subTaskError instanceof Error ? subTaskError.message : "Failed to delete sub-task.");
    }
  }

  function openSubTaskEdit(goalId: string, subTask: GoalSubTask) {
    setEditingSubTask({ goalId, subTask });
    setEditSubTaskTitle(subTask.title);
  }

  async function handleSaveSubTaskEdit() {
    if (!editingSubTask) {
      return;
    }

    const trimmed = editSubTaskTitle.trim();
    if (!trimmed) {
      return;
    }

    if (subtasksDbAvailable === false) {
      setGoalSubTasks((current) => {
        const updated = {
          ...current,
          [editingSubTask.goalId]: (current[editingSubTask.goalId] ?? []).map((subtask) =>
            subtask.id === editingSubTask.subTask.id ? { ...subtask, title: trimmed } : subtask,
          ),
        };
        saveFallbackSubTasks(updated);
        return updated;
      });
      setEditingSubTask(null);
      setEditSubTaskTitle("");
      return;
    }

    try {
      setError(null);
      const updatedSubTask = await updateGoalSubTask(editingSubTask.subTask.id, {
        title: trimmed,
      });

      setGoalSubTasks((current) => ({
        ...current,
        [editingSubTask.goalId]: (current[editingSubTask.goalId] ?? []).map((subtask) =>
          subtask.id === updatedSubTask.id ? updatedSubTask : subtask,
        ),
      }));

      setEditingSubTask(null);
      setEditSubTaskTitle("");
    } catch (subTaskError) {
      setError(subTaskError instanceof Error ? subTaskError.message : "Failed to update sub-task.");
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Goals"
        description="Convert the long-term priorities into specific targets with dates and visible completion status."
      />
        {error ? <Alert severity="error">{error}</Alert> : null}
      {subtasksDbAvailable === false ? (
        <Alert severity="info">
          Sub-tasks are saved locally (browser only). To enable cloud sync, run the <strong>goal_subtasks</strong> migration in your Supabase SQL editor — see <code>supabase/schema.sql</code>.
        </Alert>
      ) : null}
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              {/* Row 1 — essential fields */}
              <Grid item xs={12} md={4}>
                <TextField label="Goal title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Category"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value as GoalCategory);
                    setSubCategory(null);
                  }}
                  fullWidth
                >
                  {goalCategories.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField select label="Goal type" value={goalType} onChange={(event) => setGoalType(event.target.value as GoalType)} fullWidth>
                  <MenuItem value="task">Task</MenuItem>
                  <MenuItem value="milestone">Milestone</MenuItem>
                  <MenuItem value="master">Master</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8} md={2}>
                <TextField type="date" label="Target date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Button fullWidth sx={{ height: "100%" }} variant="contained" onClick={handleCreateGoal}>
                  Add
                </Button>
              </Grid>

              {/* Row 2 — advanced / optional fields */}
              <Grid item xs={12} md={4}>
                <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} fullWidth />
              </Grid>
              {(category === "family" || category === "peace") ? (
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    select
                    label="Sub-category"
                    value={subCategory ?? ""}
                    onChange={(event) => setSubCategory((event.target.value || null) as SubCategory | null)}
                    fullWidth
                  >
                    <MenuItem value="">None</MenuItem>
                    {getSubCategoryOptions(category).map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              ) : null}
              <Grid item xs={12} sm={6} md={2}>
                <TextField select label="Period" value={period} onChange={(event) => setPeriod(event.target.value as GoalPeriod)} fullWidth>
                  <MenuItem value="one-time">One-time</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField select label="Repeat" value={repeat} onChange={(event) => setRepeat(event.target.value as GoalRepeat)} fullWidth>
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3} md={1}>
                <TextField
                  type="number"
                  label="Cur. level"
                  value={levelCurrent}
                  onChange={(event) => setLevelCurrent(Math.max(1, Number(event.target.value)))}
                  fullWidth
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={1}>
                <TextField
                  type="number"
                  label="Tgt. level"
                  value={levelTarget}
                  onChange={(event) => setLevelTarget(Math.max(1, Number(event.target.value)))}
                  fullWidth
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ flexWrap: "wrap" }}>
          <TextField
            select
            size="small"
            label="Status"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as "all" | "active" | "completed")}
            sx={{ minWidth: { xs: "100%", sm: 140 } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Category"
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value as "all" | GoalCategory)}
            sx={{ minWidth: { xs: "100%", sm: 150 } }}
          >
            <MenuItem value="all">All</MenuItem>
            {goalCategories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Type"
            value={filterGoalType}
            onChange={(event) => setFilterGoalType(event.target.value as "all" | GoalType)}
            sx={{ minWidth: { xs: "100%", sm: 130 } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="task">Task</MenuItem>
            <MenuItem value="milestone">Milestone</MenuItem>
            <MenuItem value="master">Master</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Repeat"
            value={filterRepeat}
            onChange={(event) => setFilterRepeat(event.target.value as "all" | GoalRepeat)}
            sx={{ minWidth: { xs: "100%", sm: 130 } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }}>
          <Tooltip
            title="Cleans and standardizes goals: removes weekly system goals, keeps one master goal per pillar, migrates routines to habits, and refreshes data."
            arrow
          >
            <span>
              <Button
                size="small"
                variant="outlined"
                onClick={openCleanupConfirmDialog}
                disabled={!user || isGoalsCleanupRunning}
              >
                {isGoalsCleanupRunning ? "Cleaning..." : "Run goals cleanup"}
              </Button>
            </span>
          </Tooltip>
          <TextField
            select
            size="small"
            label="Sort by"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as
              | "latest"
              | "oldest"
              | "targetDateSoon"
              | "progressHigh"
              | "status"
              | "monthlyFirst"
              | "longTermFirst"
              | "categoryAZ"
              | "categoryZA")}
            sx={{ minWidth: { xs: "100%", sm: 220 } }}
          >
            <MenuItem value="latest">Latest created</MenuItem>
            <MenuItem value="oldest">Oldest created</MenuItem>
            <MenuItem value="targetDateSoon">Target date (soonest)</MenuItem>
            <MenuItem value="progressHigh">Progress (high to low)</MenuItem>
            <MenuItem value="status">Status (active first)</MenuItem>
            <MenuItem value="categoryAZ">Category (A-Z)</MenuItem>
            <MenuItem value="categoryZA">Category (Z-A)</MenuItem>
            <MenuItem value="monthlyFirst">Monthly goals first</MenuItem>
            <MenuItem value="longTermFirst">Long Term goals first</MenuItem>
          </TextField>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <ToggleButtonGroup
            exclusive
            value={viewMode}
            onChange={(_, next) => {
              if (next) setViewMode(next);
            }}
            aria-label="Goal view mode"
            size="small"
          >
            <ToggleButton value="tile" aria-label="Tile view">Tile</ToggleButton>
            <ToggleButton value="list" aria-label="List view">List</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            exclusive
            value={Object.values(expandedGoalIds).some(Boolean) ? "expanded" : "collapsed"}
            onChange={(_, next) => {
              if (next === "expanded") expandAllGoals();
              else if (next === "collapsed") collapseAllGoals();
            }}
            aria-label="Expand or collapse all goals"
            size="small"
          >
            <Tooltip title="Expand all">
              <ToggleButton value="expanded" aria-label="Expand all">
                <UnfoldMoreRoundedIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Collapse all">
              <ToggleButton value="collapsed" aria-label="Collapse all">
                <UnfoldLessRoundedIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns:
              viewMode === "tile"
                ? "repeat(auto-fit, minmax(320px, 1fr))"
                : "1fr",
            alignItems: "stretch",
          }}
        >
          {sortedGoals.map((goal) => (
            <Box key={goal.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  {/** Generated by GitHub Copilot */}
                  {(() => {
                    const goalTasks = goalTasksByGoalId[goal.id] ?? [];
                    const completedGoalTasks = goalTasks.filter((task) => task.completed).length;
                    const previewTasks = goalTasks.slice(0, 3);
                    const levelSnapshot = goalLevelSnapshots[goal.id];
                    const currentLevel = goal.levelCurrent ?? 1;
                    const targetLevel = goal.levelTarget ?? 5;
                    const isExpanded = Boolean(expandedGoalIds[goal.id]);
                    return (
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Checkbox checked={goal.completed} onChange={(event) => void handleToggleGoal(goal.id, event.target.checked)} />
                      <div>
                        <Typography variant="h6">{goal.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {goal.category}{goal.subCategory ? ` • ${goal.subCategory}` : ""} - target {goal.targetDate ?? "not set"}
                        </Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                          {(goal.goalType ?? "task") === "master" ? (
                            <Chip size="small" label="Long Term Goal" color="primary" variant="outlined" />
                          ) : null}
                          {(goal.period ?? "one-time") === "monthly" ? (
                            <Chip size="small" label="Monthly Goal" color="secondary" variant="outlined" />
                          ) : null}
                        </Stack>
                        {getRecurringGoalLabel(goal) ? (
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                            {getRecurringGoalLabel(goal)}
                          </Typography>
                        ) : null}
                      </div>
                      <Box sx={{ flex: 1 }} />
                      <IconButton size="small" onClick={() => openEdit(goal)} aria-label="Edit goal">
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => void handleDeleteGoal(goal.id)} aria-label="Delete goal" sx={{ color: "error.main" }}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <LinearProgress variant="determinate" value={progressByGoal[goal.id] ?? 0} sx={{ height: 10, borderRadius: 999 }} />
                    <Typography variant="body2" color="text.secondary">
                      {(progressByGoal[goal.id] ?? 0) === 100
                        ? `Completed at ${goal.completedAt ? formatDateTimeHms(goal.completedAt) : "today"}`
                        : "In progress"}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Level {currentLevel}/{targetLevel} • Tasks {completedGoalTasks}/{goalTasks.length}
                      </Typography>
                      <Button size="small" variant="text" onClick={() => toggleGoalDetails(goal.id)}>
                        {isExpanded ? "Hide details" : "Show details"}
                      </Button>
                    </Stack>

                    <Collapse in={isExpanded}>
                      <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                        <Typography color="text.secondary">{goal.description || "No description provided."}</Typography>
                        <Stack spacing={0.75}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Level progress
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Linked completed tasks: {levelSnapshot?.completedTasks ?? completedGoalTasks}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={levelSnapshot?.progressToNextPercent ?? 0}
                            sx={{ height: 8, borderRadius: 999 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {levelSnapshot?.nextLevelThreshold
                              ? `${levelSnapshot.completedTasks}/${levelSnapshot.nextLevelThreshold} tasks toward Level ${levelSnapshot.nextLevel}`
                              : "At current target level."}
                          </Typography>
                          {levelSnapshot?.canSuggestUpgrade ? (
                            <Alert severity="success" sx={{ mt: 0.5 }}>
                              {levelSnapshot.suggestionMessage}
                            </Alert>
                          ) : null}
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => void handlePromoteLevel(goal)}
                            disabled={!levelSnapshot?.canPromote || currentLevel >= targetLevel}
                            sx={{ alignSelf: "flex-start" }}
                          >
                            Promote Level
                          </Button>
                        </Stack>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Linked tasks preview
                          </Typography>
                          {previewTasks.map((task) => (
                            <Typography
                              key={task.id}
                              variant="caption"
                              color="text.secondary"
                              sx={{ textDecoration: task.completed ? "line-through" : "none" }}
                            >
                              • {task.title}
                            </Typography>
                          ))}
                          {goalTasks.length > previewTasks.length ? (
                            <Typography variant="caption" color="text.secondary">
                              +{goalTasks.length - previewTasks.length} more
                            </Typography>
                          ) : null}
                        </Stack>
                        <Stack spacing={1}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Sub-tasks
                          </Typography>
                          {(goalSubTasks[goal.id] ?? []).map((subtask) => (
                            <Stack key={subtask.id} direction="row" alignItems="center" spacing={1}>
                              <Checkbox checked={subtask.completed} onChange={() => void handleToggleSubTask(goal.id, subtask.id)} size="small" />
                              <Typography sx={{ flex: 1, textDecoration: subtask.completed ? "line-through" : "none" }}>
                                {subtask.title}
                              </Typography>
                              <IconButton size="small" onClick={() => openSubTaskEdit(goal.id, subtask)} aria-label="Edit sub-task">
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteSubTask(goal.id, subtask.id)} aria-label="Delete sub-task">
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          ))}
                          <Stack direction="row" spacing={1}>
                            <TextField
                              size="small"
                              placeholder="Add sub-task"
                              value={newSubTaskTitle[goal.id] ?? ""}
                              onChange={(event) => setNewSubTaskTitle((current) => ({ ...current, [goal.id]: event.target.value }))}
                              fullWidth
                            />
                            <Button variant="outlined" onClick={() => void handleAddSubTask(goal.id)}>
                              Add
                            </Button>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Collapse>
                  </Stack>
                    );
                  })()}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editingGoal)} onClose={() => setEditingGoal(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Goal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} fullWidth />
            <TextField label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} fullWidth />
            <TextField
              select
              label="Category"
              value={editCategory}
              onChange={(e) => {
                setEditCategory(e.target.value as GoalCategory);
                setEditSubCategory(null);
              }}
              fullWidth
            >
              {goalCategories.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            {(editCategory === "family" || editCategory === "peace") ? (
              <TextField
                select
                label="Sub-category"
                value={editSubCategory ?? ""}
                onChange={(e) => setEditSubCategory((e.target.value || null) as SubCategory | null)}
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {getSubCategoryOptions(editCategory).map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            ) : null}
            <TextField type="date" label="Target date" value={editTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField select label="Goal type" value={editGoalType} onChange={(e) => setEditGoalType(e.target.value as GoalType)} fullWidth>
              <MenuItem value="task">Task</MenuItem>
              <MenuItem value="milestone">Milestone</MenuItem>
              <MenuItem value="master">Master</MenuItem>
            </TextField>
            <TextField select label="Period" value={editPeriod} onChange={(e) => setEditPeriod(e.target.value as GoalPeriod)} fullWidth>
              <MenuItem value="one-time">One-time</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
            <TextField select label="Repeat" value={editRepeat} onChange={(e) => setEditRepeat(e.target.value as GoalRepeat)} fullWidth>
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField
                type="number"
                label="Current level"
                value={editLevelCurrent}
                onChange={(e) => setEditLevelCurrent(Math.max(1, Number(e.target.value)))}
                fullWidth
                inputProps={{ min: 1, max: 10 }}
              />
              <TextField
                type="number"
                label="Target level"
                value={editLevelTarget}
                onChange={(e) => setEditLevelTarget(Math.max(1, Number(e.target.value)))}
                fullWidth
                inputProps={{ min: 1, max: 10 }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingGoal(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSaveEdit()}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editingSubTask)} onClose={() => setEditingSubTask(null)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Sub-task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Sub-task title"
              value={editSubTaskTitle}
              onChange={(event) => setEditSubTaskTitle(event.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingSubTask(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSaveSubTaskEdit()}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCleanupConfirmOpen} onClose={closeCleanupConfirmDialog} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Goals Cleanup</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              This action reorganizes your goals into a cleaner structure and moves weekly system routines to habits when needed.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              It will remove duplicate or weekly system goals, enforce one master goal per pillar, keep finance monthly goals focused, and create equivalent habits only when similar habits do not already exist.
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Proceed only if you want this cleanup to run now.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCleanupConfirmDialog} disabled={isGoalsCleanupRunning}>Cancel</Button>
          <Button variant="contained" onClick={() => void runGoalsCleanup()} disabled={isGoalsCleanupRunning}>
            {isGoalsCleanupRunning ? "Cleaning..." : "Yes, run cleanup"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}