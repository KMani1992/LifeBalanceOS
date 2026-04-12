"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { calculateLifeBalanceScore } from "@/lib/score";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAuth } from "@/lib/auth-context";
import { listGoalSubTasks } from "@/lib/persistence";
import { GoalSubTask } from "@/types";

interface WeeklyReviewFormProps {
  onSubmit: (payload: {
    weekStart: string;
    careerScore: number;
    familyScore: number;
    financeScore: number;
    peaceScore: number;
    notes: string;
  }) => void | Promise<void>;
}

/**
 * Collects the weekly review scores and notes for the four life pillars.
 */
export default function WeeklyReviewForm({
  onSubmit,
}: WeeklyReviewFormProps) {
  const { user } = useAuth();
  const tasks = useSelector((state: RootState) => state.daily.tasks);
  const goals = useSelector((state: RootState) => state.goals.goals);
  const [weekStart, setWeekStart] = useState("2026-04-07");
  const [careerScore, setCareerScore] = useState(8);
  const [familyScore, setFamilyScore] = useState(8);
  const [financeScore, setFinanceScore] = useState(7);
  const [peaceScore, setPeaceScore] = useState(7);
  const [subTasksByGoal, setSubTasksByGoal] = useState<Record<string, GoalSubTask[]>>({});
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user || goals.length === 0) {
      setSubTasksByGoal({});
      return;
    }

    let active = true;

    async function hydrateSubTasks() {
      try {
        const tuples = await Promise.all(
          goals.map(async (goal) => [goal.id, await listGoalSubTasks(goal.id)] as const),
        );

        if (!active) {
          return;
        }

        setSubTasksByGoal(Object.fromEntries(tuples));
      } catch {
        // Subtask table may not be migrated yet; score suggestion falls back to tasks-only.
        if (active) {
          setSubTasksByGoal({});
        }
      }
    }

    void hydrateSubTasks();

    return () => {
      active = false;
    };
  }, [goals, user]);

  const suggestedScores = useMemo(() => {
    const weekStartDate = new Date(`${weekStart}T00:00:00.000Z`);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);

    const clamp = (value: number) => Math.max(1, Math.min(10, Math.round(value)));

    const inWeek = (value: string) => {
      const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
      return date >= weekStartDate && date <= weekEndDate;
    };

    const mapTaskToPillar = (category: string): "career" | "family" | "finance" | "peace" => {
      if (category === "career") {
        return "career";
      }
      if (category === "family" || category === "kids") {
        return "family";
      }
      if (category === "finance") {
        return "finance";
      }
      return "peace";
    };

    const base = {
      career: { dailyDone: 0, dailyTotal: 0, goalDone: 0, goalTotal: 0 },
      family: { dailyDone: 0, dailyTotal: 0, goalDone: 0, goalTotal: 0 },
      finance: { dailyDone: 0, dailyTotal: 0, goalDone: 0, goalTotal: 0 },
      peace: { dailyDone: 0, dailyTotal: 0, goalDone: 0, goalTotal: 0 },
    };

    tasks.filter((task) => inWeek(task.createdAt)).forEach((task) => {
      const pillar = mapTaskToPillar(task.category);
      base[pillar].dailyTotal += 1;
      if (task.completed) {
        base[pillar].dailyDone += 1;
      }
    });

    goals.forEach((goal) => {
      const bucket = base[goal.category];
      const subtasks = subTasksByGoal[goal.id] ?? [];
      if (subtasks.length > 0) {
        bucket.goalTotal += subtasks.length;
        bucket.goalDone += subtasks.filter((subtask) => subtask.completed).length;
        return;
      }

      bucket.goalTotal += 1;
      if (goal.completed) {
        bucket.goalDone += 1;
      }
    });

    const pillarScore = (pillar: keyof typeof base) => {
      const item = base[pillar];
      const dailyRate = item.dailyTotal > 0 ? item.dailyDone / item.dailyTotal : null;
      const goalRate = item.goalTotal > 0 ? item.goalDone / item.goalTotal : null;

      let blendedRate = 0.5;
      if (dailyRate !== null && goalRate !== null) {
        blendedRate = dailyRate * 0.65 + goalRate * 0.35;
      } else if (dailyRate !== null) {
        blendedRate = dailyRate;
      } else if (goalRate !== null) {
        blendedRate = goalRate;
      }

      return clamp(1 + blendedRate * 9);
    };

    return {
      career: pillarScore("career"),
      family: pillarScore("family"),
      finance: pillarScore("finance"),
      peace: pillarScore("peace"),
    };
  }, [goals, subTasksByGoal, tasks, weekStart]);

  useEffect(() => {
    if (!isApplyingSuggestion) {
      return;
    }

    setCareerScore(suggestedScores.career);
    setFamilyScore(suggestedScores.family);
    setFinanceScore(suggestedScores.finance);
    setPeaceScore(suggestedScores.peace);
  }, [isApplyingSuggestion, suggestedScores]);

  const score = calculateLifeBalanceScore(
    careerScore,
    familyScore,
    financeScore,
    peaceScore,
  );

  /**
   * Emits the review payload to the parent page.
   */
  function handleSubmit() {
    void onSubmit({
      weekStart,
      careerScore,
      familyScore,
      financeScore,
      peaceScore,
      notes,
    });
    setNotes("");
  }

  return (
    <Card sx={{ overflowX: "clip" }}>
      <CardContent sx={{ px: { xs: 1, md: 2.5 }, py: { xs: 2, md: 3 } }}>
        <Stack spacing={3} sx={{ width: "100%", maxWidth: { xs: 320, sm: "100%" }, mx: "auto" }}>
          <div>
            <Typography variant="h5">Weekly Review</Typography>
            <Typography variant="body2" color="text.secondary">
              Score the week honestly and keep notes for next-week adjustments.
            </Typography>
          </div>
          <Grid
            container
            spacing={{ xs: 1.25, md: 2 }}
            sx={{
              width: "100%",
              mx: 0,
              px: { xs: 0, md: 1 },
            }}
          >
            <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
              <TextField
                label="Week start"
                type="date"
                value={weekStart}
                onChange={(event) => {
                  setWeekStart(event.target.value);
                  setIsApplyingSuggestion(true);
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
                alignItems="center"
                sx={{ height: "100%" }}
              >
                <Button
                  variant="outlined"
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                  onClick={() => {
                    setIsApplyingSuggestion(true);
                    setCareerScore(suggestedScores.career);
                    setFamilyScore(suggestedScores.family);
                    setFinanceScore(suggestedScores.finance);
                    setPeaceScore(suggestedScores.peace);
                  }}
                >
                  Apply Auto Suggestion
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} sx={{ minWidth: 0 }}>
              <Alert severity="info" sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>
                Suggested scores are calculated from this week&apos;s completed daily tasks and goal/subtask progress. You can still adjust manually.
              </Alert>
            </Grid>
            {[
              { label: "Career", value: careerScore, setter: setCareerScore },
              { label: "Family", value: familyScore, setter: setFamilyScore },
              { label: "Finance", value: financeScore, setter: setFinanceScore },
              { label: "Personal Peace", value: peaceScore, setter: setPeaceScore },
            ].map((field) => (
              <Grid item xs={12} sm={6} key={field.label} sx={{ minWidth: 0 }}>
                <Stack spacing={0.75} sx={{ px: { xs: 0.25, sm: 1 } }}>
                  <Typography variant="body2" color="text.secondary">
                    {field.label}: {field.value}
                  </Typography>
                  <Slider
                    value={field.value}
                    min={1}
                    max={10}
                    marks
                    step={1}
                    onChange={(_, value) => {
                      setIsApplyingSuggestion(false);
                      field.setter(value as number);
                    }}
                  />
                </Stack>
              </Grid>
            ))}
            <Grid item xs={12} sx={{ minWidth: 0, px: { xs: 0.25, sm: 0 } }}>
              <TextField
                label="Notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" sx={{ width: "100%" }}>
            <Typography variant="h4" sx={{ fontSize: { xs: "2rem", sm: "2.125rem" }, lineHeight: 1.1 }}>
              Life Balance Score: {score}
            </Typography>
            <Button variant="contained" onClick={handleSubmit}>
              Save Review
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
