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
import { useAuth } from "@/lib/auth-context";
import { createGoal, updateGoal, updateGoalCompletion, deleteGoal } from "@/lib/persistence";
import { addGoal, replaceGoal, removeGoal } from "@/store/slices/goalsSlice";
import { AppDispatch, RootState } from "@/store/store";
import { GoalCategory } from "@/types";

const goalCategories: GoalCategory[] = ["career", "family", "finance", "peace"];

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

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h3">Goals</Typography>
          <Typography color="text.secondary">
            Convert the long-term priorities into specific targets with dates and visible completion status.
          </Typography>
        </div>
        {error ? <Alert severity="error">{error}</Alert> : null}
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
                    <LinearProgress variant="determinate" value={goal.completed ? 100 : 0} sx={{ height: 10, borderRadius: 999 }} />
                    <Typography variant="body2" color="text.secondary">
                      {goal.completed ? `Completed at ${goal.completedAt?.slice(0, 10) ?? "today"}` : "In progress"}
                    </Typography>
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
    </Stack>
  );
}