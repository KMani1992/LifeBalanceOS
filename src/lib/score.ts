
import { WeeklyReview } from "@/types";

/**
 * Calculates the aggregate life balance score from the four pillar scores.
 */
export function calculateLifeBalanceScore(
  careerScore: number,
  familyScore: number,
  financeScore: number,
  peaceScore: number,
): number {
  return Number(
    ((careerScore + familyScore + financeScore + peaceScore) / 4).toFixed(1),
  );
}

/**
 * Returns the most recent review or undefined when no review exists.
 */
export function getLatestWeeklyReview(
  reviews: WeeklyReview[],
): WeeklyReview | undefined {
  return [...reviews].sort((left, right) =>
    right.weekStart.localeCompare(left.weekStart),
  )[0];
}
