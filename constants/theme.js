// constants/theme.js
// 🎨 Spendly's complete design system
// Every color, size, and currency used across the entire app lives here

export const COLORS = {
  // Brand
  primary: '#2563EB',
  primarySoft: '#EFF4FF',

  // Status colors
  income: '#16A34A',
  incomeSoft: '#DCFCE7',
  expense: '#DC2626',
  expenseSoft: '#FEE2E2',
  transfer: '#7C3AED',
  transferSoft: '#EDE9FE',
  lent: '#0891B2',
  lentSoft: '#CFFAFE',
  borrowed: '#EA580C',
  borrowedSoft: '#FFEDD5',

  // Light mode
  light: {
    bg: '#F7F7F5',
    card: '#FFFFFF',
    border: '#EBEBEB',
    text: '#1A1A1A',
    subtext: '#6B6B6B',
    muted: '#A0A0A0',
    input: '#F0F0EE',
    shadow: 'rgba(0,0,0,0.06)',
    navBg: '#FFFFFF',
  },

  // Dark mode
  dark: {
    bg: '#0F0F0F',
    card: '#1A1A1A',
    border: '#2A2A2A',
    text: '#F5F5F5',
    subtext: '#9A9A9A',
    muted: '#444444',
    input: '#111111',
    shadow: 'rgba(0,0,0,0.4)',
    navBg: '#1A1A1A',
  },
};

export const FONTS = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  bold: '700',
  semibold: '600',
  regular: '400',
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
  rounded: 12,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

// 💱 All supported currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar' },
  { code: 'EUR', symbol: '€',  name: 'Euro' },
  { code: 'GBP', symbol: '£',  name: 'British Pound' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

// 📂 Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'food',          name: 'Food & Dining',    icon: '🍽️', color: '#F59E0B' },
  { id: 'transport',     name: 'Transport',         icon: '🚗', color: '#3B82F6' },
  { id: 'shopping',      name: 'Shopping',          icon: '🛍️', color: '#EC4899' },
  { id: 'health',        name: 'Health',            icon: '💊', color: '#10B981' },
  { id: 'entertainment', name: 'Entertainment',     icon: '🎬', color: '#8B5CF6' },
  { id: 'bills',         name: 'Bills & Utilities', icon: '💡', color: '#F97316' },
  { id: 'rent',          name: 'Rent',              icon: '🏠', color: '#6366F1' },
  { id: 'education',     name: 'Education',         icon: '📚', color: '#14B8A6' },
  { id: 'groceries',     name: 'Groceries',         icon: '🛒', color: '#84CC16' },
  { id: 'travel',        name: 'Travel',            icon: '✈️', color: '#06B6D4' },
  { id: 'personal',      name: 'Personal Care',     icon: '🧴', color: '#F472B6' },
  { id: 'other_exp',     name: 'Other',             icon: '📦', color: '#9CA3AF' },
];

// 📂 Default income categories
export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'salary',     name: 'Salary / Job',    icon: '💼', color: '#22C55E' },
  { id: 'freelance',  name: 'Freelance',        icon: '💻', color: '#06B6D4' },
  { id: 'pocket',     name: 'Pocket Money',     icon: '👛', color: '#FBBF24' },
  { id: 'investment', name: 'Investments',      icon: '📈', color: '#8B5CF6' },
  { id: 'gift',       name: 'Gift',             icon: '🎁', color: '#F472B6' },
  { id: 'rental',     name: 'Rental Income',    icon: '🏘️', color: '#34D399' },
  { id: 'business',   name: 'Business',         icon: '🏪', color: '#FB923C' },
  { id: 'bonus',      name: 'Bonus',            icon: '🎯', color: '#A78BFA' },
  { id: 'other_inc',  name: 'Other',            icon: '💰', color: '#9CA3AF' },
];

// 🏦 Default accounts
export const DEFAULT_ACCOUNTS = [
  { id: 'cash',    name: 'Cash',         icon: '💵', color: '#22C55E' },
  { id: 'upi',     name: 'UPI',          icon: '📱', color: '#3B82F6' },
  { id: 'savings', name: 'Savings Bank', icon: '🏦', color: '#8B5CF6' },
  { id: 'credit',  name: 'Credit Card',  icon: '💳', color: '#EF4444' },
  { id: 'wallet',  name: 'Wallet',       icon: '👜', color: '#F59E0B' },
];