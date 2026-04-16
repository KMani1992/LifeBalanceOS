"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PageHeader from "@/components/common/PageHeader";
import { USER_GUIDE_SECTIONS } from "@/constants/userGuide";

/**
 * Renders a structured in-app user guide for daily, weekly, and monthly workflows.
 */
export default function UserGuidePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <PageHeader
          title="User Guide"
          description="A simple, friendly guide to run your daily, weekly, and monthly rhythm in Life Balance OS."
        />

        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                How To Use This Guide
              </Typography>
              <Typography color="text.secondary">
                Open each section, pick one action, and apply it today. Keep it simple and consistent.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={1.5}>
          {USER_GUIDE_SECTIONS.map((section) => (
            <Accordion key={section.id} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography sx={{ fontWeight: 700 }}>{section.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {section.points.map((point) => (
                    <Typography key={point} color="text.secondary">
                      - {point}
                    </Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
