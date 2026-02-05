import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Period } from "@/lib/date";
import { spacing, typography, useTheme } from "@/theme";
import { useI18n } from "@/lib/i18n";

type Props = {
  value: Period;
  onChange: (value: Period) => void;
};

const options: Period[] = ["today", "week", "month", "year"];

export const PeriodPicker = ({ value, onChange }: Props) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View style={[styles.container, { borderColor: colors.border }]}> 
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.item, { backgroundColor: active ? colors.primary : "transparent" }]}
          >
            <Text style={[styles.label, { color: active ? "#fff" : colors.muted }]}> {t(option)} </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    padding: 4
  },
  item: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    alignItems: "center"
  },
  label: {
    ...typography.caption,
    textTransform: "uppercase"
  }
});
