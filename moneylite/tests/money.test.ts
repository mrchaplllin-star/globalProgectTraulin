import { applyTransaction, revertTransaction } from "../lib/money";
import { Account, Transaction } from "../lib/types";

describe("money utilities", () => {
  const baseAccounts: Account[] = [
    { id: "a", name: "Cash", type: "cash", currency: "USD", balance: 100, color: "#fff", icon: "wallet" },
    { id: "b", name: "Card", type: "card", currency: "USD", balance: 200, color: "#000", icon: "credit-card" }
  ];

  it("applies income", () => {
    const tx: Transaction = {
      id: "t1",
      type: "income",
      amount: 50,
      currency: "USD",
      accountId: "a",
      date: new Date().toISOString(),
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = applyTransaction(baseAccounts, tx);
    expect(updated.find((item) => item.id === "a")?.balance).toBe(150);
  });

  it("reverts expense", () => {
    const tx: Transaction = {
      id: "t2",
      type: "expense",
      amount: 30,
      currency: "USD",
      accountId: "b",
      date: new Date().toISOString(),
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = revertTransaction(baseAccounts, tx);
    expect(updated.find((item) => item.id === "b")?.balance).toBe(230);
  });

  it("handles transfer", () => {
    const tx: Transaction = {
      id: "t3",
      type: "transfer",
      amount: 40,
      currency: "USD",
      accountId: "a",
      toAccountId: "b",
      date: new Date().toISOString(),
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = applyTransaction(baseAccounts, tx);
    expect(updated.find((item) => item.id === "a")?.balance).toBe(60);
    expect(updated.find((item) => item.id === "b")?.balance).toBe(240);
  });
});
