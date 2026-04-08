import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../context/ThemeContext';
import { useTransactions, Transaction } from '../context/TransactionContext';
import { useSearch } from '../context/SearchContext';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';
import { useCurrency, convertAmount } from '../context/CurrencyContext';
import EmptyState from '../components/EmptyState';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = today.getTime() - target.getTime();
  const dayMs = 86400000;

  if (diff === 0) return `Today, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  if (diff === dayMs) return `Yesterday, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface DateGroup {
  dateKey: string;
  dateLabel: string;
  dailyTotal: number;
  transactions: Transaction[];
}

interface Filters {
  categoryId: string | null; // null = All
  type: 'all' | 'income' | 'expense';
  titleSearch: string;
  noteSearch: string;
}

const EMPTY_FILTERS: Filters = {
  categoryId: null,
  type: 'all',
  titleSearch: '',
  noteSearch: '',
};

export default function TransactionsScreen() {
  const { colors, mode } = useTheme();
  const { transactions, editTransaction, deleteTransaction } = useTransactions();
  const { searchQuery } = useSearch();
  const { currency } = useCurrency();
  const isDark = mode === 'dark';

  // Expanded card state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');

  const expandCard = useCallback((t: Transaction) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedId === t.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(t.id);
    setEditTitle(t.title);
    setEditAmount(t.amount.toString());
    setEditNote(t.note);
  }, [expandedId]);

  const collapseCard = useCallback(() => {
    if (expandedId) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedId(null);
    }
  }, [expandedId]);

  const handleSave = useCallback((id: string) => {
    const amt = parseFloat(editAmount);
    if (!editTitle.trim() || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid input', 'Please enter a valid title and amount.');
      return;
    }
    editTransaction(id, { title: editTitle.trim(), amount: amt, note: editNote.trim() });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(null);
  }, [editTitle, editAmount, editNote, editTransaction]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          deleteTransaction(id);
          setExpandedId(null);
        },
      },
    ]);
  }, [deleteTransaction]);
  const monthScrollRef = useRef<ScrollView>(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear] = useState(now.getFullYear());

  // Filters
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    appliedFilters.categoryId !== null ||
    appliedFilters.type !== 'all' ||
    appliedFilters.titleSearch !== '' ||
    appliedFilters.noteSearch !== '';

  // Generate month list (current year)
  const months = useMemo(() => {
    const list: { month: number; year: number; label: string }[] = [];
    for (let m = 0; m < 12; m++) {
      list.push({ month: m, year: selectedYear, label: MONTH_NAMES[m] });
    }
    return list;
  }, [selectedYear]);

  // Filter transactions for selected month + applied filters
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return false;

      if (appliedFilters.categoryId && t.categoryId !== appliedFilters.categoryId) return false;
      if (appliedFilters.type !== 'all' && t.type !== appliedFilters.type) return false;
      if (
        appliedFilters.titleSearch &&
        !t.title.toLowerCase().includes(appliedFilters.titleSearch.toLowerCase())
      )
        return false;
      if (
        appliedFilters.noteSearch &&
        !t.note.toLowerCase().includes(appliedFilters.noteSearch.toLowerCase())
      )
        return false;

      // Global search from TopBar
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.note.toLowerCase().includes(q) &&
          !t.categoryId.toLowerCase().includes(q)
        )
          return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, selectedYear, appliedFilters, searchQuery]);

  // Monthly summary (based on filtered results)
  const summary = useMemo(() => {
    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + convertAmount(t.amount, t.currency || currency, currency), 0);
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + convertAmount(t.amount, t.currency || currency, currency), 0);
    return { expenses, income, net: income - expenses };
  }, [monthTransactions, currency]);

  // Group by date
  const dateGroups = useMemo(() => {
    const groups: Record<string, DateGroup> = {};
    const sorted = [...monthTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const t of sorted) {
      const key = getDateKey(t.date);
      if (!groups[key]) {
        groups[key] = {
          dateKey: key,
          dateLabel: getDateLabel(t.date),
          dailyTotal: 0,
          transactions: [],
        };
      }
      groups[key].transactions.push(t);
      const converted = convertAmount(t.amount, t.currency || currency, currency);
      groups[key].dailyTotal += t.type === 'expense' ? -converted : converted;
    }

    return Object.values(groups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [monthTransactions, currency]);

  const getCategoryInfo = useCallback((categoryId: string) => {
    return DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
  }, []);

  const totalCashFlow = summary.net;
  const totalCount = monthTransactions.length;

  // Category breakdown for pie chart (expenses only)
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const t of monthTransactions) {
      if (t.type !== 'expense') continue;
      totals[t.categoryId] = (totals[t.categoryId] || 0) + convertAmount(t.amount, t.currency || currency, currency);
    }
    const entries = Object.entries(totals)
      .map(([catId, amount]) => {
        const cat = DEFAULT_CATEGORIES.find((c) => c.id === catId);
        return {
          value: amount,
          color: cat?.color || '#8E8E93',
          label: cat?.name || catId,
          icon: (cat?.icon || 'cash') as any,
        };
      })
      .sort((a, b) => b.value - a.value);
    return entries;
  }, [monthTransactions, currency]);

  const openFilters = () => {
    setDraftFilters({ ...appliedFilters });
    setShowFilters(true);
  };

  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
  };

  // All unique categories from the app
  const allCategories = DEFAULT_CATEGORIES;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with filter & search */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={openFilters} activeOpacity={0.7} style={styles.headerIconBtn}>
            <MaterialCommunityIcons
              name="filter"
              size={40}
              color={hasActiveFilters ? colors.accent : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Month Scroller */}
      <ScrollView
        ref={monthScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthScroller}
        style={styles.monthScrollerWrap}
      >
        {months.map((m) => {
          const isActive = m.month === selectedMonth;
          return (
            <TouchableOpacity
              key={m.month}
              onPress={() => setSelectedMonth(m.month)}
              style={styles.monthItem}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.monthText,
                  { color: isActive ? colors.text : colors.textTertiary },
                  isActive && styles.monthTextActive,
                ]}
              >
                {m.label}
              </Text>
              {isActive && (
                <View style={[styles.monthIndicator, { backgroundColor: colors.text }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Summary Bar */}
      <View style={[styles.summaryBar, { backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0' }]}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="arrow-down" size={12} color="#E57373" />
          <Text style={[styles.summaryAmount, { color: '#E57373' }]}>
            {formatCurrency(summary.expenses, currency)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="arrow-up" size={12} color="#66BB6A" />
          <Text style={[styles.summaryAmount, { color: '#66BB6A' }]}>
            {formatCurrency(summary.income, currency)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryEquals, { color: colors.textSecondary }]}>= </Text>
          <Text
            style={[
              styles.summaryAmount,
              { color: summary.net >= 0 ? '#66BB6A' : '#E57373' },
            ]}
          >
            {summary.net >= 0 ? '' : '-'}{formatCurrency(Math.abs(summary.net), currency)}
          </Text>
        </View>
      </View>

      {/* Transaction List or Empty State */}
      {monthTransactions.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters || searchQuery ? 'filter-off-outline' : 'receipt-text-outline'}
          title={hasActiveFilters || searchQuery ? 'No matching transactions' : `Nothing in ${MONTH_NAMES[selectedMonth]}`}
          subtitle={hasActiveFilters || searchQuery
            ? 'Try adjusting your filters or search to find what you\'re looking for.'
            : `No transactions recorded for ${MONTH_NAMES[selectedMonth]}. Tap + to log your first one.`}
          accentIcon={hasActiveFilters || searchQuery ? 'magnify' : 'plus-circle-outline'}
        />
      ) : (
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={collapseCard}
        >
          {dateGroups.map((group) => (
            <Pressable key={group.dateKey} style={styles.dateGroup} onPress={collapseCard}>
              {/* Date Header */}
              <View style={styles.dateHeader}>
                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                  {group.dateLabel}
                </Text>
                <Text style={[styles.dateTotalText, { color: colors.textSecondary }]}>
                  {group.dailyTotal >= 0 ? '' : '-'}{formatCurrency(Math.abs(group.dailyTotal), currency)}
                </Text>
              </View>

              {/* Transactions */}
              {group.transactions.map((t) => {
                const cat = getCategoryInfo(t.categoryId);
                const isExpense = t.type === 'expense';
                const isExpanded = expandedId === t.id;

                const cardContent = (
                  <>
                    <View style={styles.expenseInner}>
                      <View
                        style={[
                          styles.txnIconWrap,
                          { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={(cat?.icon as any) || 'cash'}
                          size={22}
                          color={isDark ? '#9E9E9E' : '#6B6B6B'}
                        />
                      </View>
                      <View style={styles.txnTextWrap}>
                        <Text
                          style={[styles.txnTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}
                          numberOfLines={1}
                        >
                          {t.title}
                        </Text>
                        {t.note ? (
                          <Text
                            style={[styles.txnNote, { color: isDark ? '#888888' : colors.textTertiary }]}
                            numberOfLines={1}
                          >
                            {t.note}
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.txnAmount,
                          { color: isExpense ? '#E57373' : '#66BB6A' },
                        ]}
                      >
                        {isExpense ? '▼ ' : '▲ '}
                        {formatCurrency(convertAmount(t.amount, t.currency || currency, currency), currency)}
                      </Text>
                    </View>

                    {/* Expanded edit area */}
                    {isExpanded && (
                      <View style={styles.expandedArea}>
                        <View style={styles.editRow}>
                          <View style={[styles.editInputWrap, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <TextInput
                              style={[styles.editInput, { color: isDark ? '#FFFFFF' : '#111111' }]}
                              value={editTitle}
                              onChangeText={setEditTitle}
                              placeholder="Title"
                              placeholderTextColor={isDark ? '#666' : '#999'}
                            />
                          </View>
                        </View>
                        <View style={styles.editRow}>
                          <View style={[styles.editInputWrap, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Text style={{ fontSize: 16, color: isDark ? '#666' : '#999', fontWeight: '600' }}>{getCurrencySymbol(currency)}</Text>
                            <TextInput
                              style={[styles.editInput, { color: isDark ? '#FFFFFF' : '#111111' }]}
                              value={editAmount}
                              onChangeText={setEditAmount}
                              placeholder="Amount"
                              placeholderTextColor={isDark ? '#666' : '#999'}
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                        <View style={styles.editRow}>
                          <View style={[styles.editInputWrap, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <TextInput
                              style={[styles.editInput, { color: isDark ? '#FFFFFF' : '#111111' }]}
                              value={editNote}
                              onChangeText={setEditNote}
                              placeholder="Note"
                              placeholderTextColor={isDark ? '#666' : '#999'}
                            />
                          </View>
                        </View>
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
                            onPress={() => handleSave(t.id)}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="check" size={20} color="#66BB6A" />
                            <Text style={[styles.saveBtnText, { color: isDark ? '#FFFFFF' : '#111111' }]}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.deleteBtn, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
                            onPress={() => handleDelete(t.id)}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="delete-outline" size={20} color="#E57373" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </>
                );

                const renderRightActions = () => (
                  <TouchableOpacity
                    style={styles.swipeDeleteBtn}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      deleteTransaction(t.id);
                      setExpandedId(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.swipeDeleteText}>Delete</Text>
                  </TouchableOpacity>
                );

                if (isDark) {
                  return (
                    <Swipeable key={t.id} renderRightActions={renderRightActions} overshootRight={false}>
                      <TouchableOpacity
                        onPress={() => expandCard(t)}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={isExpense ? ['#262626', '#0A0A0A'] : ['#192D29', '#262626', '#0A0A0A']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[
                            styles.gradientCard,
                            { borderWidth: 0.53, borderColor: '#262626' },
                          ]}
                        >
                          {cardContent}
                        </LinearGradient>
                      </TouchableOpacity>
                    </Swipeable>
                  );
                }

                return (
                  <Swipeable key={t.id} renderRightActions={renderRightActions} overshootRight={false}>
                    <TouchableOpacity
                      onPress={() => expandCard(t)}
                      activeOpacity={0.85}
                      style={[
                        styles.gradientCard,
                        {
                          backgroundColor: '#FFFFFF',
                          borderWidth: 1,
                          borderColor: isExpense ? '#E5E5EA' : '#C8E6C9',
                        },
                      ]}
                    >
                      {cardContent}
                    </TouchableOpacity>
                  </Swipeable>
                );
              })}
            </Pressable>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerCashFlow, { color: colors.textSecondary }]}>
              Total cash flow: {totalCashFlow >= 0 ? '' : '-'}{formatCurrency(Math.abs(totalCashFlow), currency)}
            </Text>
            <Text style={[styles.footerCount, { color: colors.textTertiary }]}>
              {totalCount} transaction{totalCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Category Breakdown Donut Chart */}
          {categoryBreakdown.length > 0 && (
            <View style={[styles.chartSection, { backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0' }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Spending by Category
              </Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={categoryBreakdown}
                  donut
                  radius={90}
                  innerRadius={80}
                  innerCircleColor={isDark ? '#1A1A1A' : '#F0F0F0'}
                  centerLabelComponent={() => (
                    <View style={styles.chartCenter}>
                      <Text style={[styles.chartCenterAmount, { color: colors.text }]}>
                        {formatCurrency(summary.expenses, currency)}
                      </Text>
                      <Text style={[styles.chartCenterLabel, { color: colors.textSecondary }]}>
                        Total
                      </Text>
                    </View>
                  )}
                />
              </View>
              <View style={styles.legendContainer}>
                {categoryBreakdown.map((item) => {
                  const pct = summary.expenses > 0 ? ((item.value / summary.expenses) * 100).toFixed(1) : '0';
                  return (
                    <View key={item.label} style={styles.legendRow}>
                      <View style={styles.legendLeft}>
                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                        <MaterialCommunityIcons name={item.icon} size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                        <Text style={[styles.legendLabel, { color: colors.text }]}>{item.label}</Text>
                      </View>
                      <View style={styles.legendRight}>
                        <Text style={[styles.legendAmount, { color: colors.text }]}>
                          {formatCurrency(item.value, currency)}
                        </Text>
                        <Text style={[styles.legendPct, { color: colors.textTertiary }]}>
                          {pct}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
          />
          <View
            style={[
              styles.filterSheet,
              { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            ]}
          >
            <Text style={[styles.filterTitle, { color: colors.text }]}>Filters</Text>

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroller}
              style={styles.categorySectionWrap}
            >
              {/* All */}
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' },
                  draftFilters.categoryId === null && {
                    backgroundColor: isDark ? '#3A3A3C' : '#D0D0D5',
                    borderColor: colors.accent,
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => setDraftFilters((f) => ({ ...f, categoryId: null }))}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryChipIcon,
                    { backgroundColor: isDark ? '#48484A' : '#C7C7CC' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="shape-outline"
                    size={24}
                    color={isDark ? '#D1D1D6' : '#636366'}
                  />
                </View>
                <Text style={[styles.categoryChipLabel, { color: colors.text }]}>All</Text>
              </TouchableOpacity>
              {allCategories.map((cat) => {
                const isActive = draftFilters.categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' },
                      isActive && {
                        backgroundColor: isDark ? '#3A3A3C' : '#D0D0D5',
                        borderColor: colors.accent,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() => setDraftFilters((f) => ({ ...f, categoryId: cat.id }))}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.categoryChipIcon,
                        { backgroundColor: isDark ? '#48484A' : '#C7C7CC' },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={cat.icon as any}
                        size={24}
                        color={isDark ? '#D1D1D6' : '#636366'}
                      />
                    </View>
                    <Text style={[styles.categoryChipLabel, { color: colors.text }]}>
                      {cat.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Type Filter: Income / Expense */}
            <Text style={[styles.filterSectionLabel, { color: colors.textSecondary }]}>Type</Text>
            <View style={styles.chipRow}>
              {(['all', 'income', 'expense'] as const).map((type) => {
                const isActive = draftFilters.type === type;
                const chipBorderColor =
                  type === 'income'
                    ? '#66BB6A'
                    : type === 'expense'
                    ? '#E57373'
                    : colors.textTertiary;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      {
                        borderColor: isActive ? chipBorderColor : isDark ? '#3A3A3C' : '#D1D1D6',
                        backgroundColor: isActive
                          ? isDark
                            ? '#2C2C2E'
                            : '#F5F5F5'
                          : 'transparent',
                      },
                    ]}
                    onPress={() => setDraftFilters((f) => ({ ...f, type }))}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        {
                          color: isActive
                            ? chipBorderColor
                            : isDark
                            ? '#8E8E93'
                            : '#6B7280',
                        },
                      ]}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title Search */}
            <View
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  borderColor: isDark ? '#3A3A3C' : '#D1D1D6',
                },
              ]}
            >
              <TextInput
                placeholder="Title contains..."
                placeholderTextColor={colors.textTertiary}
                value={draftFilters.titleSearch}
                onChangeText={(text) => setDraftFilters((f) => ({ ...f, titleSearch: text }))}
                style={[styles.searchInputText, { color: colors.text }]}
              />
              <MaterialCommunityIcons
                name="format-title"
                size={20}
                color={colors.textTertiary}
              />
            </View>

            {/* Notes Search */}
            <View
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  borderColor: isDark ? '#3A3A3C' : '#D1D1D6',
                },
              ]}
            >
              <TextInput
                placeholder="Notes contain..."
                placeholderTextColor={colors.textTertiary}
                value={draftFilters.noteSearch}
                onChangeText={(text) => setDraftFilters((f) => ({ ...f, noteSearch: text }))}
                style={[styles.searchInputText, { color: colors.text }]}
              />
              <MaterialCommunityIcons
                name="note-text-outline"
                size={20}
                color={colors.textTertiary}
              />
            </View>

            {/* Buttons */}
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  styles.filterBtnReset,
                  { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' },
                ]}
                onPress={resetFilters}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterBtnText, { color: '#FFFF' }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  styles.filterBtnApply,
                  { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' },
                ]}
                onPress={applyFilters}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterBtnText, { color: '#FFFF' }]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    padding: 4,
  },

  // Month Scroller
  monthScrollerWrap: {
    flexGrow: 0,
  },
  monthScroller: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 24,
  },
  monthItem: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '500',
  },
  monthTextActive: {
    fontWeight: '700',
  },
  monthIndicator: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    marginTop: 6,
  },

  // Summary Bar
  summaryBar: {
    flexDirection: 'row',
    marginHorizontal: 18,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryAmount: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 2,
  },
  summaryEquals: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Transaction List
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },

  // Date Group
  dateGroup: {
    marginBottom: 4,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateTotalText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Transaction Card (gradient)
  gradientCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 11,
  },
  expenseInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  txnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txnTextWrap: {
    flex: 1,
  },
  txnTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  txnNote: {
    fontSize: 12,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Expanded edit area
  expandedArea: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  editRow: {
    marginBottom: 8,
  },
  editInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 9,
    gap: 6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 9,
  },

  // Swipe to delete
  swipeDeleteBtn: {
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 14,
    marginBottom: 11,
    marginLeft: 8,
  },
  swipeDeleteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerCashFlow: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  footerCount: {
    fontSize: 12,
    fontWeight: '400',
  },

  // Filter Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Category chips
  categorySectionWrap: {
    flexGrow: 0,
    marginBottom: 18,
  },
  categoryScroller: {
    gap: 12,
    paddingVertical: 4,
  },
  categoryChip: {
    alignItems: 'center',
    borderRadius: 14,
    paddingTop: 5,
    paddingHorizontal: 8,
    width: 80,
  },
  categoryChipIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryChipLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop : 1,
    paddingBottom: 0
  },

  // Type chips
  filterSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  typeChip: {
    borderWidth: 1.5,
    borderRadius: 17,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Search inputs
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 12,
  },
  searchInputText: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // Buttons
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  filterBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 7,
    alignItems: 'center',
  },
  filterBtnReset: {},
  filterBtnApply: {},
  filterBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },

  // Category Breakdown Chart
  chartSection: {
    marginTop: 8,
    borderRadius: 10,
    padding: 18,
  },
  chartTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  chartCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterAmount: {
    fontSize: 20,
    fontWeight: '500',
  },
  chartCenterLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  legendContainer: {
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  legendPct: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 42,
    textAlign: 'right',
  },
});
