export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: 'food', name: 'Food & Drinks', icon: 'food', color: '#C47A2C', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#3A6EA5', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping', color: '#C04A5A', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie-open', color: '#7A5CA6', type: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'lightning-bolt', color: '#C25A4A', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'hospital-box', color: '#4F9A7D', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'school', color: '#5A5DA8', type: 'expense' },
  { id: 'other_expense', name: 'Other', icon: 'dots-horizontal-circle', color: '#7A7A80', type: 'expense' },

  // Income categories
  { id: 'salary', name: 'Salary', icon: 'cash-multiple', color: '#4F9A7D', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#3A6EA5', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'chart-line', color: '#7A5CA6', type: 'income' },
  { id: 'other_income', name: 'Other', icon: 'dots-horizontal-circle', color: '#7A7A80', type: 'income' },

];
