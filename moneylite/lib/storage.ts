import AsyncStorage from "@react-native-async-storage/async-storage";
import { Account, Budget, Category, Transaction, Settings } from "./types";

export const STORAGE_KEYS = {
  accounts: "moneylite.accounts",
  categories: "moneylite.categories",
  transactions: "moneylite.transactions",
  budgets: "moneylite.budgets",
  settings: "moneylite.settings",
  seeded: "moneylite.seeded"
} as const;

export const getItem = async <T,>(key: string, fallback: T) => {
  const value = await AsyncStorage.getItem(key);
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const setItem = async <T,>(key: string, value: T) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const seedData = () => {
  const now = new Date();
  const accounts: Account[] = [
    {
      id: "acc-cash",
      name: "Cash",
      type: "cash",
      currency: "USD",
      balance: 120.5,
      color: "#F59E0B",
      icon: "wallet"
    },
    {
      id: "acc-card",
      name: "Card",
      type: "card",
      currency: "USD",
      balance: 980.75,
      color: "#3B82F6",
      icon: "credit-card"
    }
  ];

  const categories: Category[] = [
    { id: "cat-food", name: "Food", type: "expense", color: "#F97316", icon: "pizza" },
    { id: "cat-coffee", name: "Coffee", type: "expense", color: "#C2410C", icon: "coffee" },
    { id: "cat-transport", name: "Transport", type: "expense", color: "#2563EB", icon: "bus" },
    { id: "cat-rent", name: "Rent", type: "expense", color: "#7C3AED", icon: "home" },
    { id: "cat-health", name: "Health", type: "expense", color: "#DC2626", icon: "heart" },
    { id: "cat-shopping", name: "Shopping", type: "expense", color: "#EC4899", icon: "shopping-bag" },
    { id: "cat-entertain", name: "Fun", type: "expense", color: "#14B8A6", icon: "music" },
    { id: "cat-salary", name: "Salary", type: "income", color: "#16A34A", icon: "briefcase" },
    { id: "cat-freelance", name: "Freelance", type: "income", color: "#22C55E", icon: "laptop" },
    { id: "cat-gift", name: "Gift", type: "income", color: "#F43F5E", icon: "gift" }
  ];

  const makeDate = (daysAgo: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  const transactions: Transaction[] = [
    {
      id: "tx-1",
      type: "expense",
      amount: 12.4,
      currency: "USD",
      categoryId: "cat-coffee",
      accountId: "acc-cash",
      date: makeDate(0),
      note: "Latte",
      tags: ["coffee"],
      createdAt: makeDate(0),
      updatedAt: makeDate(0)
    },
    {
      id: "tx-2",
      type: "expense",
      amount: 42.0,
      currency: "USD",
      categoryId: "cat-food",
      accountId: "acc-card",
      date: makeDate(0),
      note: "Dinner",
      tags: ["food"],
      createdAt: makeDate(0),
      updatedAt: makeDate(0)
    },
    {
      id: "tx-3",
      type: "income",
      amount: 1200,
      currency: "USD",
      categoryId: "cat-salary",
      accountId: "acc-card",
      date: makeDate(1),
      note: "Salary",
      tags: ["monthly"],
      createdAt: makeDate(1),
      updatedAt: makeDate(1)
    },
    {
      id: "tx-4",
      type: "expense",
      amount: 78.2,
      currency: "USD",
      categoryId: "cat-shopping",
      accountId: "acc-card",
      date: makeDate(2),
      note: "Groceries",
      tags: ["home"],
      createdAt: makeDate(2),
      updatedAt: makeDate(2)
    },
    {
      id: "tx-5",
      type: "expense",
      amount: 22.9,
      currency: "USD",
      categoryId: "cat-transport",
      accountId: "acc-cash",
      date: makeDate(2),
      note: "Taxi",
      tags: ["ride"],
      createdAt: makeDate(2),
      updatedAt: makeDate(2)
    },
    {
      id: "tx-6",
      type: "income",
      amount: 180,
      currency: "USD",
      categoryId: "cat-freelance",
      accountId: "acc-card",
      date: makeDate(4),
      note: "Design",
      tags: ["project"],
      createdAt: makeDate(4),
      updatedAt: makeDate(4)
    },
    {
      id: "tx-7",
      type: "expense",
      amount: 55,
      currency: "USD",
      categoryId: "cat-entertain",
      accountId: "acc-card",
      date: makeDate(5),
      note: "Concert",
      tags: ["fun"],
      createdAt: makeDate(5),
      updatedAt: makeDate(5)
    },
    {
      id: "tx-8",
      type: "expense",
      amount: 310,
      currency: "USD",
      categoryId: "cat-rent",
      accountId: "acc-card",
      date: makeDate(6),
      note: "April",
      tags: ["rent"],
      createdAt: makeDate(6),
      updatedAt: makeDate(6)
    },
    {
      id: "tx-9",
      type: "expense",
      amount: 18.8,
      currency: "USD",
      categoryId: "cat-health",
      accountId: "acc-cash",
      date: makeDate(7),
      note: "Pharmacy",
      tags: ["health"],
      createdAt: makeDate(7),
      updatedAt: makeDate(7)
    },
    {
      id: "tx-10",
      type: "income",
      amount: 40,
      currency: "USD",
      categoryId: "cat-gift",
      accountId: "acc-cash",
      date: makeDate(8),
      note: "Gift",
      tags: ["gift"],
      createdAt: makeDate(8),
      updatedAt: makeDate(8)
    },
    {
      id: "tx-11",
      type: "transfer",
      amount: 120,
      currency: "USD",
      accountId: "acc-card",
      toAccountId: "acc-cash",
      date: makeDate(9),
      note: "ATM",
      tags: ["transfer"],
      createdAt: makeDate(9),
      updatedAt: makeDate(9)
    }
  ];

  const budgets: Budget[] = [
    {
      id: "budget-food",
      categoryId: "cat-food",
      period: "monthly",
      limitAmount: 300,
      currency: "USD"
    },
    {
      id: "budget-coffee",
      categoryId: "cat-coffee",
      period: "weekly",
      limitAmount: 25,
      currency: "USD"
    }
  ];

  const settings: Settings = {
    currency: "USD",
    weekStartsOn: 1,
    themeMode: "system",
    locale: "ru"
  };

  return { accounts, categories, transactions, budgets, settings };
};

export const hasSeeded = async () => {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.seeded);
  return value === "true";
};

export const markSeeded = async () => {
  await AsyncStorage.setItem(STORAGE_KEYS.seeded, "true");
};
