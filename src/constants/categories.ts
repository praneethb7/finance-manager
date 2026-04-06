export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: 'food', name: 'Food & Drinks', icon: 'food', color: '#FF9500', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#007AFF', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping', color: '#FF2D55', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie-open', color: '#AF52DE', type: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'lightning-bolt', color: '#FF3B30', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'hospital-box', color: '#34C759', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'school', color: '#5856D6', type: 'expense' },
  { id: 'other_expense', name: 'Other', icon: 'dots-horizontal-circle', color: '#8E8E93', type: 'expense' },
  // Income categories
  { id: 'salary', name: 'Salary', icon: 'cash-multiple', color: '#34C759', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#007AFF', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'chart-line', color: '#AF52DE', type: 'income' },
  { id: 'other_income', name: 'Other', icon: 'dots-horizontal-circle', color: '#8E8E93', type: 'income' },
];
