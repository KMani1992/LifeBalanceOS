"use client";

import { Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import { PillarSummary } from "@/types";

interface PillarCardProps {
  pillar: PillarSummary;
}

/**
 * Renders a focused card for one life pillar with score and narrative context.
 */
export default function PillarCard({ pillar }: PillarCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ color: pillar.color, fontWeight: 800, letterSpacing: "0.1em" }}>
            {pillar.title}
          </Typography>
          <Typography variant="h4">{pillar.score}/10</Typography>
          <Typography variant="body2" color="text.secondary">
            {pillar.description}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={pillar.score * 10}
            sx={{
              height: 10,
              borderRadius: 999,
              bgcolor: "rgba(79,107,132,0.10)",
              "& .MuiLinearProgress-bar": { bgcolor: pillar.color },
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
