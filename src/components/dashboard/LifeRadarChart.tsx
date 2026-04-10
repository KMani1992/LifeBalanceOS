"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
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
}

/**
 * Renders the four-pillar radar chart used on the dashboard.
 */
export default function LifeRadarChart({ pillars }: LifeRadarChartProps) {
  const data = pillars.map((pillar) => ({ subject: pillar.title, score: pillar.score }));

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
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={data}>
              <PolarGrid stroke="rgba(79, 107, 132, 0.18)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#4F6B84", fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Tooltip />
              <Radar dataKey="score" stroke="#1E88E5" fill="#64B5F6" fillOpacity={0.45} />
            </RadarChart>
          </ResponsiveContainer>
        </Stack>
      </CardContent>
    </Card>
  );
}
