import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  date: string; // ISO string
  note: string;
  createdAt: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, t: Partial<Transaction>) => void;
  getMonthlyStats: (month: number, year: number) => { income: number; expenses: number; balance: number };
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: () => {},
  deleteTransaction: () => {},
  editTransaction: () => {},
  getMonthlyStats: () => ({ income: 0, expenses: 0, balance: 0 }),
});

export const useTransactions = () => useContext(TransactionContext);

const STORAGE_KEY = 'transactions';

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setTransactions(JSON.parse(saved));
    });
  }, []);

  const persist = (txns: Transaction[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  };

  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions((prev) => {
      const newTxn: Transaction = {
        ...t,
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      };
      const updated = [newTxn, ...prev];
      persist(updated);
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      persist(updated);
      return updated;
    });
  }, []);

  const editTransaction = useCallback((id: string, changes: Partial<Transaction>) => {
    setTransactions((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...changes } : t));
      persist(updated);
      return updated;
    });
  }, []);

  const getMonthlyStats = useCallback(
    (month: number, year: number) => {
      const filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { income, expenses, balance: income - expenses };
    },
    [transactions]
  );

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction, editTransaction, getMonthlyStats }}>
      {children}
    </TransactionContext.Provider>
  );
};
