"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { calculateLifeBalanceScore } from "@/lib/score";

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
  const [weekStart, setWeekStart] = useState("2026-04-07");
  const [careerScore, setCareerScore] = useState(8);
  const [familyScore, setFamilyScore] = useState(8);
  const [financeScore, setFinanceScore] = useState(7);
  const [peaceScore, setPeaceScore] = useState(7);
  const [notes, setNotes] = useState("");

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
    <Card>
      <CardContent sx={{ px: { xs: 1.5, md: 2.5 }, py: 3 }}>
        <Stack spacing={3}>
          <div>
            <Typography variant="h5">Weekly Review</Typography>
            <Typography variant="body2" color="text.secondary">
              Score the week honestly and keep notes for next-week adjustments.
            </Typography>
          </div>
          <Grid container spacing={2} sx={{ px: { xs: 0.5, md: 1 } }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Week start"
                type="date"
                value={weekStart}
                onChange={(event) => setWeekStart(event.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {[
              { label: "Career", value: careerScore, setter: setCareerScore },
              { label: "Family", value: familyScore, setter: setFamilyScore },
              { label: "Finance", value: financeScore, setter: setFinanceScore },
              { label: "Personal Peace", value: peaceScore, setter: setPeaceScore },
            ].map((field) => (
              <Grid item xs={12} sm={6} key={field.label}>
                <TextField
                  select
                  label={field.label}
                  value={field.value}
                  onChange={(event) => field.setter(Number(event.target.value))}
                  fullWidth
                >
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12}>
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
            <Typography variant="h4">Life Balance Score: {score}</Typography>
            <Button variant="contained" onClick={handleSubmit}>
              Save Review
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
