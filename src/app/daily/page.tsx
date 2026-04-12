"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Button, Card, CardContent, Chip, Collapse, Grid, IconButton, Stack, Switch, Typography } from "@mui/material";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DailyChecklist from "@/components/dashboard/DailyChecklist";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/lib/auth-context";
import { createDailyTask, deleteDailyTask, listHabits, toggleHabitCompletion, updateDailyTask, updateDailyTaskCompletion } from "@/lib/persistence";
import { addTask, removeTask, replaceTask } from "@/store/slices/dailySlice";
import { setHabits } from "@/store/slices/habitSlice";
import { AppDispatch, RootState } from "@/store/store";
import { DailyTaskCategory } from "@/types";
import { DAILY_DEFAULT_RECURRING_TASKS } from "@/constants/options";
import { STORAGE_KEYS } from "@/constants/storage";

const defaultRecurringTasks: Array<{ title: string; category: DailyTaskCategory }> = DAILY_DEFAULT_RECURRING_TASKS;

interface RecurringTemplate {
  title: string;
  category: DailyTaskCategory;
}

function dateOnly(value: string) {
  return value.slice(0, 10);
}

/**
 * Renders the dedicated daily planner with category visibility for the whole task list.
 */
export default function DailyPlannerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const tasks = useSelector((state: RootState) => state.daily.tasks);
  const habits = useSelector((state: RootState) => state.habits.habits);
  const [quickMode, setQuickMode] = useState(true);
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>(defaultRecurringTasks);
  const [repeatExpanded, setRepeatExpanded] = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const initializedRecurringRef = useRef(false);
  const today = new Date().toISOString().slice(0, 10);

  const counts = tasks.reduce<Record<string, number>>((summary, task) => {
    summary[task.category] = (summary[task.category] ?? 0) + 1;
    return summary;
  }, {});

  const todaysTasks = useMemo(
    () => tasks.filter((task) => dateOnly(task.createdAt) === today),
    [tasks, today],
  );

  const completionRate = todaysTasks.length
    ? Math.round((todaysTasks.filter((task) => task.completed).length / todaysTasks.length) * 100)
    : 0;

  const trendData = useMemo(() => {
    const grouped = new Map<string, { total: number; done: number }>();
    tasks.forEach((task) => {
      const day = dateOnly(task.createdAt);
      const current = grouped.get(day) ?? { total: 0, done: 0 };
      current.total += 1;
      if (task.completed) {
        current.done += 1;
      }
      grouped.set(day, current);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([day, value]) => ({
        day,
        completionRate: value.total ? Math.round((value.done / value.total) * 100) : 0,
      }));
  }, [tasks]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEYS.recurringTemplates);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as RecurringTemplate[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setRecurringTemplates(parsed);
      }
    } catch {
      // Keep defaults when local storage is malformed.
    }
  }, []);

  useEffect(() => {
    if (!user || initializedRecurringRef.current) {
      return;
    }

    initializedRecurringRef.current = true;
    const userId = user.id;

    async function ensureDailyAutomation() {
      const todaySet = new Set(
        tasks
          .filter((task) => dateOnly(task.createdAt) === today)
          .map((task) => task.title.trim().toLowerCase()),
      );

      const allTemplates = [...defaultRecurringTasks, ...recurringTemplates].filter(
        (template, index, array) =>
          array.findIndex((item) => item.title.trim().toLowerCase() === template.title.trim().toLowerCase()) === index,
      );

      for (const template of allTemplates) {
        if (todaySet.has(template.title.trim().toLowerCase())) {
          continue;
        }
        const created = await createDailyTask(userId, {
          title: template.title,
          category: template.category,
        });
        dispatch(addTask(created));
      }
    }

    void ensureDailyAutomation().catch((automationError) => {
      setError(automationError instanceof Error ? automationError.message : "Failed to apply daily automation.");
    });
  }, [dispatch, recurringTemplates, tasks, today, user]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.recurringTemplates, JSON.stringify(recurringTemplates));
  }, [recurringTemplates]);

  /**
   * Creates a persisted daily task.
   */
  async function handleAddTask(title: string, category: DailyTaskCategory, options?: { recurring?: boolean }) {
    if (!user) {
      return;
    }

    try {
      setError(null);
      const task = await createDailyTask(user.id, { title, category });
      dispatch(addTask(task));

      if (options?.recurring) {
        setRecurringTemplates((current) => {
          const exists = current.some((template) => template.title.trim().toLowerCase() === title.trim().toLowerCase());
          if (exists) {
            return current;
          }
          return [...current, { title, category }];
        });
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to add task.");
    }
  }

  /**
   * Toggles a persisted daily task.
   */
  async function handleToggleTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) {
      return;
    }

    try {
      setError(null);
      const updatedTask = await updateDailyTaskCompletion(id, !task.completed);
      dispatch(replaceTask(updatedTask));

      if (!task.completed && updatedTask.completed) {
        const matchedHabits = habits.filter((habit) => habit.title.trim().toLowerCase() === task.title.trim().toLowerCase());
        if (matchedHabits.length > 0) {
          for (const habit of matchedHabits) {
            await toggleHabitCompletion(habit.id, true);
          }
          const refreshedHabits = await listHabits();
          dispatch(setHabits(refreshedHabits));
        }
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to update task.");
    }
  }

  /**
   * Deletes a persisted daily task.
   */
  async function handleDeleteTask(id: string) {
    try {
      setError(null);
      await deleteDailyTask(id);
      dispatch(removeTask(id));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to delete task.");
    }
  }

  /**
   * Updates daily task title/category.
   */
  async function handleEditTask(id: string, title: string, category: DailyTaskCategory) {
    try {
      setError(null);
      const updatedTask = await updateDailyTask(id, { title, category });
      dispatch(replaceTask(updatedTask));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to update task.");
    }
  }

  function toggleRecurringTemplate(taskTitle: string, category: DailyTaskCategory, enabled: boolean) {
    setRecurringTemplates((current) => {
      if (enabled) {
        const exists = current.some((template) => template.title.trim().toLowerCase() === taskTitle.trim().toLowerCase());
        if (exists) {
          return current;
        }
        return [...current, { title: taskTitle, category }];
      }
      return current.filter((template) => template.title.trim().toLowerCase() !== taskTitle.trim().toLowerCase());
    });
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Daily Planner"
        description="A short, category-based checklist for the day: career, health, family, kids, finance, and personal."
      />
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Category Overview
            </Typography>
            <Grid container spacing={1.5}>
              {Object.entries(counts).map(([category, count]) => (
                <Grid item key={category}>
                  <Chip label={`${category}: ${count}`} color="primary" variant="outlined" />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
        {!reminderDismissed && todaysTasks.length > 2 && completionRate < 50 ? (
          <Alert
            severity="info"
            action={<Button size="small" onClick={() => setReminderDismissed(true)}>Dismiss</Button>}
          >
            Gentle reminder: complete one more task now to keep your day moving calmly.
          </Alert>
        ) : null}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            alignItems: "stretch",
          }}
        >
          <Box>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack spacing={1.25}>
                  <Typography variant="h6">Quick Mode</Typography>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary">One-tap complete for today's tasks</Typography>
                    <Switch checked={quickMode} onChange={(event) => setQuickMode(event.target.checked)} />
                  </Stack>
                  {quickMode ? (
                    <Stack spacing={1}>
                      {todaysTasks.length === 0 ? (
                        <Typography color="text.secondary">No tasks for today yet. Add one and keep it simple.</Typography>
                      ) : (
                        todaysTasks.map((task) => (
                          <Button
                            key={task.id}
                            variant={task.completed ? "outlined" : "contained"}
                            color={task.completed ? "success" : "primary"}
                            onClick={() => void handleToggleTask(task.id)}
                            sx={{ justifyContent: "flex-start" }}
                          >
                            {task.completed ? "Done: " : "Tap to complete: "}
                            {task.title}
                          </Button>
                        ))
                      )}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">Quick mode is off. Turn it on for one-screen completion.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack spacing={1.25}>
                  <Typography variant="h6">Completion Rate Trend (Last 7 Days)</Typography>
                  <Typography color="text.secondary">Today: {completionRate}% complete</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="completionRate" fill="#1E88E5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <div>
                <Typography variant="h6">Repeat Task Configuration</Typography>
                {!repeatExpanded && (
                  <Typography variant="body2" color="text.secondary">Mark any existing task to repeat daily automatically.</Typography>
                )}
              </div>
              <IconButton
                size="small"
                onClick={() => setRepeatExpanded((prev) => !prev)}
                aria-label={repeatExpanded ? "Collapse repeat task configuration" : "Expand repeat task configuration"}
                aria-expanded={repeatExpanded}
              >
                {repeatExpanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </IconButton>
            </Stack>
            <Collapse in={repeatExpanded}>
              <Stack spacing={1.25} sx={{ mt: 1 }}>
                <Typography color="text.secondary">Mark any existing task to repeat daily automatically.</Typography>
                <Grid container spacing={1.2}>
                  {tasks.map((task) => {
                    const recurring = recurringTemplates.some((template) => template.title.trim().toLowerCase() === task.title.trim().toLowerCase());
                    return (
                      <Grid item xs={12} md={6} key={task.id}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 0.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.55)" }}>
                          <Typography>{task.title}</Typography>
                          <Switch
                            checked={recurring}
                            onChange={(event) => toggleRecurringTemplate(task.title, task.category, event.target.checked)}
                          />
                        </Stack>
                      </Grid>
                    );
                  })}
                </Grid>
              </Stack>
            </Collapse>
          </CardContent>
        </Card>
        <DailyChecklist
          title="Daily Planner"
          tasks={tasks}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onAdd={handleAddTask}
          onEdit={handleEditTask}
        />
    </Stack>
  );
}
