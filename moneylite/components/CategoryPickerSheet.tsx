import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Category } from "@/lib/types";
import { useTheme, spacing, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { useI18n } from "@/lib/i18n";

type Props = {
  categories: Category[];
  selectedId?: string;
  type?: "income" | "expense";
  onSelect: (category: Category) => void;
};

export const CategoryPickerSheet = React.forwardRef<BottomSheet, Props>(
  ({ categories, selectedId, type, onSelect }, ref) => {
    const { colors } = useTheme();
    const { t } = useI18n();
    const snapPoints = useMemo(() => ["50%"], []);
    const filtered = type ? categories.filter((item) => item.type === type) : categories;

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
          <Text style={[styles.title, { color: colors.text }]}>{t("categories")}</Text>
        </View>
        <FlatList
          data={filtered}
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
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            </Pressable>
          )}
        />
      </BottomSheet>
    );
  }
);

CategoryPickerSheet.displayName = "CategoryPickerSheet";

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
  name: {
    ...typography.body
  }
});
