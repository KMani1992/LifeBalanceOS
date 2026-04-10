
import { configureStore } from "@reduxjs/toolkit";
import dailyReducer from "@/store/slices/dailySlice";
import financeReducer from "@/store/slices/financeSlice";
import goalsReducer from "@/store/slices/goalsSlice";
import habitsReducer from "@/store/slices/habitSlice";
import kidsReducer from "@/store/slices/kidsSlice";
import reflectionReducer from "@/store/slices/reflectionSlice";
import weeklyReviewReducer from "@/store/slices/weeklyReviewSlice";

export const store = configureStore({
  reducer: {
    daily: dailyReducer,
    weeklyReviews: weeklyReviewReducer,
    goals: goalsReducer,
    finance: financeReducer,
    kids: kidsReducer,
    habits: habitsReducer,
    reflections: reflectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
