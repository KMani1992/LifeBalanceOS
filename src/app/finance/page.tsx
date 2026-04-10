"use client";

import { useState } from "react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { createFinanceEntry, deleteFinanceEntry, updateFinanceEntry } from "@/lib/persistence";
import { addFinanceEntry, removeFinanceEntry, replaceFinanceEntry } from "@/store/slices/financeSlice";
import { AppDispatch, RootState } from "@/store/store";
import { FinanceEntryType } from "@/types";

const entryTypes: FinanceEntryType[] = ["income", "expense", "savings", "investment"];

/**
 * Calculates the savings rate from the current finance entries.
 */
function calculateSavingsRate(
  income: number,
  savings: number,
): number {
  if (income === 0) {
    return 0;
  }

  return Number(((savings / income) * 100).toFixed(1));
}

/**
 * Renders the finance tracker with entry capture and savings analysis.
 */
export default function FinancePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const entries = useSelector((state: RootState) => state.finance.entries);
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<FinanceEntryType>("income");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editingEntry, setEditingEntry] = useState<null | typeof entries[0]>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [editType, setEditType] = useState<FinanceEntryType>("income");
  const [editCategory, setEditCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editEntryDate, setEditEntryDate] = useState("");

  const totals = entries.reduce(
    (summary, entry) => {
      summary[entry.type] += entry.amount;
      return summary;
    },
    { income: 0, expense: 0, savings: 0, investment: 0 },
  );

  const savingsRate = calculateSavingsRate(totals.income, totals.savings + totals.investment);
  const chartData = entries
    .slice()
    .reverse()
    .map((entry) => ({
      label: `${entry.entryDate.slice(5)} ${entry.type}`,
      amount: entry.amount,
    }));

  /**
   * Adds a new finance entry after basic validation.
   */
  async function handleAddEntry() {
    if (!user || !category.trim() || amount <= 0) {
      return;
    }

    try {
      setError(null);
      const entry = await createFinanceEntry(user.id, {
        type,
        category: category.trim(),
        amount,
        notes: notes.trim(),
        entryDate,
      });
      dispatch(addFinanceEntry(entry));
      setCategory("");
      setNotes("");
      setAmount(0);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to create finance entry.");
    }
  }

  /**
   * Opens the edit dialog pre-filled with an existing entry's values.
   */
  function openEdit(entry: typeof entries[0]) {
    setEditingEntry(entry);
    setEditAmount(entry.amount);
    setEditType(entry.type);
    setEditCategory(entry.category);
    setEditNotes(entry.notes ?? "");
    setEditEntryDate(entry.entryDate);
  }

  /** Saves the edited finance entry. */
  async function handleSaveEdit() {
    if (!editingEntry) return;
    try {
      setError(null);
      const updated = await updateFinanceEntry(editingEntry.id, {
        type: editType,
        category: editCategory.trim(),
        amount: editAmount,
        notes: editNotes.trim(),
        entryDate: editEntryDate,
      });
      dispatch(replaceFinanceEntry(updated));
      setEditingEntry(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update entry.");
    }
  }

  /**
   * Deletes a finance entry from Supabase and Redux.
   */
  async function handleDeleteEntry(id: string) {
    try {
      setError(null);
      await deleteFinanceEntry(id);
      dispatch(removeFinanceEntry(id));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to delete finance entry.");
    }
  }

  return (
    <>
      <Stack spacing={3}>
      <div>
        <Typography variant="h3">Finance Tracker</Typography>
          <Typography color="text.secondary">
            Track income, expenses, savings, and investments, then monitor the monthly savings rate.
          </Typography>
        </div>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={2}>
                    <TextField type="number" label="Amount" value={amount} onChange={(event) => setAmount(Number(event.target.value))} fullWidth />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField select label="Type" value={type} onChange={(event) => setType(event.target.value as FinanceEntryType)} fullWidth>
                      {entryTypes.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField label="Category" value={category} onChange={(event) => setCategory(event.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField type="date" label="Date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={handleAddEntry}>
                      Add Entry
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h5">Monthly Snapshot</Typography>
                  <Typography>Income: ₹{totals.income.toFixed(2)}</Typography>
                  <Typography>Expense: ₹{totals.expense.toFixed(2)}</Typography>
                  <Typography>Savings: ₹{totals.savings.toFixed(2)}</Typography>
                  <Typography>Investment: ₹{totals.investment.toFixed(2)}</Typography>
                  <Typography variant="h6">Savings Rate: {savingsRate}%</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Finance Trends
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#FB8C00" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h5">Recent Entries</Typography>
                  {entries.slice(0, 6).map((entry) => (
                    <Stack key={entry.id} direction="row" justifyContent="space-between" alignItems="center">
                      <div>
                        <Typography>{entry.category}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {entry.type} - {entry.entryDate}
                        </Typography>
                      </div>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>₹{entry.amount.toFixed(2)}</Typography>
                        <IconButton onClick={() => openEdit(entry)} aria-label={`Edit finance entry ${entry.category}`} size="small">
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => void handleDeleteEntry(entry.id)} aria-label={`Delete finance entry ${entry.category}`}>
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editingEntry)} onClose={() => setEditingEntry(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Finance Entry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField type="number" label="Amount (₹)" value={editAmount} onChange={(e) => setEditAmount(Number(e.target.value))} fullWidth />
            <TextField select label="Type" value={editType} onChange={(e) => setEditType(e.target.value as FinanceEntryType)} fullWidth>
              {entryTypes.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField label="Category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} fullWidth />
            <TextField label="Notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} fullWidth />
            <TextField type="date" label="Date" value={editEntryDate} onChange={(e) => setEditEntryDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingEntry(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSaveEdit()}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}