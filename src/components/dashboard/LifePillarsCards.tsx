"use client";

import { Grid } from "@mui/material";
import PillarCard from "@/components/dashboard/PillarCard";
import { PillarSummary } from "@/types";

interface LifePillarsCardsProps {
  pillars: PillarSummary[];
}

/**
 * Renders the four pillar summaries with a quick visual progress indicator.
 */
export default function LifePillarsCards({
  pillars,
}: LifePillarsCardsProps) {
  return (
    <Grid container spacing={2}>
      {pillars.map((pillar) => (
        <Grid item xs={12} sm={6} lg={3} key={pillar.key}>
          <PillarCard pillar={pillar} />
        </Grid>
      ))}
    </Grid>
  );
}