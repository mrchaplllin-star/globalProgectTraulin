import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "./colors";
import { useSettingsStore } from "@/store/settings";

export type Theme = {
  colors: typeof lightColors;
  isDark: boolean;
};

const ThemeContext = createContext<Theme>({
  colors: lightColors,
  isDark: false
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const { themeMode } = useSettingsStore();

  const isDark = useMemo(() => {
    if (themeMode === "system") {
      return systemScheme === "dark";
    }
    return themeMode === "dark";
  }, [themeMode, systemScheme]);

  const value = useMemo(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
