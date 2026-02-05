import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Account } from "@/lib/types";
import { useTheme, spacing, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { formatMoney } from "@/lib/money";
import { useI18n } from "@/lib/i18n";

type Props = {
  accounts: Account[];
  selectedId?: string;
  onSelect: (account: Account) => void;
  title?: string;
};

export const AccountPickerSheet = React.forwardRef<BottomSheet, Props>(
  ({ accounts, selectedId, onSelect, title }, ref) => {
    const { colors } = useTheme();
    const { t } = useI18n();
    const snapPoints = useMemo(() => ["45%"], []);

    return (
      <BottomSheet
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title ?? t("accounts")}</Text>
        </View>
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item)}
              style={[
                styles.item,
                { borderColor: colors.border, backgroundColor: item.id === selectedId ? colors.background : colors.card }
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.color }]}> 
                <Icon name={item.icon} color={colors.text} size={18} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.balance, { color: colors.muted }]}> {formatMoney(item.balance, item.currency)} </Text>
              </View>
            </Pressable>
          )}
        />
      </BottomSheet>
    );
  }
);

AccountPickerSheet.displayName = "AccountPickerSheet";

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm
  },
  title: {
    ...typography.subtitle
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  },
  info: {
    flex: 1
  },
  name: {
    ...typography.body
  },
  balance: {
    ...typography.caption,
    marginTop: 2
  }
});
