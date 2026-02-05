import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Account } from "@/lib/types";

type AccountState = {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  applyBalances: (accounts: Account[]) => void;
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      accounts: [],
      setAccounts: (accounts) => set({ accounts }),
      addAccount: (account) =>
        set((state) => ({ accounts: [account, ...state.accounts] })),
      updateAccount: (account) =>
        set((state) => ({
          accounts: state.accounts.map((item) =>
            item.id === account.id ? account : item
          )
        })),
      applyBalances: (accounts) => set({ accounts })
    }),
    {
      name: "moneylite.accounts",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
