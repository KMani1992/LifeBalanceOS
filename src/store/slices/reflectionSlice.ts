
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Reflection } from "@/types";

interface ReflectionsState {
  reflections: Reflection[];
}

const initialState: ReflectionsState = {
  reflections: [],
};

const reflectionSlice = createSlice({
  name: "reflections",
  initialState,
  reducers: {
    setReflections: (state, action: PayloadAction<Reflection[]>) => {
      state.reflections = action.payload;
    },
    addReflection: (
      state,
      action: PayloadAction<Reflection | { reflectionDate: string; wentWell: string; learnedToday: string; improveTomorrow: string; mood: number }>,
    ) => {
      if ("id" in action.payload) {
        state.reflections.unshift(action.payload);
        return;
      }

      state.reflections.unshift({
        id: `reflection-${Date.now()}`,
        reflectionDate: action.payload.reflectionDate,
        wentWell: action.payload.wentWell,
        learnedToday: action.payload.learnedToday,
        improveTomorrow: action.payload.improveTomorrow,
        mood: action.payload.mood,
        createdAt: new Date().toISOString(),
      });
    },
    replaceReflection: (state, action: PayloadAction<Reflection>) => {
      state.reflections = state.reflections.map((item) =>
        item.id === action.payload.id ? action.payload : item,
      );
    },
    removeReflection: (state, action: PayloadAction<string>) => {
      state.reflections = state.reflections.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setReflections, addReflection, replaceReflection, removeReflection } = reflectionSlice.actions;
export default reflectionSlice.reducer;
