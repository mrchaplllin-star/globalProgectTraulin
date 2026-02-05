import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import { Keypad } from "@/components/Keypad";
import { CategoryPickerSheet } from "@/components/CategoryPickerSheet";
import { AccountPickerSheet } from "@/components/AccountPickerSheet";
import { useTheme, spacing, typography } from "@/theme";
import { useCategoryStore } from "@/store/categories";
import { useAccountStore } from "@/store/accounts";
import { useTransactionStore } from "@/store/transactions";
import { useSettingsStore } from "@/store/settings";
import { useI18n } from "@/lib/i18n";
import { TransactionType } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/date";
import * as Haptics from "expo-haptics";

export default function AddScreen() {
  const params = useLocalSearchParams<{ type?: TransactionType }>();
  const initialType = params.type ?? "expense";
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("0");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(new Date());
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [toAccountId, setToAccountId] = useState<string | undefined>(undefined);
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const { currency, locale } = useSettingsStore();
  const { colors } = useTheme();
  const { t } = useI18n();
  const categorySheetRef = useRef<BottomSheet>(null);
  const accountSheetRef = useRef<BottomSheet>(null);
  const toAccountSheetRef = useRef<BottomSheet>(null);

  const formattedAmount = useMemo(() => {
    const value = Number(amount || 0);
    return formatMoney(value, currency);
  }, [amount, currency]);

  const canSave = useMemo(() => {
    const value = Number(amount || 0);
    if (value <= 0) return false;
    if (!accountId) return false;
    if (type !== "transfer" && !categoryId) return false;
    if (type === "transfer" && !toAccountId) return false;
    return true;
  }, [amount, accountId, categoryId, type, toAccountId]);

  const handleSave = async () => {
    if (!canSave) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = new Date();
    addTransaction({
      id: `tx-${Date.now()}`,
      type,
      amount: Number(amount),
      currency,
      categoryId: type === "transfer" ? undefined : categoryId,
      accountId: accountId!,
      toAccountId: type === "transfer" ? toAccountId : undefined,
      date: date.toISOString(),
      note: note.trim() || undefined,
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.typeRow}>
          {(["expense", "income", "transfer"] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => setType(option)}
              style={[styles.typeButton, { backgroundColor: type === option ? colors.primary : colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.typeText, { color: type === option ? "#fff" : colors.text }]}>{t(option)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.amount, { color: colors.text }]}>{formattedAmount}</Text>

        <View style={styles.inputRow}>
          <Text style={[styles.label, { color: colors.muted }]}>{t("category")}</Text>
          <Pressable
            onPress={() => categorySheetRef.current?.expand()}
            style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}> 
              {categories.find((item) => item.id === categoryId)?.name ?? t("select")}
            </Text>
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <Text style={[styles.label, { color: colors.muted }]}>{t("accountFrom")}</Text>
          <Pressable
            onPress={() => accountSheetRef.current?.expand()}
            style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}> 
              {accounts.find((item) => item.id === accountId)?.name ?? t("select")}
            </Text>
          </Pressable>
        </View>

        {type === "transfer" && (
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: colors.muted }]}>{t("accountTo")}</Text>
            <Pressable
              onPress={() => toAccountSheetRef.current?.expand()}
              style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.selectorText, { color: colors.text }]}> 
                {accounts.find((item) => item.id === toAccountId)?.name ?? t("select")}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.inputRow}>
          <Text style={[styles.label, { color: colors.muted }]}>{t("date")}</Text>
          <Pressable
            onPress={() => setDate(new Date())}
            style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}>{formatDate(date, locale)}</Text>
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <Text style={[styles.label, { color: colors.muted }]}>{t("note")}</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t("note")}
            placeholderTextColor={colors.muted}
            style={[styles.textInput, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={[styles.label, { color: colors.muted }]}>{t("tags")}</Text>
          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="food, taxi"
            placeholderTextColor={colors.muted}
            style={[styles.textInput, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          />
        </View>

        <Keypad value={amount === "0" ? "" : amount} onChange={(value) => setAmount(value || "0")} />

        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={[styles.saveButton, { backgroundColor: canSave ? colors.primary : colors.border }]}
        >
          <Text style={[styles.saveText, { color: canSave ? "#fff" : colors.muted }]}>{t("save")}</Text>
        </Pressable>
      </ScrollView>

      <CategoryPickerSheet
        ref={categorySheetRef}
        categories={categories}
        type={type === "transfer" ? undefined : type}
        selectedId={categoryId}
        onSelect={(category) => {
          setCategoryId(category.id);
          categorySheetRef.current?.close();
        }}
      />

      <AccountPickerSheet
        ref={accountSheetRef}
        accounts={accounts}
        selectedId={accountId}
        onSelect={(account) => {
          setAccountId(account.id);
          accountSheetRef.current?.close();
        }}
      />

      <AccountPickerSheet
        ref={toAccountSheetRef}
        accounts={accounts}
        selectedId={toAccountId}
        title={t("accountTo")}
        onSelect={(account) => {
          setToAccountId(account.id);
          toAccountSheetRef.current?.close();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center"
  },
  typeText: {
    ...typography.caption,
    textTransform: "uppercase"
  },
  amount: {
    ...typography.title,
    fontSize: 34,
    textAlign: "center",
    marginVertical: spacing.sm
  },
  inputRow: {
    gap: spacing.sm
  },
  label: {
    ...typography.caption
  },
  selector: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1
  },
  selectorText: {
    ...typography.body
  },
  textInput: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1
  },
  saveButton: {
    padding: spacing.md,
    borderRadius: 14,
    alignItems: "center",
    marginTop: spacing.md
  },
  saveText: {
    ...typography.subtitle,
    fontSize: 16
  }
});
