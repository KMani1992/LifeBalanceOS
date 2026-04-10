
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { calculateLifeBalanceScore } from "@/lib/score";
import { WeeklyReview } from "@/types";

interface WeeklyReviewState {
  reviews: WeeklyReview[];
}

type NewReview = Omit<WeeklyReview, "id" | "lifeBalanceScore" | "createdAt">;

const initialState: WeeklyReviewState = {
  reviews: [],
};

const weeklyReviewSlice = createSlice({
  name: "weeklyReviews",
  initialState,
  reducers: {
    setWeeklyReviews: (state, action: PayloadAction<WeeklyReview[]>) => {
      state.reviews = action.payload;
    },
    addWeeklyReview: (state, action: PayloadAction<NewReview | WeeklyReview>) => {
      if ("id" in action.payload) {
        state.reviews.unshift(action.payload);
        return;
      }

      const review = action.payload;
      state.reviews.unshift({
        ...review,
        id: `review-${Date.now()}`,
        lifeBalanceScore: calculateLifeBalanceScore(
          review.careerScore,
          review.familyScore,
          review.financeScore,
          review.peaceScore,
        ),
        createdAt: new Date().toISOString(),
      });
    },
  },
});

export const { setWeeklyReviews, addWeeklyReview } = weeklyReviewSlice.actions;
export default weeklyReviewSlice.reducer;
