"use client";

import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import DailyChecklist from "@/components/dashboard/DailyChecklist";
import LifeRadarChart from "@/components/dashboard/LifeRadarChart";
import LifePillarsCards from "@/components/dashboard/LifePillarsCards";
import LifeScoreCard from "@/components/dashboard/LifeScoreCard";
import { useAuth } from "@/lib/auth-context";
import { createDailyTask, deleteDailyTask, updateDailyTask, updateDailyTaskCompletion } from "@/lib/persistence";
import { getLatestWeeklyReview } from "@/lib/score";
import { addTask, removeTask, replaceTask } from "@/store/slices/dailySlice";
import { AppDispatch, RootState } from "@/store/store";
import { DailyTaskCategory, moduleColors, PillarSummary } from "@/types";

/**
 * Renders the main dashboard with scorecards, charts, tasks, and quick actions.
 */
export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const tasks = useSelector((state: RootState) => state.daily.tasks);
  const reviews = useSelector((state: RootState) => state.weeklyReviews.reviews);
  const goals = useSelector((state: RootState) => state.goals.goals);
  const habits = useSelector((state: RootState) => state.habits.habits);
  const latestReview = getLatestWeeklyReview(reviews);

  const pillars: PillarSummary[] = [
    {
      key: "career",
      title: "Career",
      description: "Execution, learning, and momentum in meaningful work.",
      score: latestReview?.careerScore ?? 0,
      color: moduleColors.career,
    },
    {
      key: "family",
      title: "Family",
      description: "Presence, reliability, and emotional availability at home.",
      score: latestReview?.familyScore ?? 0,
      color: moduleColors.family,
    },
    {
      key: "finance",
      title: "Finance",
      description: "Clarity on cash flow, savings, and strategic investments.",
      score: latestReview?.financeScore ?? 0,
      color: moduleColors.finance,
    },
    {
      key: "peace",
      title: "Peace",
      description: "Energy, calm, boundaries, and recovery across the week.",
      score: latestReview?.peaceScore ?? 0,
      color: moduleColors.peace,
    },
  ];

  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const completedHabits = habits.filter((habit) => habit.completedToday).length;
  const scoreNote = `${completedTasks}/${Math.max(tasks.length, 1)} tasks complete, ${goals.filter((goal) => goal.completed).length} goals closed, ${habits.filter((habit) => habit.completedToday).length} habits done today.`;

  /**
   * Creates a daily task and persists it in Supabase.
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
   * Toggles a task and persists the completion state.
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
   * Deletes a task from Supabase and Redux state.
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
   * Updates task title/category and syncs Redux state.
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
        <PageHeader
          eyebrow="Weekly Operating View"
          title="Balance the week before it drifts"
          description="LifeBalanceOS keeps the four pillars, today’s commitments, and your recovery signals in one calm command surface."
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component={Link} href="/weekly-review" variant="contained">
              Review This Week
            </Button>
            <Button component={Link} href="/daily" variant="outlined">
              Open Planner
            </Button>
          </Stack>
        </PageHeader>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} xl={3}>
            <LifeScoreCard score={latestReview?.lifeBalanceScore ?? 0} note={scoreNote} />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <StatCard
              label="Task Completion"
              value={`${completionRate}%`}
              support={`${completedTasks} of ${tasks.length} daily tasks completed.`}
              accent={moduleColors.career}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <StatCard
              label="Goals Closed"
              value={`${completedGoals}`}
              support={`${goals.length - completedGoals} still in active focus.`}
              accent={moduleColors.finance}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <StatCard
              label="Habits Today"
              value={`${completedHabits}`}
              support={`${habits.length - completedHabits} habits still open today.`}
              accent={moduleColors.peace}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} xl={8}>
            <LifeRadarChart pillars={pillars} />
          </Grid>
          <Grid item xs={12} xl={4}>
            <Grid container spacing={2}>
              {pillars.slice(0, 2).map((pillar) => (
                <Grid item xs={12} sm={6} xl={12} key={pillar.key}>
                  <StatCard
                    label={pillar.title}
                    value={`${pillar.score}/10`}
                    support={pillar.description}
                    accent={pillar.color}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <LifePillarsCards pillars={pillars} />
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <DailyChecklist
              title="Today&apos;s Checklist"
              tasks={tasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onAdd={handleAddTask}
              onEdit={handleEditTask}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <StatCard
                label="Quick Insight"
                value={latestReview ? `${latestReview.weekStart}` : "No review"}
                support={latestReview ? "Latest weekly review anchor date." : "Create your first weekly review to generate a balance score."}
                accent={moduleColors.family}
              />
              <Stack
                spacing={1.5}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(22,50,79,0.08)",
                  aspectRatio: "1/1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Button component={Link} href="/daily" variant="contained" size="small" fullWidth>
                    Daily Planner
                  </Button>
                  <Button component={Link} href="/weekly-review" variant="outlined" size="small" fullWidth>
                    Weekly Review
                  </Button>
                  <Button component={Link} href="/finance" variant="outlined" size="small" fullWidth>
                    Finance
                  </Button>
                  <Button component={Link} href="/reflections" variant="outlined" size="small" fullWidth>
                    Reflection
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
  );
}
