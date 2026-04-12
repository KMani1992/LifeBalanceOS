"use client";

import { Box, Card, CardContent, Chip, CircularProgress, Stack, Typography } from "@mui/material";

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
  const percent = Math.max(0, Math.min(100, Math.round((score / 10) * 100)));

  return (
    <Card sx={{ height: "100%", background: "linear-gradient(180deg, #ffffff, #ebf5ff)" }}>
      <CardContent>
        <Stack spacing={2}>
          <Chip label="Life Balance Score" color="primary" sx={{ width: "fit-content" }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress variant="determinate" value={100} size={94} sx={{ color: "rgba(30,136,229,0.18)" }} />
              <CircularProgress
                variant="determinate"
                value={percent}
                size={94}
                sx={{ position: "absolute", left: 0, top: 0 }}
              />
              <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{score.toFixed(1)}</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Overall weekly balance across all four pillars.
            </Typography>
          </Box>
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