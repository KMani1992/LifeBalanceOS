"use client";

import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";

const sections = [
  {
    title: "Daily Routine",
    points: [
      "Morning / காலை: Plan 3 meaningful tasks.",
      "Night / இரவு: Write one short reflection.",
    ],
  },
  {
    title: "Life Pillars",
    points: ["Career", "Family", "Finance", "Peace"],
  },
  {
    title: "Career Growth",
    points: ["React -> AI -> Architecture -> Leadership"],
  },
  {
    title: "Finance",
    points: ["Earn > Spend", "Save", "Invest", "Avoid Debt"],
  },
  {
    title: "Family",
    points: ["Spend time intentionally", "Maintain patience and kind communication"],
  },
  {
    title: "Reflection",
    points: [
      "What went well?",
      "What did I learn?",
      "What will I improve tomorrow?",
    ],
  },
];

/**
 * Renders structured bilingual guidance for low-effort daily use.
 */
export default function KnowledgeBasePage() {
  const cardShiftSx = { ml: "-4px", mr: "-4px" };

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <div>
        <Typography variant="h3">LifeBalanceOS Guide (Tamil + English)</Typography>
        <Typography color="text.secondary">
          A quick, practical playbook to run your day in under two minutes.
        </Typography>
      </div>

      <Box sx={cardShiftSx}>
        <Grid container spacing={2}>
          {sections.map((section) => (
            <Grid item xs={12} md={6} key={section.title}>
              <Card sx={{ height: "100%", width: "100%" }}>
                <CardContent>
                  <Stack spacing={1.25}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {section.title}
                    </Typography>
                    {section.points.map((point) => (
                      <Typography key={point} color="text.secondary" sx={{ lineHeight: 1.65 }}>
                        - {point}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
}
