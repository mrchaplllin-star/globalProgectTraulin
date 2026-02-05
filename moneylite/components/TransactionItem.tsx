import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme, spacing, typography } from "@/theme";
import { Transaction, Category, Account } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { Icon } from "@/components/Icon";

type Props = {
  transaction: Transaction;
  category?: Category;
  account?: Account;
  onPress?: () => void;
  onLongPress?: () => void;
};

export const TransactionItem = ({ transaction, category, account, onPress, onLongPress }: Props) => {
  const { colors } = useTheme();
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? colors.success : transaction.type === "expense" ? colors.danger : colors.primary;
  const title = category?.name ?? (transaction.type === "transfer" ? "Transfer" : "Unknown");
  const subtitle = transaction.type === "transfer" ? `${account?.name ?? ""}` : account?.name ?? "";

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={[styles.container, { backgroundColor: colors.card }]}> 
      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, { backgroundColor: category?.color ?? colors.border }]}> 
          <Icon name={category?.icon ?? "transfer"} color={colors.text} size={18} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}> 
        {transaction.type === "expense" ? "-" : transaction.type === "income" ? "+" : ""}
        {formatMoney(transaction.amount, transaction.currency)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.sm
  },
  iconWrap: {
    marginRight: spacing.md
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    flex: 1
  },
  title: {
    ...typography.subtitle,
    fontSize: 16
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2
  },
  amount: {
    ...typography.subtitle
  }
});
