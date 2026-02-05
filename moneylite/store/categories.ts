import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category } from "@/lib/types";

type CategoryState = {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
};

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      categories: [],
      setCategories: (categories) => set({ categories }),
      addCategory: (category) =>
        set((state) => ({ categories: [category, ...state.categories] })),
      updateCategory: (category) =>
        set((state) => ({
          categories: state.categories.map((item) =>
            item.id === category.id ? category : item
          )
        }))
    }),
    {
      name: "moneylite.categories",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
