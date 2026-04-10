
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FinanceEntry, FinanceEntryType } from "@/types";

interface FinanceState {
  entries: FinanceEntry[];
}

const initialState: FinanceState = {
  entries: [],
};

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    setFinanceEntries: (state, action: PayloadAction<FinanceEntry[]>) => {
      state.entries = action.payload;
    },
    addFinanceEntry: (
      state,
      action: PayloadAction<FinanceEntry | { amount: number; type: FinanceEntryType; category: string; notes: string; entryDate: string }>,
    ) => {
      if ("id" in action.payload) {
        state.entries.unshift(action.payload);
        return;
      }

      state.entries.unshift({
        id: `finance-${Date.now()}`,
        type: action.payload.type,
        category: action.payload.category,
        amount: action.payload.amount,
        notes: action.payload.notes,
        entryDate: action.payload.entryDate,
        createdAt: new Date().toISOString(),
      });
    },
    removeFinanceEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter((item) => item.id !== action.payload);
    },
    replaceFinanceEntry: (state, action: PayloadAction<FinanceEntry>) => {
      state.entries = state.entries.map((item) =>
        item.id === action.payload.id ? action.payload : item,
      );
    },
  },
});

export const { setFinanceEntries, addFinanceEntry, removeFinanceEntry, replaceFinanceEntry } = financeSlice.actions;
export default financeSlice.reducer;
