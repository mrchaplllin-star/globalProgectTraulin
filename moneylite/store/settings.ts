import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings } from "@/lib/types";

type SettingsState = Settings & {
  setCurrency: (currency: string) => void;
  setWeekStart: (value: 0 | 1) => void;
  setThemeMode: (mode: Settings["themeMode"]) => void;
  setLocale: (locale: Settings["locale"]) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: "USD",
      weekStartsOn: 1,
      themeMode: "system",
      locale: "ru",
      setCurrency: (currency) => set({ currency }),
      setWeekStart: (weekStartsOn) => set({ weekStartsOn }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLocale: (locale) => set({ locale })
    }),
    {
      name: "moneylite.settings",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
