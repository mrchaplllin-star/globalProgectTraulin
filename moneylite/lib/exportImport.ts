import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./storage";
import { Account, Budget, Category, Settings, Transaction } from "./types";

export type ExportBundle = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  settings: Settings;
};

export const exportData = async (): Promise<ExportBundle> => {
  const [accounts, categories, transactions, budgets, settings] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.accounts),
    AsyncStorage.getItem(STORAGE_KEYS.categories),
    AsyncStorage.getItem(STORAGE_KEYS.transactions),
    AsyncStorage.getItem(STORAGE_KEYS.budgets),
    AsyncStorage.getItem(STORAGE_KEYS.settings)
  ]);

  return {
    accounts: accounts ? (JSON.parse(accounts) as Account[]) : [],
    categories: categories ? (JSON.parse(categories) as Category[]) : [],
    transactions: transactions ? (JSON.parse(transactions) as Transaction[]) : [],
    budgets: budgets ? (JSON.parse(budgets) as Budget[]) : [],
    settings: settings ? (JSON.parse(settings) as Settings) : {
      currency: "USD",
      weekStartsOn: 1,
      themeMode: "system",
      locale: "ru"
    }
  };
};

export const importData = async (bundle: ExportBundle) => {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(bundle.accounts)),
    AsyncStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(bundle.categories)),
    AsyncStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(bundle.transactions)),
    AsyncStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(bundle.budgets)),
    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(bundle.settings))
  ]);
};
