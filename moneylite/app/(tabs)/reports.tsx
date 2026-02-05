import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { useTheme, spacing, typography } from "@/theme";
import { useI18n } from "@/lib/i18n";
import { PeriodPicker } from "@/components/PeriodPicker";
import { PieChartCard } from "@/components/PieChartCard";
import { TrendChartCard } from "@/components/TrendChartCard";
import { useTransactionStore } from "@/store/transactions";
import { useCategoryStore } from "@/store/categories";
import { useBudgetStore } from "@/store/budgets";
import { useSettingsStore } from "@/store/settings";
import { getPeriodRange, Period, isWithin } from "@/lib/date";
import { formatMoney } from "@/lib/money";

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { budgets } = useBudgetStore();
  const { currency, weekStartsOn } = useSettingsStore();
  const [period, setPeriod] = useState<Period>("month");

  const { start, end } = useMemo(() => getPeriodRange(period, weekStartsOn), [period, weekStartsOn]);

  const filtered = useMemo(
    () => transactions.filter((item) => isWithin(item.date, start, end)),
    [transactions, start, end]
  );

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter((item) => item.type === "expense").forEach((item) => {
      if (!item.categoryId) return;
      map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + item.amount);
    });
    return Array.from(map.entries()).map(([id, value]) => {
      const category = categories.find((item) => item.id === id);
      return {
        label: category?.name ?? "Other",
        value,
        color: category?.color ?? colors.primary
      };
    });
  }, [filtered, categories, colors.primary]);

  const trendData = useMemo(() => {
    const daily: Record<string, number> = {};
    filtered.filter((item) => item.type === "expense").forEach((item) => {
      const day = new Date(item.date).toLocaleDateString();
      daily[day] = (daily[day] ?? 0) + item.amount;
    });
    return Object.keys(daily).map((day) => ({ x: day, y: daily[day] }));
  }, [filtered]);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t("reports")}</Text>
      <PeriodPicker value={period} onChange={setPeriod} />
      <PieChartCard data={pieData} />
      <TrendChartCard data={trendData} />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("budgets")}</Text>
        {budgets.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.muted }]}>{t("noTransactions")}</Text>
        ) : (
          budgets.map((budget) => {
            const spent = filtered
              .filter((item) => item.categoryId === budget.categoryId)
              .reduce((sum, item) => sum + item.amount, 0);
            const progress = Math.min(spent / budget.limitAmount, 1);
            const category = categories.find((item) => item.id === budget.categoryId);
            return (
              <View key={budget.id} style={styles.budgetRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.budgetName, { color: colors.text }]}>{category?.name ?? "Category"}</Text>
                  <Text style={[styles.budgetAmount, { color: colors.muted }]}> {formatMoney(spent, currency)} / {formatMoney(budget.limitAmount, currency)} </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}> 
                  <View style={[styles.progressFill, { backgroundColor: category?.color ?? colors.primary, width: `${progress * 100}%` }]} />
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  title: {
    ...typography.title
  },
  card: {
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.md
  },
  emptyText: {
    ...typography.body
  },
  budgetRow: {
    marginBottom: spacing.md
  },
  budgetName: {
    ...typography.body
  },
  budgetAmount: {
    ...typography.caption,
    marginTop: 2
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: spacing.sm
  },
  progressFill: {
    height: "100%"
  }
});
