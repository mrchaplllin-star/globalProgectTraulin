import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { VictoryLine, VictoryChart, VictoryAxis } from "victory-native";
import { spacing, typography, useTheme } from "@/theme";
import { useI18n } from "@/lib/i18n";

type Props = {
  data: { x: string; y: number }[];
};

export const TrendChartCard = ({ data }: Props) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <Text style={[styles.title, { color: colors.text }]}>{t("incomeExpense")}</Text>
      {data.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>{t("noTransactions")}</Text>
      ) : (
        <VictoryChart height={200} padding={{ left: 50, right: 20, top: 20, bottom: 40 }}>
          <VictoryAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.muted, fontSize: 10 }
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.muted, fontSize: 10 }
            }}
          />
          <VictoryLine
            data={data}
            style={{
              data: { stroke: colors.primary, strokeWidth: 2 }
            }}
          />
        </VictoryChart>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: spacing.lg
  },
  title: {
    ...typography.subtitle,
    marginBottom: spacing.sm
  },
  empty: {
    ...typography.body,
    marginVertical: spacing.lg
  }
});
