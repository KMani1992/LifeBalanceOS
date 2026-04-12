"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/lib/auth-context";
import { createReflection, updateReflection, deleteReflection } from "@/lib/persistence";
import { addReflection, replaceReflection, removeReflection } from "@/store/slices/reflectionSlice";
import { AppDispatch, RootState } from "@/store/store";

/**
 * Renders the daily reflections journal workflow.
 */
export default function ReflectionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const reflections = useSelector((state: RootState) => state.reflections.reflections);
  const tasks = useSelector((state: RootState) => state.daily.tasks);
  const [reflectionDate, setReflectionDate] = useState("2026-04-10");
  const [wentWell, setWentWell] = useState("");
  const [learnedToday, setLearnedToday] = useState("");
  const [improveTomorrow, setImproveTomorrow] = useState("");
  const [mood, setMood] = useState(8);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPositive, setAiPositive] = useState("");
  const [editingReflection, setEditingReflection] = useState<null | typeof reflections[0]>(null);
  const [editWentWell, setEditWentWell] = useState("");
  const [editLearned, setEditLearned] = useState("");
  const [editImprove, setEditImprove] = useState("");
  const [editMood, setEditMood] = useState(8);

  const autoMood = useMemo(() => {
    const selectedDayTasks = tasks.filter(
      (task) => task.createdAt.slice(0, 10) === reflectionDate,
    );

    if (selectedDayTasks.length === 0) {
      return 5;
    }

    const completedTasks = selectedDayTasks.filter((task) => task.completed);
    const completionRatio = completedTasks.length / selectedDayTasks.length;

    const totalCategories = new Set(selectedDayTasks.map((task) => task.category)).size;
    const completedCategories = new Set(
      completedTasks.map((task) => task.category),
    ).size;
    const categoryCoverage =
      totalCategories > 0 ? completedCategories / totalCategories : 0;

    const score = Math.round(3 + completionRatio * 5 + categoryCoverage * 2);
    return Math.max(1, Math.min(10, score));
  }, [reflectionDate, tasks]);

  useEffect(() => {
    setMood(autoMood);
  }, [autoMood]);

  /**
   * Adds a reflection entry when all prompt answers are present.
   */
  async function handleSaveReflection() {
    if (!user || !wentWell.trim() || !learnedToday.trim() || !improveTomorrow.trim()) {
      return;
    }

    try {
      setError(null);
      const reflection = await createReflection(user.id, {
        reflectionDate,
        wentWell,
        learnedToday,
        improveTomorrow,
        mood,
      });
      dispatch(addReflection(reflection));
      setWentWell("");
      setLearnedToday("");
      setImproveTomorrow("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to save reflection.");
    }
  }

  /**
   * Requests a concise observation and suggestion from the AI coach.
   */
  async function handleGenerateAiInsight() {
    const reflectionText = [wentWell, learnedToday, improveTomorrow].filter(Boolean).join("\n");
    if (!reflectionText.trim()) {
      setError("Write a short reflection first, then ask AI for insights.");
      return;
    }

    try {
      setError(null);
      setAiLoading(true);
      const response = await fetch("/api/reflection-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflectionText }),
      });
      const data = (await response.json()) as {
        positiveObservation?: string;
        improvementSuggestion?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate AI insight.");
      }

      setAiPositive(data.positiveObservation ?? "You stayed consistent today.");
      if (data.improvementSuggestion) {
        setImproveTomorrow(data.improvementSuggestion);
      }
    } catch (aiError) {
      setError(aiError instanceof Error ? aiError.message : "Failed to generate AI insight.");
    } finally {
      setAiLoading(false);
    }
  }

  /** Opens edit dialog pre-filled. */
  function openEdit(r: typeof reflections[0]) {
    setEditingReflection(r);
    setEditWentWell(r.wentWell);
    setEditLearned(r.learnedToday);
    setEditImprove(r.improveTomorrow);
    setEditMood(r.mood);
  }

  /** Saves the edited reflection. */
  async function handleSaveEdit() {
    if (!editingReflection) return;
    try {
      setError(null);
      const updated = await updateReflection(editingReflection.id, {
        wentWell: editWentWell.trim(),
        learnedToday: editLearned.trim(),
        improveTomorrow: editImprove.trim(),
        mood: editMood,
      });
      dispatch(replaceReflection(updated));
      setEditingReflection(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update reflection.");
    }
  }

  /** Deletes a reflection. */
  async function handleDeleteReflection(id: string) {
    try {
      setError(null);
      await deleteReflection(id);
      dispatch(removeReflection(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete reflection.");
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Daily Reflections"
        description="Capture what worked, what you learned, and what you will improve tomorrow."
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField type="date" label="Reflection date" value={reflectionDate} onChange={(event) => setReflectionDate(event.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="What went well today?" value={wentWell} onChange={(event) => setWentWell(event.target.value)} multiline minRows={2} fullWidth />
              <TextField label="What did I learn today?" value={learnedToday} onChange={(event) => setLearnedToday(event.target.value)} multiline minRows={2} fullWidth />
              <TextField label="What will I improve tomorrow?" value={improveTomorrow} onChange={(event) => setImproveTomorrow(event.target.value)} multiline minRows={2} fullWidth />
              <Stack spacing={0.5} sx={{ maxWidth: 360 }}>
                <Typography color="text.secondary">Mood (1-10, auto from completed tasks): {mood}</Typography>
                <Slider value={mood} min={1} max={10} step={1} marks onChange={(_, value) => setMood(value as number)} />
              </Stack>
              <Button variant="outlined" onClick={() => void handleGenerateAiInsight()} disabled={aiLoading} sx={{ alignSelf: "flex-start" }}>
                {aiLoading ? "Generating insight..." : "Get AI Insight"}
              </Button>
              {aiPositive ? (
                <Alert severity="success">{aiPositive}</Alert>
              ) : null}
              <Button variant="contained" onClick={handleSaveReflection} sx={{ alignSelf: "flex-start" }}>
                Save Reflection
              </Button>
            </Stack>
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
          {reflections.map((reflection) => (
            <Box key={reflection.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center">
                      <Typography variant="h6" sx={{ flex: 1 }}>{reflection.reflectionDate}</Typography>
                      <IconButton size="small" onClick={() => openEdit(reflection)} aria-label="Edit reflection">
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => void handleDeleteReflection(reflection.id)} aria-label="Delete reflection" sx={{ color: "error.main" }}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography color="text.secondary">Mood: {reflection.mood}/10</Typography>
                    <Typography><strong>Went well:</strong> {reflection.wentWell}</Typography>
                    <Typography><strong>Learned:</strong> {reflection.learnedToday}</Typography>
                    <Typography><strong>Improve:</strong> {reflection.improveTomorrow}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editingReflection)} onClose={() => setEditingReflection(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Reflection</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="What went well?" value={editWentWell} onChange={(e) => setEditWentWell(e.target.value)} multiline minRows={2} fullWidth />
            <TextField label="What did I learn?" value={editLearned} onChange={(e) => setEditLearned(e.target.value)} multiline minRows={2} fullWidth />
            <TextField label="What will I improve?" value={editImprove} onChange={(e) => setEditImprove(e.target.value)} multiline minRows={2} fullWidth />
            <TextField type="number" label="Mood (1-10)" value={editMood} onChange={(e) => setEditMood(Math.min(10, Math.max(1, Number(e.target.value))))} sx={{ maxWidth: 220 }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingReflection(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSaveEdit()}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
