"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Card, CardContent, Stack, Typography } from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import WeeklyReviewForm from "@/components/dashboard/WeeklyReviewForm";
import { useAuth } from "@/lib/auth-context";
import { createWeeklyReview } from "@/lib/persistence";
import { getLatestWeeklyReview } from "@/lib/score";
import { addWeeklyReview } from "@/store/slices/weeklyReviewSlice";
import { AppDispatch, RootState } from "@/store/store";

/**
 * Renders the weekly review workflow with score entry and visual analysis.
 */
export default function WeeklyReviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const reviews = useSelector((state: RootState) => state.weeklyReviews.reviews);
  const latestReview = getLatestWeeklyReview(reviews);
  const radarData = [
    { subject: "Career", score: latestReview?.careerScore ?? 0 },
    { subject: "Family", score: latestReview?.familyScore ?? 0 },
    { subject: "Finance", score: latestReview?.financeScore ?? 0 },
    { subject: "Peace", score: latestReview?.peaceScore ?? 0 },
  ];

  /**
   * Creates a persisted weekly review.
   */
  async function handleSubmit(payload: {
    weekStart: string;
    careerScore: number;
    familyScore: number;
    financeScore: number;
    peaceScore: number;
    notes: string;
  }) {
    if (!user) {
      return;
    }

    try {
      setError(null);
      const review = await createWeeklyReview(user.id, payload);
      dispatch(addWeeklyReview(review));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to save weekly review.");
    }
  }

  return (
    <Stack spacing={3} sx={{ py: 3 }}>
        <div>
          <Typography variant="h3">Weekly Review</Typography>
          <Typography color="text.secondary">
            Score the four areas from 1 to 10, calculate the average, and track the direction over time.
          </Typography>
        </div>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <WeeklyReviewForm onSubmit={handleSubmit} />
        <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="stretch">
          <Card sx={{ height: "100%", flex: 1, minWidth: 0 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Latest Review Radar
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 10]} />
                  <Tooltip />
                  <Radar
                    dataKey="score"
                    stroke="#43A047"
                    fill="#81C784"
                    fillOpacity={0.55}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card sx={{ height: "100%", flex: 1, minWidth: 0 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Score Trend
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={reviews.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekStart" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="lifeBalanceScore"
                    stroke="#1E88E5"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
  );
}
