
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Habit, HabitCategory } from "@/types";

interface HabitsState {
  habits: Habit[];
}

const initialState: HabitsState = {
  habits: [],
};

const habitsSlice = createSlice({
  name: "habits",
  initialState,
  reducers: {
    setHabits: (state, action: PayloadAction<Habit[]>) => {
      state.habits = action.payload;
    },
    addHabit: (
      state,
      action: PayloadAction<Habit | { title: string; category: HabitCategory; targetFrequency: number }>,
    ) => {
      if ("id" in action.payload) {
        state.habits.unshift(action.payload);
        return;
      }

      state.habits.unshift({
        id: `habit-${Date.now()}`,
        title: action.payload.title,
        category: action.payload.category,
        targetFrequency: action.payload.targetFrequency,
        streak: 0,
        completedToday: false,
        createdAt: new Date().toISOString(),
      });
    },
    replaceHabit: (state, action: PayloadAction<Habit>) => {
      state.habits = state.habits.map((item) =>
        item.id === action.payload.id ? action.payload : item,
      );
    },
    removeHabit: (state, action: PayloadAction<string>) => {
      state.habits = state.habits.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setHabits, addHabit, replaceHabit, removeHabit } = habitsSlice.actions;
export default habitsSlice.reducer;
