import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { BalanceCard } from "@/components/BalanceCard";
import { PeriodPicker } from "@/components/PeriodPicker";
import { TransactionList } from "@/components/TransactionList";
import { Snackbar } from "@/components/Snackbar";
import { useTheme, spacing, typography } from "@/theme";
import { useTransactionStore } from "@/store/transactions";
import { useCategoryStore } from "@/store/categories";
import { useAccountStore } from "@/store/accounts";
import { useSettingsStore } from "@/store/settings";
import { useI18n } from "@/lib/i18n";
import { getPeriodRange, Period, isWithin } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { Feather } from "@expo/vector-icons";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { transactions, removeTransaction, lastDeleted, undoDelete, clearLastDeleted } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();
  const { currency, weekStartsOn } = useSettingsStore();
  const [period, setPeriod] = useState<Period>("month");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "transfer">("all");
  const actionSheetRef = useRef<BottomSheet>(null);

  const { start, end } = useMemo(() => getPeriodRange(period, weekStartsOn), [period, weekStartsOn]);

  const filtered = useMemo(() => {
    return transactions
      .filter((item) => isWithin(item.date, start, end))
      .filter((item) => (typeFilter === "all" ? true : item.type === typeFilter))
      .filter((item) => {
        const category = categories.find((cat) => cat.id === item.categoryId)?.name ?? "";
        const account = accounts.find((acc) => acc.id === item.accountId)?.name ?? "";
        return (
          category.toLowerCase().includes(search.toLowerCase()) ||
          account.toLowerCase().includes(search.toLowerCase()) ||
          item.note?.toLowerCase().includes(search.toLowerCase())
        );
      });
  }, [transactions, start, end, typeFilter, search, categories, accounts]);

  const incomeTotal = useMemo(
    () => filtered.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0),
    [filtered]
  );

  const expenseTotal = useMemo(
    () => filtered.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0),
    [filtered]
  );

  const balanceTotal = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BalanceCard balance={balanceTotal} currency={currency} />
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("incomeExpense")}</Text>
          <PeriodPicker value={period} onChange={setPeriod} />
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>{t("income")}</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}> {formatMoney(incomeTotal, currency)} </Text>
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>{t("expense")}</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}> {formatMoney(expenseTotal, currency)} </Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Feather name="search" color={colors.muted} size={16} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t("search")}
              placeholderTextColor={colors.muted}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>
          <Pressable
            onPress={() => setTypeFilter(typeFilter === "all" ? "expense" : typeFilter === "expense" ? "income" : typeFilter === "income" ? "transfer" : "all")}
            style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.filterText, { color: colors.text }]}>
              {t("filters")}: {typeFilter === "all" ? t("all") : t(typeFilter)}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("quickActions")}</Text>
        <View style={styles.quickRow}>
          <Pressable
            onPress={() => router.push({ pathname: "/(tabs)/add", params: { type: "expense" } })}
            style={[styles.quickButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.quickText, { color: colors.text }]}>+ {t("expense")}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: "/(tabs)/add", params: { type: "income" } })}
            style={[styles.quickButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.quickText, { color: colors.text }]}>+ {t("income")}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: "/(tabs)/add", params: { type: "transfer" } })}
            style={[styles.quickButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.quickText, { color: colors.text }]}>{t("transfer")}</Text>
          </Pressable>
        </View>

        <TransactionList
          transactions={filtered}
          categories={categories}
          accounts={accounts}
          onLongPress={(id) => removeTransaction(id)}
        />
      </ScrollView>

      <Pressable
        onPress={() => actionSheetRef.current?.expand()}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Feather name="plus" color="#fff" size={24} />
      </Pressable>

      <BottomSheet ref={actionSheetRef} snapPoints={["30%"]} enablePanDownToClose backgroundStyle={{ backgroundColor: colors.card }}>
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{t("addTransaction")}</Text>
          {(["expense", "income", "transfer"] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => {
                actionSheetRef.current?.close();
                router.push({ pathname: "/(tabs)/add", params: { type } });
              }}
              style={[styles.sheetButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.sheetButtonText, { color: colors.text }]}>{t(type)}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      <Snackbar
        visible={Boolean(lastDeleted)}
        message={t("undo")}
        actionLabel={t("undo")}
        onAction={undoDelete}
        onDismiss={clearLastDeleted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  sectionRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.lg
  },
  summaryLabel: {
    ...typography.caption
  },
  summaryValue: {
    ...typography.subtitle,
    marginTop: spacing.xs
  },
  searchRow: {
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body
  },
  filterButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.sm
  },
  filterText: {
    ...typography.caption
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  quickButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center"
  },
  quickText: {
    ...typography.body
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  sheetContent: {
    padding: spacing.lg,
    gap: spacing.sm
  },
  sheetTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm
  },
  sheetButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md
  },
  sheetButtonText: {
    ...typography.body
  }
});
