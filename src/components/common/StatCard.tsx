"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  value: string;
  support: string;
  accent: string;
}

/**
 * Renders a compact KPI card used throughout the application shell.
 */
export default function StatCard({ label, value, support, accent }: StatCardProps) {
  return (
    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
      <CardContent>
        <Stack spacing={1.25}>
          <Typography variant="overline" sx={{ color: accent, fontWeight: 800, letterSpacing: "0.08em" }}>
            {label}
          </Typography>
          <Typography variant="h3">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {support}
          </Typography>
        </Stack>
        <Typography
          aria-hidden
          sx={{
            position: "absolute",
            right: -12,
            bottom: -12,
            fontSize: "5rem",
            fontWeight: 800,
            lineHeight: 1,
            color: `${accent}18`,
            userSelect: "none",
          }}
        >
          •
        </Typography>
      </CardContent>
    </Card>
  );
}
