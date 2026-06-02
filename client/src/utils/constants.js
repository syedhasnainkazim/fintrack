export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary', emoji: '💼' },
  { value: 'freelance', label: 'Freelance', emoji: '💻' },
  { value: 'investment', label: 'Investment', emoji: '📈' },
  { value: 'business', label: 'Business', emoji: '🏢' },
  { value: 'rental', label: 'Rental', emoji: '🏠' },
  { value: 'gift', label: 'Gift', emoji: '🎁' },
  { value: 'other_income', label: 'Other Income', emoji: '💰' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Dining', emoji: '🍽️' },
  { value: 'shopping', label: 'Shopping', emoji: '🛒' },
  { value: 'transport', label: 'Transportation', emoji: '🚗' },
  { value: 'housing', label: 'Housing & Rent', emoji: '🏠' },
  { value: 'healthcare', label: 'Healthcare', emoji: '⚕️' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'utilities', label: 'Utilities', emoji: '⚡' },
  { value: 'personal', label: 'Personal Care', emoji: '💆' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'savings', label: 'Savings', emoji: '💰' },
  { value: 'other_expense', label: 'Other', emoji: '📦' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const getCategoryInfo = (value) =>
  ALL_CATEGORIES.find((c) => c.value === value) || { label: value, emoji: '📋' };

export const CHART_COLORS = [
  '#4f8ef7', '#a78bfa', '#10d9a0', '#f59e0b', '#f43f5e',
  '#60a5fa', '#c084fc', '#34d399', '#fbbf24', '#fb7185',
  '#38bdf8', '#e879f9',
];

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (CA$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
];
