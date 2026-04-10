"use client";

import { useState } from "react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
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
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DailyTask, DailyTaskCategory } from "@/types";

interface DailyChecklistProps {
  title: string;
  tasks: DailyTask[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string, category: DailyTaskCategory) => void;
  onEdit: (id: string, title: string, category: DailyTaskCategory) => void;
}

const categories: DailyTaskCategory[] = [
  "career",
  "health",
  "family",
  "kids",
  "finance",
  "personal",
];

/**
 * Provides a checklist view for daily tasks with add, toggle, and delete actions.
 */
export default function DailyChecklist({
  title,
  tasks,
  onToggle,
  onDelete,
  onAdd,
  onEdit,
}: DailyChecklistProps) {
  const [open, setOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftCategory, setDraftCategory] = useState<DailyTaskCategory>("career");
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<DailyTaskCategory>("career");

  /**
   * Submits a new task only when a title is provided.
   */
  function handleSubmit() {
    if (!draftTitle.trim()) {
      return;
    }

    onAdd(draftTitle.trim(), draftCategory);
    setDraftTitle("");
    setDraftCategory("career");
    setOpen(false);
  }

  /**
   * Opens the edit dialog and pre-fills the selected task values.
   */
  function openEdit(task: DailyTask) {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditCategory(task.category);
  }

  /**
   * Persists edits when a non-empty title is provided.
   */
  function handleSaveEdit() {
    if (!editingTask || !editTitle.trim()) {
      return;
    }

    onEdit(editingTask.id, editTitle.trim(), editCategory);
    setEditingTask(null);
  }

  return (
    <>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <div>
              <Typography variant="h5">{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Keep the day finite and visible.
              </Typography>
            </div>
            <Button
              startIcon={<AddRoundedIcon />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Add Task
            </Button>
          </Stack>
          <List disablePadding>
            {tasks.map((task) => (
              <ListItem key={task.id} divider sx={{ pr: 7 }}>
                <Checkbox
                  edge="start"
                  checked={task.completed}
                  onChange={() => onToggle(task.id)}
                  inputProps={{ "aria-label": `Toggle task ${task.title}` }}
                />
                <ListItemText
                  primary={task.title}
                  secondary={`${task.category} • ${task.createdAt}`}
                  primaryTypographyProps={{
                    sx: {
                      textDecoration: task.completed ? "line-through" : "none",
                    },
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label={`Edit task ${task.title}`}
                    onClick={() => openEdit(task)}
                  >
                    <EditRoundedIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label={`Delete task ${task.title}`}
                    onClick={() => onDelete(task.id)}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          {tasks.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No tasks yet. Add the few actions that actually move today forward.
            </Typography>
          ) : null}
        </CardContent>
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Daily Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Task title"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={draftCategory}
              onChange={(event) =>
                setDraftCategory(event.target.value as DailyTaskCategory)
              }
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(editingTask)} onClose={() => setEditingTask(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Daily Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Task title"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={editCategory}
              onChange={(event) => setEditCategory(event.target.value as DailyTaskCategory)}
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingTask(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}