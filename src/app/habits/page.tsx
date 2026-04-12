"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/lib/auth-context";
import { createHabit, toggleHabitCompletion, updateHabit, deleteHabit } from "@/lib/persistence";
import { addHabit, setHabits, replaceHabit, removeHabit } from "@/store/slices/habitSlice";
import { AppDispatch, RootState } from "@/store/store";
import { HabitCategory } from "@/types";
import { HABIT_CATEGORIES } from "@/constants/options";

const categories: HabitCategory[] = HABIT_CATEGORIES;

/**
 * Renders the habit tracker with streak visibility and daily completion toggles.
 */
export default function HabitsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const habits = useSelector((state: RootState) => state.habits.habits);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HabitCategory>("learning");
  const [targetFrequency, setTargetFrequency] = useState(7);
  const [editingHabit, setEditingHabit] = useState<null | typeof habits[0]>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<HabitCategory>("learning");
  const [editFrequency, setEditFrequency] = useState(7);

  /**
   * Adds a habit when the title is present.
   */
  async function handleAddHabit() {
    if (!user || !title.trim()) {
      return;
    }

    try {
      setError(null);
      const habit = await createHabit(user.id, { title: title.trim(), category, targetFrequency });
      dispatch(addHabit(habit));
      setTitle("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to create habit.");
    }
  }

  /**
   * Toggles today's habit log and refreshes the derived streaks.
   */
  async function handleToggleHabit(habitId: string, complete: boolean) {
    try {
      setError(null);
      const updatedHabits = await toggleHabitCompletion(habitId, complete);
      dispatch(setHabits(updatedHabits));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to update habit.");
    }
  }

  /** Opens edit dialog pre-filled. */
  function openEdit(habit: typeof habits[0]) {
    setEditingHabit(habit);
    setEditTitle(habit.title);
    setEditCategory(habit.category);
    setEditFrequency(habit.targetFrequency);
  }

  /** Saves the edited habit. */
  async function handleSaveEdit() {
    if (!editingHabit) return;
    try {
      setError(null);
      const updated = await updateHabit(editingHabit.id, {
        title: editTitle.trim(),
        category: editCategory,
        targetFrequency: editFrequency,
      });
      dispatch(replaceHabit(updated));
      setEditingHabit(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update habit.");
    }
  }

  /** Deletes a habit. */
  async function handleDeleteHabit(id: string) {
    try {
      setError(null);
      await deleteHabit(id);
      dispatch(removeHabit(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete habit.");
    }
  }

  return (
    <>
      <Stack spacing={3}>
      <PageHeader
        title="Habit Tracker"
        description="Build consistent routines with streak visibility and complete habits daily for balance."
      />
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField label="Habit title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select label="Category" value={category} onChange={(event) => setCategory(event.target.value as HabitCategory)} fullWidth>
                  {categories.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField type="number" label="Target frequency" value={targetFrequency} onChange={(event) => setTargetFrequency(Math.max(1, Number(event.target.value)))} fullWidth />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth sx={{ height: "100%" }} variant="contained" onClick={handleAddHabit}>
                  Add Habit
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="stretch">
          <Card sx={{ height: "100%", flex: 1, minWidth: 0 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={1.5}>
                <Typography variant="h5">Today&apos;s Habits</Typography>
                {habits.map((habit) => (
                  <Stack key={habit.id} direction="row" spacing={1} alignItems="center">
                    <Checkbox checked={habit.completedToday} onChange={(event) => void handleToggleHabit(habit.id, event.target.checked)} />
                    <div>
                      <Typography>{habit.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {habit.category} - {habit.streak} day streak - target {habit.targetFrequency}/week
                      </Typography>
                    </div>
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" onClick={() => openEdit(habit)} aria-label="Edit habit">
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => void handleDeleteHabit(habit.id)} aria-label="Delete habit" sx={{ color: "error.main" }}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
          <Card sx={{ height: "100%", flex: 1, minWidth: 0 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Habit Streak Chart
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={habits.map((habit) => ({ name: habit.title, streak: habit.streak }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="streak" fill="#8E24AA" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Stack>
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editingHabit)} onClose={() => setEditingHabit(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Habit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Habit title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} fullWidth />
            <TextField select label="Category" value={editCategory} onChange={(e) => setEditCategory(e.target.value as HabitCategory)} fullWidth>
              {categories.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField type="number" label="Target frequency (per week)" value={editFrequency} onChange={(e) => setEditFrequency(Math.max(1, Number(e.target.value)))} sx={{ maxWidth: 280 }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingHabit(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSaveEdit()}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}