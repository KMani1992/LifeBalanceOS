"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import DailyChecklist from "@/components/dashboard/DailyChecklist";
import { useAuth } from "@/lib/auth-context";
import { createDailyTask, deleteDailyTask, updateDailyTask, updateDailyTaskCompletion } from "@/lib/persistence";
import { addTask, removeTask, replaceTask } from "@/store/slices/dailySlice";
import { AppDispatch, RootState } from "@/store/store";
import { DailyTaskCategory } from "@/types";

/**
 * Renders the dedicated daily planner with category visibility for the whole task list.
 */
export default function DailyPlannerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const tasks = useSelector((state: RootState) => state.daily.tasks);

  const counts = tasks.reduce<Record<string, number>>((summary, task) => {
    summary[task.category] = (summary[task.category] ?? 0) + 1;
    return summary;
  }, {});

  /**
   * Creates a persisted daily task.
   */
  async function handleAddTask(title: string, category: DailyTaskCategory) {
    if (!user) {
      return;
    }

    try {
      setError(null);
      const task = await createDailyTask(user.id, { title, category });
      dispatch(addTask(task));
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

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h3">Daily Planner</Typography>
          <Typography color="text.secondary">
            A short, category-based checklist for the day: career, health, family, kids, finance, and personal.
          </Typography>
        </div>
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
