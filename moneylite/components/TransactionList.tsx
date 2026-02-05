import React, { useMemo } from "react";
import { SectionList, Text, View, StyleSheet } from "react-native";
import { Transaction, Category, Account } from "@/lib/types";
import { formatDayTitle } from "@/lib/date";
import { spacing, typography, useTheme } from "@/theme";
import { TransactionItem } from "@/components/TransactionItem";
import { useI18n } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";

type Props = {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onLongPress?: (transactionId: string) => void;
};

export const TransactionList = ({ transactions, categories, accounts, onLongPress }: Props) => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { locale } = useSettingsStore();

  const sections = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    transactions.forEach((transaction) => {
      const dayKey = new Date(transaction.date).toDateString();
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(transaction);
    });

    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((day) => ({
        title: day,
        data: grouped[day].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.muted }]}>{t("noTransactions")}</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={[styles.sectionTitle, { color: colors.muted }]}> 
          {formatDayTitle(title, locale)}
        </Text>
      )}
      renderItem={({ item }) => (
        <TransactionItem
          transaction={item}
          category={categories.find((cat) => cat.id === item.categoryId)}
          account={accounts.find((acc) => acc.id === item.accountId)}
          onLongPress={() => onLongPress?.(item.id)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xxl
  },
  sectionTitle: {
    ...typography.caption,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  },
  empty: {
    padding: spacing.lg,
    alignItems: "center"
  },
  emptyText: {
    ...typography.body
  }
});
