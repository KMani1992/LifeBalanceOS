"use client";

import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

interface LifeScoreCardProps {
  score: number;
  note: string;
}

/**
 * Presents the overall life balance score in a prominent summary card.
 */
export default function LifeScoreCard({
  score,
  note,
}: LifeScoreCardProps) {
  return (
    <Card sx={{ height: "100%", background: "linear-gradient(180deg, #ffffff, #ebf5ff)" }}>
      <CardContent>
        <Stack spacing={2}>
          <Chip label="Life Balance Score" color="primary" sx={{ width: "fit-content" }} />
          <Typography variant="h2">{score.toFixed(1)}</Typography>
          <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
            {(score >= 7 ? "Steady" : score >= 5 ? "Recovering" : "Needs attention")} rhythm across the four pillars
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {note}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}