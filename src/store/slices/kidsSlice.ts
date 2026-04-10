
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { KidsActivity, KidsActivityType } from "@/types";

interface KidsState {
  activities: KidsActivity[];
}

const initialState: KidsState = {
  activities: [],
};

const kidsSlice = createSlice({
  name: "kids",
  initialState,
  reducers: {
    setKidsActivities: (state, action: PayloadAction<KidsActivity[]>) => {
      state.activities = action.payload;
    },
    addKidsActivity: (
      state,
      action: PayloadAction<KidsActivity | { childName: string; activityType: KidsActivityType; description: string; activityDate: string; rating: number }>,
    ) => {
      if ("id" in action.payload) {
        state.activities.unshift(action.payload);
        return;
      }

      state.activities.unshift({
        id: `kids-${Date.now()}`,
        childName: action.payload.childName,
        activityType: action.payload.activityType,
        description: action.payload.description,
        activityDate: action.payload.activityDate,
        rating: action.payload.rating,
        createdAt: new Date().toISOString(),
      });
    },
    replaceKidsActivity: (state, action: PayloadAction<KidsActivity>) => {
      state.activities = state.activities.map((item) =>
        item.id === action.payload.id ? action.payload : item,
      );
    },
    removeKidsActivity: (state, action: PayloadAction<string>) => {
      state.activities = state.activities.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setKidsActivities, addKidsActivity, replaceKidsActivity, removeKidsActivity } = kidsSlice.actions;
export default kidsSlice.reducer;
