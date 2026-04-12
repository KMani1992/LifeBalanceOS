"use client";

import { useEffect, useState } from "react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GrassRoundedIcon from "@mui/icons-material/GrassRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "@/lib/auth-context";
import {
  createGardenTask,
  deleteGardenTask,
  listGardenTasks,
  updateGardenTask,
  updateGardenTaskCompletion,
} from "@/lib/persistence";
import { GardenTask } from "@/types";

/**
 * Renders the garden task checklist as a lightweight maintenance tracker.
 */
export default function GardenPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<GardenTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editingTask, setEditingTask] = useState<GardenTask | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  useEffect(() => {
    /**
     * Loads the persisted garden tasks for the signed-in user.
     */
    async function loadTasks() {
      try {
        setError(null);
        const gardenTasks = await listGardenTasks();
        setTasks(gardenTasks);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load garden tasks.");
      }
    }

    if (user) {
      void loadTasks();
    }
  }, [user]);

  /**
   * Adds a new garden task to Supabase.
   */
  async function handleAddTask() {
    if (!user || !taskName.trim()) {
      return;
    }

    try {
      setError(null);
      const task = await createGardenTask(user.id, {
        taskName: taskName.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
      });
      setTasks((current) => [task, ...current]);
      setTaskName("");
      setDescription("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to add garden task.");
    }
  }

  /**
   * Toggles a garden task completion state.
   */
  async function handleToggleTask(task: GardenTask) {
    try {
      setError(null);
      const updatedTask = await updateGardenTaskCompletion(task.id, !task.completed);
      setTasks((current) => current.map((item) => (item.id === updatedTask.id ? updatedTask : item)));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to update garden task.");
    }
  }

  /**
   * Deletes a garden task.
   */
  async function handleDeleteTask(id: string) {
    try {
      setError(null);
      await deleteGardenTask(id);
      setTasks((current) => current.filter((item) => item.id !== id));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to delete garden task.");
    }
  }

  /**
   * Opens the edit dialog with the current task values.
   */
  function openEditTask(task: GardenTask) {
    setEditingTask(task);
    setEditTaskName(task.taskName);
    setEditDescription(task.description ?? "");
    setEditDueDate(task.dueDate ?? "");
  }

  /**
   * Saves the edited garden task.
   */
  async function handleSaveTaskEdit() {
    if (!editingTask || !editTaskName.trim()) {
      return;
    }

    try {
      setError(null);
      const updatedTask = await updateGardenTask(editingTask.id, {
        taskName: editTaskName.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate || null,
      });
      setTasks((current) => current.map((item) => (item.id === updatedTask.id ? updatedTask : item)));
      setEditingTask(null);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to update garden task.");
    }
  }

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h3">Garden Tasks</Typography>
        <Typography color="text.secondary">
          Keep recurring garden maintenance small, visible, and easy to complete.
        </Typography>
      </div>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <TextField label="Task" value={taskName} onChange={(event) => setTaskName(event.target.value)} fullWidth />
            <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} fullWidth />
            <TextField
              type="date"
              label="Due date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: { xs: "100%", md: "auto" }, minWidth: { md: 160 } }}
            />
            <Button
              variant="contained"
              onClick={handleAddTask}
              sx={{ width: { xs: "100%", md: "auto" }, minWidth: { md: 120 }, whiteSpace: "nowrap" }}
            >
              Add Task
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          {tasks.length === 0 ? (
            <Box
              sx={{
                py: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                color: "text.secondary",
              }}
            >
              <GrassRoundedIcon sx={{ fontSize: 48, opacity: 0.35 }} />
              <Typography variant="h6" color="text.secondary">
                All done — garden is clear!
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Add a task above to track your next garden maintenance.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {tasks.map((task) => (
                <ListItem key={task.id} divider sx={{ alignItems: "flex-start", px: 0 }}>
                  <Checkbox checked={task.completed} onChange={() => void handleToggleTask(task)} />
                  <ListItemText
                    primary={task.taskName}
                    secondary={`${task.description || "No description"} — due ${task.dueDate ?? "not set"}`}
                    primaryTypographyProps={{
                      sx: { textDecoration: task.completed ? "line-through" : "none", fontWeight: 600 },
                    }}
                    sx={{ minWidth: 0, my: 0 }}
                  />
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, mt: 0.25 }}>
                    <IconButton onClick={() => openEditTask(task)} aria-label={`Edit garden task ${task.taskName}`} size="small">
                      <EditRoundedIcon />
                    </IconButton>
                    <IconButton onClick={() => void handleDeleteTask(task.id)} aria-label={`Delete garden task ${task.taskName}`} size="small">
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingTask)} onClose={() => setEditingTask(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Garden Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Task" value={editTaskName} onChange={(event) => setEditTaskName(event.target.value)} fullWidth />
            <TextField label="Description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} fullWidth />
            <TextField
              type="date"
              label="Due date"
              value={editDueDate}
              onChange={(event) => setEditDueDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingTask(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSaveTaskEdit()}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}