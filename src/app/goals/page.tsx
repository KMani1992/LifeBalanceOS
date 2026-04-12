"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/lib/auth-context";
import {
  createGoal,
  updateGoal,
  updateGoalCompletion,
  deleteGoal,
  listGoalSubTasks,
  createGoalSubTask,
  updateGoalSubTask,
  deleteGoalSubTask,
  checkGoalSubTasksAvailable,
} from "@/lib/persistence";
import { addGoal, replaceGoal, removeGoal } from "@/store/slices/goalsSlice";
import { AppDispatch, RootState } from "@/store/store";
import { GoalCategory, GoalSubTask } from "@/types";
import { GOAL_CATEGORIES } from "@/constants/options";
import { STORAGE_KEYS } from "@/constants/storage";
import { formatDateTimeHms } from "@/lib/date-time";

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
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const goals = useSelector((state: RootState) => state.goals.goals);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("career");
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editingGoal, setEditingGoal] = useState<null | typeof goals[0]>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<GoalCategory>("career");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [goalSubTasks, setGoalSubTasks] = useState<Record<string, GoalSubTask[]>>({});
  const [newSubTaskTitle, setNewSubTaskTitle] = useState<Record<string, string>>({});
  const [editingSubTask, setEditingSubTask] = useState<null | { goalId: string; subTask: GoalSubTask }>(null);
  const [editSubTaskTitle, setEditSubTaskTitle] = useState("");
  // null = unknown, true = DB available, false = using localStorage fallback
  const [subtasksDbAvailable, setSubtasksDbAvailable] = useState<boolean | null>(null);

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
        targetDate: targetDate || null,
      });
      dispatch(addGoal(goal));
      setTitle("");
      setDescription("");
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
    setEditTargetDate(goal.targetDate ?? "");
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
        targetDate: editTargetDate || null,
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
              <Grid item xs={12} md={4}>
                <TextField label="Goal title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select label="Category" value={category} onChange={(event) => setCategory(event.target.value as GoalCategory)} fullWidth>
                  {goalCategories.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField type="date" label="Target date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={1}>
                <Button fullWidth sx={{ height: "100%" }} variant="contained" onClick={handleCreateGoal}>
                  Add
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            alignItems: "stretch",
          }}
        >
          {goals.map((goal) => (
            <Box key={goal.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Checkbox checked={goal.completed} onChange={(event) => void handleToggleGoal(goal.id, event.target.checked)} />
                      <div>
                        <Typography variant="h6">{goal.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {goal.category} - target {goal.targetDate ?? "not set"}
                        </Typography>
                      </div>
                      <Box sx={{ flex: 1 }} />
                      <IconButton size="small" onClick={() => openEdit(goal)} aria-label="Edit goal">
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => void handleDeleteGoal(goal.id)} aria-label="Delete goal" sx={{ color: "error.main" }}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography color="text.secondary">{goal.description || "No description provided."}</Typography>
                    <LinearProgress variant="determinate" value={progressByGoal[goal.id] ?? 0} sx={{ height: 10, borderRadius: 999 }} />
                    <Typography variant="body2" color="text.secondary">
                      {(progressByGoal[goal.id] ?? 0) === 100
                        ? `Completed at ${goal.completedAt ? formatDateTimeHms(goal.completedAt) : "today"}`
                        : "In progress"}
                    </Typography>
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
            <TextField select label="Category" value={editCategory} onChange={(e) => setEditCategory(e.target.value as GoalCategory)} fullWidth>
              {goalCategories.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField type="date" label="Target date" value={editTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
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
    </Stack>
  );
}