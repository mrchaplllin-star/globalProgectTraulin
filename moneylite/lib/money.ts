import { Account, Transaction } from "./types";

export const formatMoney = (amount: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);
};

export const normalizeAmount = (value: string) => {
  const normalized = value.replace(/[^0-9.]/g, "");
  const parts = normalized.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return normalized;
};

export const applyTransaction = (accounts: Account[], transaction: Transaction) => {
  const updated = accounts.map((account) => ({ ...account }));
  const from = updated.find((item) => item.id === transaction.accountId);
  const to = transaction.toAccountId
    ? updated.find((item) => item.id === transaction.toAccountId)
    : undefined;

  if (transaction.type === "income") {
    if (from) {
      from.balance += transaction.amount;
    }
  }

  if (transaction.type === "expense") {
    if (from) {
      from.balance -= transaction.amount;
    }
  }

  if (transaction.type === "transfer") {
    if (from) {
      from.balance -= transaction.amount;
    }
    if (to) {
      to.balance += transaction.amount;
    }
  }

  return updated;
};

export const revertTransaction = (accounts: Account[], transaction: Transaction) => {
  const reverse: Transaction = {
    ...transaction,
    type:
      transaction.type === "income"
        ? "expense"
        : transaction.type === "expense"
          ? "income"
          : "transfer"
  };
  return applyTransaction(accounts, reverse);
};
