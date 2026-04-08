import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyCode = 'CAD' | 'INR';

interface CurrencyContextType {
  currency: CurrencyCode;
  toggleCurrency: () => void;
}

const CAD_TO_INR = 60.5;

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'CAD',
  toggleCurrency: () => {},
});

export const useCurrency = () => useContext(CurrencyContext);

export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  if (from === 'CAD' && to === 'INR') return amount * CAD_TO_INR;
  return amount / CAD_TO_INR;
}

export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  if (currency === 'INR') {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STORAGE_KEY = 'app_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('CAD');

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'CAD' || saved === 'INR') setCurrency(saved);
    });
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => {
      const next = prev === 'CAD' ? 'INR' : 'CAD';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
