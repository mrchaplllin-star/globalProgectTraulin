import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import { useTheme, spacing, typography } from "@/theme";
import { useI18n } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { exportData, importData } from "@/lib/exportImport";
import { useAccountStore } from "@/store/accounts";
import { useCategoryStore } from "@/store/categories";
import { useTransactionStore } from "@/store/transactions";
import { useBudgetStore } from "@/store/budgets";
import { seedData } from "@/lib/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { currency, weekStartsOn, themeMode, locale, setCurrency, setWeekStart, setThemeMode, setLocale } = useSettingsStore();
  const setAccounts = useAccountStore((state) => state.setAccounts);
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setTransactions = useTransactionStore((state) => state.setTransactions);
  const setBudgets = useBudgetStore((state) => state.setBudgets);
  const [jsonData, setJsonData] = useState("");

  const handleExport = async () => {
    const bundle = await exportData();
    setJsonData(JSON.stringify(bundle, null, 2));
  };

  const handleImport = async () => {
    try {
      const bundle = JSON.parse(jsonData);
      await importData(bundle);
      setAccounts(bundle.accounts ?? []);
      setCategories(bundle.categories ?? []);
      setTransactions(bundle.transactions ?? []);
      setBudgets(bundle.budgets ?? []);
      setCurrency(bundle.settings?.currency ?? currency);
      setWeekStart(bundle.settings?.weekStartsOn ?? weekStartsOn);
      setThemeMode(bundle.settings?.themeMode ?? themeMode);
      setLocale(bundle.settings?.locale ?? locale);
      Alert.alert("OK", "Data imported");
    } catch {
      Alert.alert("Error", "Invalid JSON");
    }
  };

  const handleClear = async () => {
    await AsyncStorage.clear();
    const seeded = seedData();
    setAccounts(seeded.accounts);
    setCategories(seeded.categories);
    setTransactions(seeded.transactions);
    setBudgets(seeded.budgets);
    setCurrency(seeded.settings.currency);
    setWeekStart(seeded.settings.weekStartsOn);
    setThemeMode(seeded.settings.themeMode);
    setLocale(seeded.settings.locale);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t("settings")}</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("currency")}</Text>
        <View style={styles.row}>
          {["USD", "EUR", "RUB"].map((item) => (
            <Pressable
              key={item}
              onPress={() => setCurrency(item)}
              style={[styles.option, { backgroundColor: currency === item ? colors.primary : colors.background }]}
            >
              <Text style={[styles.optionText, { color: currency === item ? "#fff" : colors.text }]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("weekStart")}</Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => setWeekStart(1)}
            style={[styles.option, { backgroundColor: weekStartsOn === 1 ? colors.primary : colors.background }]}
          >
            <Text style={[styles.optionText, { color: weekStartsOn === 1 ? "#fff" : colors.text }]}>Mon</Text>
          </Pressable>
          <Pressable
            onPress={() => setWeekStart(0)}
            style={[styles.option, { backgroundColor: weekStartsOn === 0 ? colors.primary : colors.background }]}
          >
            <Text style={[styles.optionText, { color: weekStartsOn === 0 ? "#fff" : colors.text }]}>Sun</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("theme")}</Text>
        <View style={styles.row}>
          {(["system", "light", "dark"] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setThemeMode(item)}
              style={[styles.option, { backgroundColor: themeMode === item ? colors.primary : colors.background }]}
            >
              <Text style={[styles.optionText, { color: themeMode === item ? "#fff" : colors.text }]}>{t(item === "system" ? "themeSystem" : item === "light" ? "themeLight" : "themeDark")}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Locale</Text>
        <View style={styles.row}>
          {(["ru", "en"] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setLocale(item)}
              style={[styles.option, { backgroundColor: locale === item ? colors.primary : colors.background }]}
            >
              <Text style={[styles.optionText, { color: locale === item ? "#fff" : colors.text }]}>{item.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("export")}</Text>
        <Pressable onPress={handleExport} style={[styles.actionButton, { borderColor: colors.border }]}> 
          <Text style={[styles.actionText, { color: colors.text }]}>{t("export")}</Text>
        </Pressable>
        <Pressable onPress={handleImport} style={[styles.actionButton, { borderColor: colors.border }]}> 
          <Text style={[styles.actionText, { color: colors.text }]}>{t("import")}</Text>
        </Pressable>
        <TextInput
          value={jsonData}
          onChangeText={setJsonData}
          placeholder="{...}"
          placeholderTextColor={colors.muted}
          multiline
          style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
        />
      </View>

      <Pressable onPress={handleClear} style={[styles.clearButton, { backgroundColor: colors.danger }]}> 
        <Text style={[styles.clearText, { color: "#fff" }]}>{t("clear")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl
  },
  title: {
    ...typography.title
  },
  card: {
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md
  },
  sectionTitle: {
    ...typography.subtitle
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999
  },
  optionText: {
    ...typography.caption
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md
  },
  actionText: {
    ...typography.body
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    textAlignVertical: "top"
  },
  clearButton: {
    padding: spacing.md,
    borderRadius: 14,
    alignItems: "center"
  },
  clearText: {
    ...typography.subtitle
  }
});
