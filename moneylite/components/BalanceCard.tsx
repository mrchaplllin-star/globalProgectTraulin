import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import { spacing, typography } from "@/theme";
import { formatMoney } from "@/lib/money";
import { useI18n } from "@/lib/i18n";

export const BalanceCard = ({ balance, currency }: { balance: number; currency: string }) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <Text style={[styles.label, { color: colors.muted }]}>{t("balance")}</Text>
      <Text style={[styles.balance, { color: colors.text }]}>
        {formatMoney(balance, currency)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  balance: {
    ...typography.title,
    fontSize: 32
  }
});
