import React, { useEffect, useRef } from "react";
import { Animated, Text, Pressable, StyleSheet } from "react-native";
import { spacing, typography, useTheme } from "@/theme";

type Props = {
  visible: boolean;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
};

export const Snackbar = ({ visible, message, actionLabel, onAction, onDismiss }: Props) => {
  const { colors } = useTheme();
  const translate = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(translate, {
      toValue: visible ? 0 : 120,
      duration: 250,
      useNativeDriver: true
    }).start();

    if (visible) {
      const timer = setTimeout(onDismiss, 3500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, translate, onDismiss]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ translateY: translate }] }]}> 
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      <Pressable onPress={onAction}>
        <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  message: {
    ...typography.body,
    flex: 1,
    marginRight: spacing.md
  },
  action: {
    ...typography.subtitle,
    fontSize: 14
  }
});
