import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "@/lib/types";
import { applyTransaction, revertTransaction } from "@/lib/money";
import { useAccountStore } from "@/store/accounts";

type TransactionState = {
  transactions: Transaction[];
  lastDeleted?: Transaction;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  removeTransaction: (transactionId: string) => void;
  undoDelete: () => void;
  clearLastDeleted: () => void;
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      lastDeleted: undefined,
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) => {
        const accounts = useAccountStore.getState().accounts;
        useAccountStore
          .getState()
          .applyBalances(applyTransaction(accounts, transaction));
        set((state) => ({ transactions: [transaction, ...state.transactions] }));
      },
      updateTransaction: (transaction) => {
        const previous = get().transactions.find(
          (item) => item.id === transaction.id
        );
        let accounts = useAccountStore.getState().accounts;
        if (previous) {
          accounts = revertTransaction(accounts, previous);
        }
        accounts = applyTransaction(accounts, transaction);
        useAccountStore.getState().applyBalances(accounts);
        set((state) => ({
          transactions: state.transactions.map((item) =>
            item.id === transaction.id ? transaction : item
          )
        }));
      },
      removeTransaction: (transactionId) => {
        const transaction = get().transactions.find(
          (item) => item.id === transactionId
        );
        if (!transaction) return;
        const accounts = useAccountStore.getState().accounts;
        useAccountStore
          .getState()
          .applyBalances(revertTransaction(accounts, transaction));
        set((state) => ({
          transactions: state.transactions.filter((item) => item.id !== transactionId),
          lastDeleted: transaction
        }));
      },
      undoDelete: () => {
        const lastDeleted = get().lastDeleted;
        if (!lastDeleted) return;
        const accounts = useAccountStore.getState().accounts;
        useAccountStore
          .getState()
          .applyBalances(applyTransaction(accounts, lastDeleted));
        set((state) => ({
          transactions: [lastDeleted, ...state.transactions],
          lastDeleted: undefined
        }));
      },
      clearLastDeleted: () => set({ lastDeleted: undefined })
    }),
    {
      name: "moneylite.transactions",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
