"use client";

import { PropsWithChildren } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";

interface PageHeaderProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  description: string;
}

/**
 * Renders a reusable page header with optional contextual actions.
 */
export default function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", lg: "flex-end" }}
    >
      <Stack spacing={1.25} maxWidth={760}>
        {eyebrow ? <Chip label={eyebrow} color="secondary" sx={{ width: "fit-content" }} /> : null}
        <Typography variant="h2">{title}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
          {description}
        </Typography>
      </Stack>
      {children ? <Box sx={{ width: { xs: "100%", lg: "auto" } }}>{children}</Box> : null}
    </Stack>
  );
}
