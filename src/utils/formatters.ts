export const getCurrencySymbol = (currency: 'CAD' | 'INR'): string => currency === 'INR' ? '₹' : '$';

export const formatCurrency = (amount: number, currency: 'CAD' | 'INR' = 'CAD'): string => {
  if (currency === 'INR') {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateShort = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const getMonthName = (month: number): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month];
};
