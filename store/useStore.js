// store/useStore.js
// 🧠 Spendly's brain — all data persists permanently on device

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  CURRENCIES,
  DEFAULT_ACCOUNTS,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../constants/theme';

// ── STORAGE HELPERS ───────────────────────────────────────────
const STORAGE_KEY = 'spendly_data';

const saveToStorage = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Save error:', e);
  }
};

const loadFromStorage = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Load error:', e);
    return null;
  }
};

// ── STORE ─────────────────────────────────────────────────────
const useStore = create((set, get) => ({

  // ── APP SETTINGS ──────────────────────────────────────────
  isDark: false,
  currency: CURRENCIES.find(c => c.code === 'INR'),
  isLoaded: false, // tracks if data has been loaded from storage

  toggleTheme: () => {
    set(s => ({ isDark: !s.isDark }));
    get().persistAll();
  },

  setCurrency: (currency) => {
    set({ currency });
    get().persistAll();
  },

  // ── USER ──────────────────────────────────────────────────
  user: null,
  setUser: (user) => set({ user }),

  // ── CATEGORIES ────────────────────────────────────────────
  expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
  incomeCategories: DEFAULT_INCOME_CATEGORIES,

  addExpenseCategory: (cat) => {
    set(s => ({ expenseCategories: [...s.expenseCategories, cat] }));
    get().persistAll();
  },
  addIncomeCategory: (cat) => {
    set(s => ({ incomeCategories: [...s.incomeCategories, cat] }));
    get().persistAll();
  },
  deleteExpenseCategory: (id) => {
    set(s => ({ expenseCategories: s.expenseCategories.filter(c => c.id !== id) }));
    get().persistAll();
  },
  deleteIncomeCategory: (id) => {
    set(s => ({ incomeCategories: s.incomeCategories.filter(c => c.id !== id) }));
    get().persistAll();
  },

  // ── ACCOUNTS ──────────────────────────────────────────────
  accounts: DEFAULT_ACCOUNTS.map(a => ({ ...a, balance: 0.00 })),

  addAccount: (account) => {
    set(s => ({ accounts: [...s.accounts, account] }));
    get().persistAll();
  },

  updateAccountBalance: (id, amount) => {
    set(s => ({
      accounts: s.accounts.map(a =>
        a.id === id
          ? { ...a, balance: parseFloat((a.balance + amount).toFixed(2)) }
          : a
      )
    }));
    get().persistAll();
  },

  deleteAccount: (id) => {
    set(s => ({ accounts: s.accounts.filter(a => a.id !== id) }));
    get().persistAll();
  },

  // ── TRANSACTIONS ──────────────────────────────────────────
  transactions: [],

  addTransaction: (txn) => {
    const newTxn = {
      ...txn,
      id: Date.now().toString(),
      amount: parseFloat(parseFloat(txn.amount).toFixed(2)),
      createdAt: new Date().toISOString(),
    };
    set(s => ({ transactions: [newTxn, ...s.transactions] }));

    // Auto-update account balance
    const { updateAccountBalance } = get();
    if (txn.type === 'expense') {
      updateAccountBalance(txn.accountId, -newTxn.amount);
    } else if (txn.type === 'income') {
      updateAccountBalance(txn.accountId, newTxn.amount);
    } else if (txn.type === 'transfer') {
      updateAccountBalance(txn.fromAccountId, -newTxn.amount);
      updateAccountBalance(txn.toAccountId, newTxn.amount);
    }
    get().persistAll();
  },

  editTransaction: (id, updates) => {
    const { transactions, accounts } = get();
    const oldTxn = transactions.find(t => t.id === id);

    // Reverse old transaction's effect on account balance
    if (oldTxn) {
      if (oldTxn.type === 'expense') {
        get().updateAccountBalance(oldTxn.accountId, +oldTxn.amount);
      } else if (oldTxn.type === 'income') {
        get().updateAccountBalance(oldTxn.accountId, -oldTxn.amount);
      }
    }

    // Apply new transaction's effect
    const newAmount = parseFloat(parseFloat(updates.amount).toFixed(2));
    if (updates.type === 'expense') {
      get().updateAccountBalance(updates.accountId, -newAmount);
    } else if (updates.type === 'income') {
      get().updateAccountBalance(updates.accountId, +newAmount);
    }

    set(s => ({
      transactions: s.transactions.map(t =>
        t.id === id ? { ...t, ...updates, amount: newAmount } : t
      )
    }));
    get().persistAll();
  },

  deleteTransaction: (id) => {
    set(s => ({ transactions: s.transactions.filter(t => t.id !== id) }));
    get().persistAll();
  },

  // ── BUDGETS ───────────────────────────────────────────────
  budgets: [],

  addBudget: (budget) => {
    set(s => ({ budgets: [...s.budgets, { ...budget, id: Date.now().toString() }] }));
    get().persistAll();
  },

  updateBudget: (id, updates) => {
    set(s => ({
      budgets: s.budgets.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
    get().persistAll();
  },

  deleteBudget: (id) => {
    set(s => ({ budgets: s.budgets.filter(b => b.id !== id) }));
    get().persistAll();
  },

  // ── LEND / BORROW ─────────────────────────────────────────
  lendBorrowRecords: [],

  addLendBorrow: (record) => {
    set(s => ({
      lendBorrowRecords: [
        {
          ...record,
          id: Date.now().toString(),
          settled: false,
          createdAt: new Date().toISOString(),
        },
        ...s.lendBorrowRecords,
      ]
    }));
    get().persistAll();
  },

  settleLendBorrow: (id) => {
    set(s => ({
      lendBorrowRecords: s.lendBorrowRecords.map(r =>
        r.id === id
          ? { ...r, settled: true, settledAt: new Date().toISOString() }
          : r
      )
    }));
    get().persistAll();
  },

  deleteLendBorrow: (id) => {
    set(s => ({ lendBorrowRecords: s.lendBorrowRecords.filter(r => r.id !== id) }));
    get().persistAll();
  },

  // ── PERSIST ALL DATA TO PHONE STORAGE ─────────────────────
  persistAll: () => {
    const state = get();
    saveToStorage({
      isDark: state.isDark,
      currency: state.currency,
      transactions: state.transactions,
      accounts: state.accounts,
      budgets: state.budgets,
      lendBorrowRecords: state.lendBorrowRecords,
      expenseCategories: state.expenseCategories,
      incomeCategories: state.incomeCategories,
    });
  },

  // ── LOAD ALL DATA FROM PHONE STORAGE ──────────────────────
  loadAll: async () => {
    const saved = await loadFromStorage();
    if (saved) {
      set({
        isDark: saved.isDark ?? false,
        currency: saved.currency ?? CURRENCIES.find(c => c.code === 'INR'),
        transactions: saved.transactions ?? [],
        accounts: saved.accounts ?? DEFAULT_ACCOUNTS.map(a => ({ ...a, balance: 0.00 })),
        budgets: saved.budgets ?? [],
        lendBorrowRecords: saved.lendBorrowRecords ?? [],
        expenseCategories: saved.expenseCategories ?? DEFAULT_EXPENSE_CATEGORIES,
        incomeCategories: saved.incomeCategories ?? DEFAULT_INCOME_CATEGORIES,
        isLoaded: true,
      });
    } else {
      set({ isLoaded: true });
    }
  },

  // ── HELPERS ───────────────────────────────────────────────
  getTotalIncome: () => {
    const { transactions } = get();
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalExpense: () => {
    const { transactions } = get();
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getFilteredTransactions: (period) => {
    const { transactions } = get();
    const now = new Date();
    return transactions.filter(t => {
      const txnDate = new Date(t.date);
      if (period === 'daily') {
        return txnDate.toDateString() === now.toDateString();
      } else if (period === 'weekly') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return txnDate >= weekAgo;
      } else {
        return (
          txnDate.getMonth() === now.getMonth() &&
          txnDate.getFullYear() === now.getFullYear()
        );
      }
    });
  },

  getBudgetSpent: (categoryId) => {
    const { transactions } = get();
    const now = new Date();
    return transactions
      .filter(t =>
        t.type === 'expense' &&
        t.categoryId === categoryId &&
        new Date(t.date).getMonth() === now.getMonth()
      )
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalAssets: () => {
    const { accounts } = get();
    return accounts.reduce((sum, a) => sum + a.balance, 0);
  },

  formatAmount: (amount) => {
    const { currency } = get();
    return `${currency.symbol}${Math.abs(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },

}));

export default useStore;