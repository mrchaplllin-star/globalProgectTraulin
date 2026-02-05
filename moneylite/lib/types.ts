export type TransactionType = "income" | "expense" | "transfer";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId?: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  note?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
};

export type Account = {
  id: string;
  name: string;
  type: "cash" | "card" | "bank" | "other";
  currency: string;
  balance: number;
  color: string;
  icon: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  period: "monthly" | "weekly";
  limitAmount: number;
  currency: string;
};

export type Settings = {
  currency: string;
  weekStartsOn: 0 | 1;
  themeMode: "system" | "light" | "dark";
  locale: "ru" | "en";
};
