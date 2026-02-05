import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { spacing, typography, useTheme } from "@/theme";
import { normalizeAmount } from "@/lib/money";

const keys = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [".", "0", "back"]
];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const Keypad = ({ value, onChange }: Props) => {
  const { colors } = useTheme();

  const handlePress = async (key: string) => {
    await Haptics.selectionAsync();
    if (key === "back") {
      onChange(value.slice(0, -1));
      return;
    }
    const next = normalizeAmount(`${value}${key}`);
    onChange(next);
  };

  return (
    <View style={styles.container}>
      {keys.map((row) => (
        <View key={row.join("-")} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => handlePress(key)}
              style={[styles.key, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.label, { color: colors.text }]}>
                {key === "back" ? "⌫" : key}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm
  },
  key: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    ...typography.subtitle,
    fontSize: 20
  }
});
