// store/useStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  CURRENCIES,
  DEFAULT_ACCOUNTS,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../constants/theme';
import { supabase } from '../supabase';

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

const useStore = create((set, get) => ({

  // ── SETTINGS ──────────────────────────────────────────────
  isDark: false,
  currency: CURRENCIES.find(c => c.code === 'INR'),
  isLoaded: false,
  user: null,

  setUser: (user) => set({ user }),

  toggleTheme: () => {
    set(s => ({ isDark: !s.isDark }));
    get().persistAll();
  },

  setCurrency: (currency) => {
    set({ currency });
    get().persistAll();
  },

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

  addAccount: async (account) => {
    set(s => ({ accounts: [...s.accounts, account] }));
    get().persistAll();
    const { user } = get();
    if (user) {
      await supabase.from('accounts').upsert({
        id: account.id,
        user_id: user.id,
        name: account.name,
        icon: account.icon,
        color: account.color,
        balance: account.balance,
      });
    }
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
    const { user, accounts } = get();
    if (user) {
      const acc = accounts.find(a => a.id === id);
      if (acc) {
        supabase.from('accounts').update({ balance: acc.balance }).eq('id', id).eq('user_id', user.id);
      }
    }
  },

  deleteAccount: async (id) => {
    set(s => ({ accounts: s.accounts.filter(a => a.id !== id) }));
    get().persistAll();
    const { user } = get();
    if (user) {
      await supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id);
    }
  },

  // ── TRANSACTIONS ──────────────────────────────────────────
  transactions: [],

  addTransaction: async (txn) => {
    const newTxn = {
      ...txn,
      id: Date.now().toString(),
      amount: parseFloat(parseFloat(txn.amount).toFixed(2)),
      createdAt: new Date().toISOString(),
    };
    set(s => ({ transactions: [newTxn, ...s.transactions] }));

    if (txn.type === 'expense') {
      get().updateAccountBalance(txn.accountId, -newTxn.amount);
    } else if (txn.type === 'income') {
      get().updateAccountBalance(txn.accountId, newTxn.amount);
    } else if (txn.type === 'transfer') {
      get().updateAccountBalance(txn.fromAccountId, -newTxn.amount);
      get().updateAccountBalance(txn.toAccountId, newTxn.amount);
    }

    get().persistAll();

    const { user } = get();
    if (user) {
      await supabase.from('transactions').upsert({
        id: newTxn.id,
        user_id: user.id,
        type: newTxn.type,
        amount: newTxn.amount,
        category_id: newTxn.categoryId,
        account_id: newTxn.accountId,
        note: newTxn.note,
        date: newTxn.date,
        time: newTxn.time,
        currency: newTxn.currency,
      });
    }
  },

  editTransaction: async (id, updates) => {
    const { transactions } = get();
    const oldTxn = transactions.find(t => t.id === id);

    if (oldTxn) {
      if (oldTxn.type === 'expense') get().updateAccountBalance(oldTxn.accountId, +oldTxn.amount);
      else if (oldTxn.type === 'income') get().updateAccountBalance(oldTxn.accountId, -oldTxn.amount);
    }

    const newAmount = parseFloat(parseFloat(updates.amount).toFixed(2));
    if (updates.type === 'expense') get().updateAccountBalance(updates.accountId, -newAmount);
    else if (updates.type === 'income') get().updateAccountBalance(updates.accountId, +newAmount);

    set(s => ({
      transactions: s.transactions.map(t =>
        t.id === id ? { ...t, ...updates, amount: newAmount } : t
      )
    }));
    get().persistAll();

    const { user } = get();
    if (user) {
      await supabase.from('transactions').update({
        type: updates.type,
        amount: newAmount,
        category_id: updates.categoryId,
        account_id: updates.accountId,
        note: updates.note,
        date: updates.date,
        time: updates.time,
      }).eq('id', id).eq('user_id', user.id);
    }
  },

  deleteTransaction: async (id) => {
    set(s => ({ transactions: s.transactions.filter(t => t.id !== id) }));
    get().persistAll();
    const { user } = get();
    if (user) {
      await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
    }
  },

  // ── BUDGETS ───────────────────────────────────────────────
  budgets: [],

  addBudget: async (budget) => {
    const newBudget = { ...budget, id: Date.now().toString() };
    set(s => ({ budgets: [...s.budgets, newBudget] }));
    get().persistAll();
    const { user } = get();
    if (user) {
      await supabase.from('budgets').upsert({
        id: newBudget.id,
        user_id: user.id,
        category_id: newBudget.categoryId,
        limit_amount: newBudget.limit,
      });
    }
  },

  deleteBudget: async (id) => {
    set(s => ({ budgets: s.budgets.filter(b => b.id !== id) }));
    get().persistAll();
    const { user } = get();
    if (user) {
      await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id);
    }
  },

  // ── LEND / BORROW ─────────────────────────────────────────
  lendBorrowRecords: [],

  addLendBorrow: async (record) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
      settled: false,
      createdAt: new Date().toISOString(),
    };
    set(s => ({ lendBorrowRecords: [newRecord, ...s.lendBorrowRecords] }));
    get().persistAll();
    const { user } = get();
    if (user) {
      await supabase.from('lend_borrow').upsert({
        id: newRecord.id,
        user_id: user.id,
        type: newRecord.type,
        person: newRecord.person,
        amount: newRecord.amount,
        note: newRecord.note,
        date: newRecord.date,
        due_date: newRecord.dueDate,
        settled: false,
      });
    }
  },

  settleLendBorrow: async (id) => {
    set(s => ({
      lendBorrowRecords: s.lendBorrowRecords.map(r =>
        r.id === id ? { ...r, settled: true, settledAt: new Date().toISOString() } : r
      )
    }));
    get().persistAll();
    const { user } = get();
    if (user) {
      await supabase.from('lend_borrow').update({
        settled: true,
        settled_at: new Date().toISOString(),
      }).eq('id', id).eq('user_id', user.id);
    }
  },

  deleteLendBorrow: async (id) => {
    set(s => ({ lendBorrowRecords: s.lendBorrowRecords.filter(r => r.id !== id) }));
    get().persistAll();
    const { user } = get();
    if (user) {
      await supabase.from('lend_borrow').delete().eq('id', id).eq('user_id', user.id);
    }
  },

  // ── SYNC FROM CLOUD ───────────────────────────────────────
  syncFromCloud: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const [txnRes, accRes, budRes, lbRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('lend_borrow').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      const transactions = (txnRes.data || []).map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        categoryId: t.category_id,
        accountId: t.account_id,
        note: t.note,
        date: t.date,
        time: t.time,
        currency: t.currency,
        createdAt: t.created_at,
      }));

      const accounts = (accRes.data || []).map(a => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        color: a.color,
        balance: a.balance,
      }));

      const budgets = (budRes.data || []).map(b => ({
        id: b.id,
        categoryId: b.category_id,
        limit: b.limit_amount,
      }));

      const lendBorrowRecords = (lbRes.data || []).map(l => ({
        id: l.id,
        type: l.type,
        person: l.person,
        amount: l.amount,
        note: l.note,
        date: l.date,
        dueDate: l.due_date,
        settled: l.settled,
        settledAt: l.settled_at,
        createdAt: l.created_at,
      }));

      // Only use cloud data if it has records
      if (transactions.length > 0 || accounts.length > 0) {
        set({ transactions, accounts, budgets, lendBorrowRecords });
        get().persistAll();
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  },

  // ── PERSIST ALL ───────────────────────────────────────────
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

  // ── LOAD ALL ──────────────────────────────────────────────
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

    // Sync from cloud after loading local data
    setTimeout(() => get().syncFromCloud(), 1000);
  },

  // ── HELPERS ───────────────────────────────────────────────
  getTotalIncome: () => {
    const { transactions } = get();
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalExpense: () => {
    const { transactions } = get();
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  },

  getFilteredTransactions: (period) => {
    const { transactions } = get();
    const now = new Date();
    return transactions.filter(t => {
      const txnDate = new Date(t.date);
      if (period === 'daily') return txnDate.toDateString() === now.toDateString();
      if (period === 'weekly') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return txnDate >= weekAgo;
      }
      return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
    });
  },

  getBudgetSpent: (categoryId) => {
    const { transactions } = get();
    const now = new Date();
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === categoryId &&
        new Date(t.date).getMonth() === now.getMonth())
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