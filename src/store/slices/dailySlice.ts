
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DailyTask, DailyTaskCategory, WeekTag } from "@/types";

interface DailyState {
  tasks: DailyTask[];
}

const initialState: DailyState = {
  tasks: [],
};

const dailySlice = createSlice({
  name: "daily",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<DailyTask[]>) => {
      state.tasks = action.payload;
    },
    addTask: (
      state,
      action: PayloadAction<DailyTask | { title: string; category: DailyTaskCategory; goalId?: string | null; weekTag?: WeekTag | null; taskDate?: string | null }>,
    ) => {
      if ("id" in action.payload) {
        state.tasks.unshift(action.payload);
        return;
      }

      state.tasks.unshift({
        id: `task-${Date.now()}`,
        title: action.payload.title,
        category: action.payload.category,
        completed: false,
        taskDate: action.payload.taskDate ?? new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        completedAt: null,
        goalId: action.payload.goalId ?? null,
        weekTag: action.payload.weekTag ?? null,
      });
    },
    replaceTask: (state, action: PayloadAction<DailyTask>) => {
      state.tasks = state.tasks.map((item) =>
        item.id === action.payload.id ? action.payload : item,
      );
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setTasks, addTask, replaceTask, removeTask } = dailySlice.actions;
export default dailySlice.reducer;
