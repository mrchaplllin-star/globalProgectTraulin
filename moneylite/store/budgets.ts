import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Budget } from "@/lib/types";

type BudgetState = {
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
};

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      budgets: [],
      setBudgets: (budgets) => set({ budgets }),
      addBudget: (budget) =>
        set((state) => ({ budgets: [budget, ...state.budgets] })),
      updateBudget: (budget) =>
        set((state) => ({
          budgets: state.budgets.map((item) =>
            item.id === budget.id ? budget : item
          )
        }))
    }),
    {
      name: "moneylite.budgets",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
