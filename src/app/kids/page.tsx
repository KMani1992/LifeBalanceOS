"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
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
import { useAuth } from "@/lib/auth-context";
import { createKidsActivity, updateKidsActivity, deleteKidsActivity } from "@/lib/persistence";
import { addKidsActivity, replaceKidsActivity, removeKidsActivity } from "@/store/slices/kidsSlice";
import { AppDispatch, RootState } from "@/store/store";
import { KidsActivityType } from "@/types";

const activityTypes: KidsActivityType[] = ["study", "behavior", "physical", "creativity"];

/**
 * Renders the kids development tracker for study, behavior, physical activity, and creativity.
 */
export default function KidsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const activities = useSelector((state: RootState) => state.kids.activities);
  const [childName, setChildName] = useState("");
  const [activityType, setActivityType] = useState<KidsActivityType>("study");
  const [description, setDescription] = useState("");
  const [activityDate, setActivityDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState(4);
  const [editingActivity, setEditingActivity] = useState<null | typeof activities[0]>(null);
  const [editChildName, setEditChildName] = useState("");
  const [editActivityType, setEditActivityType] = useState<KidsActivityType>("study");
  const [editDescription, setEditDescription] = useState("");
  const [editActivityDate, setEditActivityDate] = useState("");
  const [editRating, setEditRating] = useState(4);

  /**
   * Adds a new kids activity record.
   */
  async function handleAddActivity() {
    if (!user || !childName.trim() || !description.trim()) {
      return;
    }

    try {
      setError(null);
      const activity = await createKidsActivity(user.id, {
        childName: childName.trim(),
        activityType,
        description: description.trim(),
        activityDate,
        rating,
      });
      dispatch(addKidsActivity(activity));
      setDescription("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to add kids activity.");
    }
  }

  /** Opens edit dialog pre-filled. */
  function openEdit(activity: typeof activities[0]) {
    setEditingActivity(activity);
    setEditChildName(activity.childName);
    setEditActivityType(activity.activityType);
    setEditDescription(activity.description ?? "");
    setEditActivityDate(activity.activityDate);
    setEditRating(activity.rating);
  }

  /** Saves the edited activity. */
  async function handleSaveEdit() {
    if (!editingActivity) return;
    try {
      setError(null);
      const updated = await updateKidsActivity(editingActivity.id, {
        childName: editChildName.trim(),
        activityType: editActivityType,
        description: editDescription.trim(),
        activityDate: editActivityDate,
        rating: editRating,
      });
      dispatch(replaceKidsActivity(updated));
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
      <div>
        <Typography variant="h3">Kids Growth Tracker</Typography>
          <Typography color="text.secondary">
            Track study, behavior, physical activity, and creativity with short notes that help patterns emerge.
          </Typography>
        </div>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="Child name" value={childName} onChange={(event) => setChildName(event.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select label="Activity type" value={activityType} onChange={(event) => setActivityType(event.target.value as KidsActivityType)} fullWidth>
                  {activityTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField type="date" label="Activity date" value={activityDate} onChange={(event) => setActivityDate(event.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={1}>
                <TextField type="number" label="Rating" value={rating} onChange={(event) => setRating(Math.min(5, Math.max(1, Number(event.target.value))))} fullWidth />
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
                      {activity.activityType} - {activity.activityDate} - rating {activity.rating}/5
                    </Typography>
                    <Typography>{activity.description}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editingActivity)} onClose={() => setEditingActivity(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Activity</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Child name" value={editChildName} onChange={(e) => setEditChildName(e.target.value)} fullWidth />
            <TextField select label="Activity type" value={editActivityType} onChange={(e) => setEditActivityType(e.target.value as KidsActivityType)} fullWidth>
              {activityTypes.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} fullWidth />
            <TextField type="date" label="Activity date" value={editActivityDate} onChange={(e) => setEditActivityDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField type="number" label="Rating (1-5)" value={editRating} onChange={(e) => setEditRating(Math.min(5, Math.max(1, Number(e.target.value))))} sx={{ maxWidth: 220 }} />
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