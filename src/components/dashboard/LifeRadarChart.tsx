"use client";

import { Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import Link from "next/link";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PillarSummary } from "@/types";

interface LifeRadarChartProps {
  pillars: PillarSummary[];
  isHydrating?: boolean;
}

/**
 * Renders the four-pillar radar chart used on the dashboard.
 * Shows a loading state during hydration and a placeholder if no data is available.
 */
export default function LifeRadarChart({ pillars, isHydrating = false }: LifeRadarChartProps) {
  const data = pillars.map((pillar) => ({ subject: pillar.title, score: pillar.score }));
  
  // Check if any data exists (at least one pillar with a score > 0)
  const hasData = data.some((d) => d.score > 0);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={2}>
          <div>
            <Typography variant="h5">Life Balance Radar</Typography>
            <Typography variant="body2" color="text.secondary">
              Compare the four pillars quickly and see where the week is drifting.
            </Typography>
          </div>
          
          {isHydrating ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
              <CircularProgress />
            </Box>
          ) : !hasData ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320, bgcolor: "rgba(30, 136, 229, 0.05)", borderRadius: 1 }}>
              <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Complete your first weekly review to see your life balance radar
                </Typography>
                <Button component={Link} href="/weekly-review" variant="contained" size="small">
                  Create Weekly Review
                </Button>
              </Stack>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={data}>
                <PolarGrid stroke="rgba(79, 107, 132, 0.18)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#4F6B84", fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                <Tooltip />
                <Radar dataKey="score" stroke="#1E88E5" fill="#64B5F6" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
