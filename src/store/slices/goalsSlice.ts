
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Goal, GoalCategory } from "@/types";

interface GoalsState {
  goals: Goal[];
}

const initialState: GoalsState = {
  goals: [],
};

const goalsSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {
    setGoals: (state, action: PayloadAction<Goal[]>) => {
      state.goals = action.payload;
    },
    addGoal: (
      state,
      action: PayloadAction<Goal | { title: string; description: string; category: GoalCategory; targetDate: string | null }>,
    ) => {
      if ("id" in action.payload) {
        state.goals.unshift(action.payload);
        return;
      }

      state.goals.unshift({
        id: `goal-${Date.now()}`,
        title: action.payload.title,
        description: action.payload.description,
        category: action.payload.category,
        targetDate: action.payload.targetDate,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      });
    },
    replaceGoal: (state, action: PayloadAction<Goal>) => {
      state.goals = state.goals.map((item) =>
        item.id === action.payload.id ? action.payload : item,
      );
    },
    removeGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setGoals, addGoal, replaceGoal, removeGoal } = goalsSlice.actions;
export default goalsSlice.reducer;
