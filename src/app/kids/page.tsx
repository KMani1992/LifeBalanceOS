"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Autocomplete,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/lib/auth-context";
import { createKidsActivity, updateKidsActivity, deleteKidsActivity } from "@/lib/persistence";
import { addKidsActivity, replaceKidsActivity, removeKidsActivity } from "@/store/slices/kidsSlice";
import { AppDispatch, RootState } from "@/store/store";
import { KIDS_FOCUS_AREAS, KIDS_PERFORMANCE_LEVELS } from "@/constants/options";
import { STORAGE_KEYS } from "@/constants/storage";

type PerformanceLevel = (typeof KIDS_PERFORMANCE_LEVELS)[number];
type FocusArea = (typeof KIDS_FOCUS_AREAS)[number];

const performanceLevels: PerformanceLevel[] = [...KIDS_PERFORMANCE_LEVELS];
const focusAreaOptions: FocusArea[] = [...KIDS_FOCUS_AREAS];

function levelScore(value: PerformanceLevel) {
  if (value === "Good") return 5;
  if (value === "Avg") return 3;
  return 1;
}

function parseAssessment(description: string) {
  const parts = description.split("|").map((part) => part.trim());
  const byKey = (key: string) => {
    const match = parts.find((part) => part.toLowerCase().startsWith(`${key.toLowerCase()}:`));
    return match?.split(":").slice(1).join(":").trim() ?? "";
  };

  const safeLevel = (value: string): PerformanceLevel =>
    value === "Good" || value === "Avg" || value === "Low" ? value : "Avg";

  const focus = byKey("Focus Area");
  const note = byKey("Note");

  return {
    learning: safeLevel(byKey("Learning")),
    behavior: safeLevel(byKey("Behavior")),
    communication: safeLevel(byKey("Communication")),
    focusArea: focusAreaOptions.includes(focus as FocusArea) ? (focus as FocusArea) : "",
    note,
  };
}

/**
 * Renders the kids development tracker for study, behavior, physical activity, and creativity.
 */
export default function KidsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const activities = useSelector((state: RootState) => state.kids.activities);
  const [childName, setChildName] = useState("");
  const [savedChildNames, setSavedChildNames] = useState<string[]>([]);
  const [learningLevel, setLearningLevel] = useState<PerformanceLevel>("Good");
  const [behaviorLevel, setBehaviorLevel] = useState<PerformanceLevel>("Good");
  const [communicationLevel, setCommunicationLevel] = useState<PerformanceLevel>("Good");
  const [focusArea, setFocusArea] = useState<"" | FocusArea>("");
  const [note, setNote] = useState("");
  const [reviewDate, setReviewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editingActivity, setEditingActivity] = useState<null | typeof activities[0]>(null);
  const [editChildName, setEditChildName] = useState("");
  const [editLearningLevel, setEditLearningLevel] = useState<PerformanceLevel>("Good");
  const [editBehaviorLevel, setEditBehaviorLevel] = useState<PerformanceLevel>("Good");
  const [editCommunicationLevel, setEditCommunicationLevel] = useState<PerformanceLevel>("Good");
  const [editFocusArea, setEditFocusArea] = useState<"" | FocusArea>("");
  const [editNote, setEditNote] = useState("");
  const [editReviewDate, setEditReviewDate] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEYS.kidsNames);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setSavedChildNames(parsed.filter((item) => typeof item === "string" && item.trim().length > 0));
      }
    } catch {
      // Ignore malformed local storage cache.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.kidsNames, JSON.stringify(savedChildNames));
  }, [savedChildNames]);

  const childNameOptions = useMemo(() => {
    const combined = [...savedChildNames, ...activities.map((activity) => activity.childName)]
      .map((item) => item.trim())
      .filter(Boolean);
    return Array.from(new Set(combined)).sort((left, right) => left.localeCompare(right));
  }, [activities, savedChildNames]);

  function rememberChildName(value: string) {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    setSavedChildNames((current) => {
      const exists = current.some((item) => item.toLowerCase() === normalized.toLowerCase());
      if (exists) {
        return current;
      }
      return [...current, normalized];
    });
  }

  const weeklyTrend = activities
    .slice()
    .sort((a, b) => a.activityDate.localeCompare(b.activityDate))
    .slice(-8)
    .map((activity) => ({
      week: activity.activityDate,
      score: activity.rating,
    }));

  /**
   * Adds a new kids activity record.
   */
  async function handleAddActivity() {
    if (!user || !childName.trim()) {
      return;
    }

    try {
      setError(null);
      const computedRating = Math.round((
        levelScore(learningLevel) + levelScore(behaviorLevel) + levelScore(communicationLevel)
      ) / 3);

      const descriptionParts = [
        `Learning: ${learningLevel}`,
        `Behavior: ${behaviorLevel}`,
        `Communication: ${communicationLevel}`,
      ];
      if (focusArea) {
        descriptionParts.push(`Focus Area: ${focusArea}`);
      }
      if (note.trim()) {
        descriptionParts.push(`Note: ${note.trim()}`);
      }

      const activity = await createKidsActivity(user.id, {
        childName: childName.trim(),
        activityType: "study",
        description: descriptionParts.join(" | "),
        activityDate: reviewDate,
        rating: computedRating,
      });
      dispatch(addKidsActivity(activity));
      rememberChildName(childName);
      setNote("");
      setFocusArea("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to add kids activity.");
    }
  }

  /** Opens edit dialog pre-filled. */
  function openEdit(activity: typeof activities[0]) {
    const parsed = parseAssessment(activity.description ?? "");
    setEditingActivity(activity);
    setEditChildName(activity.childName);
    setEditLearningLevel(parsed.learning);
    setEditBehaviorLevel(parsed.behavior);
    setEditCommunicationLevel(parsed.communication);
    setEditFocusArea(parsed.focusArea as "" | FocusArea);
    setEditNote(parsed.note);
    setEditReviewDate(activity.activityDate);
  }

  /** Saves the edited activity. */
  async function handleSaveEdit() {
    if (!editingActivity) return;
    try {
      setError(null);
      const computedRating = Math.round((
        levelScore(editLearningLevel) + levelScore(editBehaviorLevel) + levelScore(editCommunicationLevel)
      ) / 3);

      const descriptionParts = [
        `Learning: ${editLearningLevel}`,
        `Behavior: ${editBehaviorLevel}`,
        `Communication: ${editCommunicationLevel}`,
      ];
      if (editFocusArea) {
        descriptionParts.push(`Focus Area: ${editFocusArea}`);
      }
      if (editNote.trim()) {
        descriptionParts.push(`Note: ${editNote.trim()}`);
      }

      const updated = await updateKidsActivity(editingActivity.id, {
        childName: editChildName.trim(),
        activityType: "study",
        description: descriptionParts.join(" | "),
        activityDate: editReviewDate,
        rating: computedRating,
      });
      dispatch(replaceKidsActivity(updated));
      rememberChildName(editChildName);
      setEditingActivity(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update activity.");
    }
  }

  /** Deletes a kids activity. */
  async function handleDeleteActivity(id: string) {
    try {
      setError(null);
      await deleteKidsActivity(id);
      dispatch(removeKidsActivity(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete activity.");
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Kids Growth Tracker"
        description="Track study, behavior, physical activity, and creativity with short notes that help patterns emerge."
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2.5}>
                <Autocomplete
                  freeSolo
                  options={childNameOptions}
                  value={childName}
                  onChange={(_, value) => setChildName((value ?? "") as string)}
                  onInputChange={(_, value) => setChildName(value)}
                  renderInput={(params) => <TextField {...params} label="Child name" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select label="Learning" value={learningLevel} onChange={(event) => setLearningLevel(event.target.value as PerformanceLevel)} fullWidth>
                  {performanceLevels.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select label="Behavior" value={behaviorLevel} onChange={(event) => setBehaviorLevel(event.target.value as PerformanceLevel)} fullWidth>
                  {performanceLevels.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select label="Communication" value={communicationLevel} onChange={(event) => setCommunicationLevel(event.target.value as PerformanceLevel)} fullWidth>
                  {performanceLevels.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField type="date" label="Review Date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField
                  select
                  label="Focus Area (Optional)"
                  value={focusArea}
                  onChange={(event) => setFocusArea(event.target.value as "" | FocusArea)}
                  fullWidth
                >
                  <MenuItem value="">None</MenuItem>
                  {focusAreaOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField
                  label="Note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Button fullWidth sx={{ height: "100%" }} variant="contained" onClick={handleAddActivity}>
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
          {activities.map((activity) => (
            <Box key={activity.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1}>
                    {(() => {
                      const parsed = parseAssessment(activity.description ?? "");
                      return (
                        <>
                    <Stack direction="row" alignItems="center">
                      <Typography variant="h6" sx={{ flex: 1 }}>{activity.childName}</Typography>
                      <IconButton size="small" onClick={() => openEdit(activity)} aria-label="Edit activity">
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => void handleDeleteActivity(activity.id)} aria-label="Delete activity" sx={{ color: "error.main" }}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography color="text.secondary">
                      Review Date: {activity.activityDate} - score {activity.rating}/5
                    </Typography>
                    <Typography>Learning: {parsed.learning}</Typography>
                    <Typography>Behavior: {parsed.behavior}</Typography>
                    <Typography>Communication: {parsed.communication}</Typography>
                    {parsed.focusArea ? <Typography>Focus Area: {parsed.focusArea}</Typography> : null}
                    {parsed.note ? <Typography>Note: {parsed.note}</Typography> : null}
                        </>
                      );
                    })()}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Weekly Improvement Trend</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="score" fill="#43A047" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editingActivity)} onClose={() => setEditingActivity(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Activity</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Autocomplete
              freeSolo
              options={childNameOptions}
              value={editChildName}
              onChange={(_, value) => setEditChildName((value ?? "") as string)}
              onInputChange={(_, value) => setEditChildName(value)}
              renderInput={(params) => <TextField {...params} label="Child name" fullWidth />}
            />
            <TextField select label="Learning" value={editLearningLevel} onChange={(e) => setEditLearningLevel(e.target.value as PerformanceLevel)} fullWidth>
              {performanceLevels.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField select label="Behavior" value={editBehaviorLevel} onChange={(e) => setEditBehaviorLevel(e.target.value as PerformanceLevel)} fullWidth>
              {performanceLevels.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField select label="Communication" value={editCommunicationLevel} onChange={(e) => setEditCommunicationLevel(e.target.value as PerformanceLevel)} fullWidth>
              {performanceLevels.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Focus Area (Optional)"
              value={editFocusArea}
              onChange={(e) => setEditFocusArea(e.target.value as "" | FocusArea)}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {focusAreaOptions.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField label="Note" value={editNote} onChange={(e) => setEditNote(e.target.value)} fullWidth />
            <TextField type="date" label="Review Date" value={editReviewDate} onChange={(e) => setEditReviewDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingActivity(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSaveEdit()}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}