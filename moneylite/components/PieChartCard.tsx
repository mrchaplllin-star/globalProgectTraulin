import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { VictoryPie } from "victory-native";
import { spacing, typography, useTheme } from "@/theme";
import { useI18n } from "@/lib/i18n";

type DataPoint = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: DataPoint[];
};

export const PieChartCard = ({ data }: Props) => {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <Text style={[styles.title, { color: colors.text }]}>{t("reports")}</Text>
      {data.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>{t("noTransactions")}</Text>
      ) : (
        <VictoryPie
          data={data}
          x="label"
          y="value"
          width={320}
          height={220}
          innerRadius={60}
          colorScale={data.map((item) => item.color)}
          labels={() => ""}
          style={{
            data: { stroke: isDark ? "#0B0B0E" : "#fff", strokeWidth: 1 }
          }}
        />
      )}
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.legendValue, { color: colors.muted }]}> {item.value.toFixed(0)} </Text>
          </View>
        ))}
        {data.length > 0 && (
          <Text style={[styles.total, { color: colors.muted }]}>{t("total")}: {total.toFixed(0)}</Text>
        )}
      </View>
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
  },
  legend: {
    marginTop: spacing.md,
    gap: spacing.sm
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  legendLabel: {
    ...typography.body,
    flex: 1
  },
  legendValue: {
    ...typography.caption
  },
  total: {
    ...typography.caption,
    textAlign: "right",
    marginTop: spacing.sm
  }
});
