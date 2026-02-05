import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/theme";
import { seedData, hasSeeded, markSeeded } from "@/lib/storage";
import { useAccountStore } from "@/store/accounts";
import { useCategoryStore } from "@/store/categories";
import { useTransactionStore } from "@/store/transactions";
import { useBudgetStore } from "@/store/budgets";
import { useSettingsStore } from "@/store/settings";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const setAccounts = useAccountStore((state) => state.setAccounts);
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setTransactions = useTransactionStore((state) => state.setTransactions);
  const setBudgets = useBudgetStore((state) => state.setBudgets);
  const setSettings = useSettingsStore((state) => state.setLocale);
  const setCurrency = useSettingsStore((state) => state.setCurrency);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const setWeekStart = useSettingsStore((state) => state.setWeekStart);

  useEffect(() => {
    const init = async () => {
      const already = await hasSeeded();
      if (!already) {
        const data = seedData();
        setAccounts(data.accounts);
        setCategories(data.categories);
        setTransactions(data.transactions);
        setBudgets(data.budgets);
        setCurrency(data.settings.currency);
        setWeekStart(data.settings.weekStartsOn);
        setThemeMode(data.settings.themeMode);
        setSettings(data.settings.locale);
        await markSeeded();
      }
      setReady(true);
    };
    init();
  }, [setAccounts, setCategories, setTransactions, setBudgets, setCurrency, setWeekStart, setThemeMode, setSettings]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
