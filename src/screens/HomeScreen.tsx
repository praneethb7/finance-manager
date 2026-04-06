import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import SpendingBarChart from '../components/SpendingBarChart';

const { width } = Dimensions.get('window');

function MiniDonutChart({
  segments,
  size = 56,
}: {
  segments: { color: string; fraction: number }[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const strokeW = 6;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const pt = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });

  const gap = 4;
  let angle = -90;

  return (
    <Svg width={size} height={size}>
      {segments.map((seg, i) => {
        const sweep = 360 * seg.fraction - gap;
        if (sweep <= 0) return null;
        const start = angle;
        const end = angle + sweep;
        angle = end + gap;
        const p1 = pt(start);
        const p2 = pt(end);
        const large = sweep > 180 ? 1 : 0;
        return (
          <Path
            key={i}
            d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`}
            stroke={seg.color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </Svg>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { transactions, getMonthlyStats } = useTransactions();

  const now = new Date();
  const stats = getMonthlyStats(now.getMonth(), now.getFullYear());

  const firstName = user?.name?.split(' ')[0] || 'there';

  // Get this week's transactions
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weeklyExpenses = useMemo(
    () =>
      transactions
        .filter(
          (t) => t.type === 'expense' && new Date(t.date) >= weekStart
        )
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  // Spending by category for this month
  const categorySpending = useMemo(() => {
    const monthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'expense' &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
    const map: Record<string, number> = {};
    monthTxns.forEach((t) => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([id, amount]) => ({
        category: DEFAULT_CATEGORIES.find((c) => c.id === id),
        amount,
      }))
      .filter((c) => c.category)
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Top 2 expense categories
  const topCategories = categorySpending.slice(0, 2);

  // Weekly bar chart data (last 7 days)
  const barData = useMemo(() => {
    const days: { value1: number; value2: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayExpenses = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            new Date(t.date) >= date &&
            new Date(t.date) < nextDay
        )
        .reduce((s, t) => s + t.amount, 0);

      const dayIncome = transactions
        .filter(
          (t) =>
            t.type === 'income' &&
            new Date(t.date) >= date &&
            new Date(t.date) < nextDay
        )
        .reduce((s, t) => s + t.amount, 0);

      days.push({ value1: dayExpenses, value2: dayIncome });
    }
    return days;
  }, [transactions]);

  const weeklyBudget = 1000;
  const weeklyProgress = Math.min(weeklyExpenses / weeklyBudget, 1);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[styles.avatar, { backgroundColor: colors.text }]}
          >
            <Text style={[styles.avatarText, { color: colors.background }]}>
              {(user?.name?.[0] || 'P').toUpperCase()}
              {(user?.name?.split(' ')[1]?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color={colors.text}
              />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <Text style={[styles.greeting, { color: colors.text }]}>
          Hey, {firstName}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Add yesterday's expenses, yesterday's expenses{'\n'}
          are yesterday's, yesterday's expired
        </Text>

        {/* Hero Card */}
        <LinearGradient
          colors={['#FED4B4', '#3BB9A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Card top row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardLogoRow}>
              <MiniDonutChart
                segments={[
                  { color: '#FFFFFF', fraction: 0.35 },
                  { color: 'rgba(255,255,255,0.4)', fraction: 0.25 },
                  { color: 'rgba(255,255,255,0.6)', fraction: 0.22 },
                  { color: 'rgba(255,255,255,0.8)', fraction: 0.18 },
                ]}
                size={40}
              />
              <Text style={styles.cardBankName}>ADRB Bank</Text>
            </View>
          </View>

          {/* Balance */}
          <View style={styles.cardBalance}>
            <Text style={styles.cardBalanceLabel}>ALEX</Text>
            <Text style={styles.cardBalanceAmount}>
              ${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          {/* Card numbers */}
          <View style={styles.cardNumberRow}>
            <Text style={styles.cardNumber}>8711</Text>
            <Text style={styles.cardNumber}>1222</Text>
            <Text style={styles.cardNumber}>2222</Text>
          </View>

          {/* Card bottom */}
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardSmallLabel}>Card Holder Name</Text>
              <Text style={styles.cardSmallValue}>
                {user?.name || 'Alex'}
              </Text>
            </View>
            <View>
              <Text style={styles.cardSmallLabel}>Expired Date</Text>
              <Text style={styles.cardSmallValue}>10/28</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Your Expenses Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your expenses
        </Text>

        {/* Weekly / Monthly Toggle */}
        <View
          style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        >
          <View style={[styles.toggleActive, { backgroundColor: '#FFFFFF' }]}>
            <Text style={styles.toggleActiveText}>Weekly</Text>
          </View>
          <View style={styles.toggleInactive}>
            <Text style={[styles.toggleInactiveText, { color: colors.textSecondary }]}>
              Monthly
            </Text>
          </View>
        </View>

        {/* Spending Cards */}
        {topCategories.length > 0 ? (
          <View style={styles.expenseCardsRow}>
            {topCategories.map((item, index) => {
              const cat = item.category!;
              const total = stats.expenses || 1;
              const fraction = item.amount / total;
              const otherFraction = 1 - fraction;

              return (
                <LinearGradient
                  key={cat.id}
                  colors={
                    index === 0
                      ? [colors.card, colors.background]
                      : ['#192D29', colors.card, colors.background]
                  }
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[
                    styles.expenseCard,
                    { borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.expenseCardContent}>
                    <View style={styles.expenseCardLeft}>
                      {/* Stars */}
                      <View style={styles.starsRow}>
                        <MaterialCommunityIcons
                          name="star"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.ratingText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {(fraction * 5).toFixed(1)}
                        </Text>
                      </View>

                      {/* Amount badge */}
                      <View
                        style={[
                          styles.amountBadge,
                          { backgroundColor: colors.card, borderColor: colors.cardBorder },
                        ]}
                      >
                        <Text style={[styles.amountBadgeText, { color: colors.text }]}>
                          ${item.amount.toLocaleString()}
                        </Text>
                      </View>

                      {/* Category name */}
                      <Text style={[styles.categoryTitle, { color: colors.text }]}>
                        {cat.name.toUpperCase()}
                      </Text>

                      {/* Subtext */}
                      <Text
                        style={[
                          styles.categorySubtext,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Less than last week
                      </Text>
                    </View>

                    <View style={styles.expenseCardRight}>
                      <MiniDonutChart
                        segments={[
                          { color: cat.color, fraction },
                          { color: colors.cardBorder, fraction: otherFraction },
                        ]}
                        size={56}
                      />
                    </View>
                  </View>
                </LinearGradient>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No expenses yet this month.{'\n'}Tap + to add your first transaction.
            </Text>
          </View>
        )}

        {/* Bar Chart */}
        <SpendingBarChart
          data={barData}
          maxValue={Math.max(weeklyBudget, weeklyExpenses, 100)}
          spent={weeklyExpenses}
          budget={weeklyBudget}
          title="Weekly spending"
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <MaterialCommunityIcons name="plus" size={28} color="#171717" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#D53436',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: '#171717',
    fontSize: 11,
    fontWeight: '700',
  },
  // Greeting
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  // Hero Card
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardBankName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBalance: {
    marginBottom: 12,
  },
  cardBalanceLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 2,
  },
  cardBalanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  cardNumberRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cardNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardSmallLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardSmallValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Section
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
    borderWidth: 0.5,
  },
  toggleActive: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleActiveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171717',
  },
  toggleInactive: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleInactiveText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Expense Cards
  expenseCardsRow: {
    gap: 12,
    marginBottom: 20,
  },
  expenseCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  expenseCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseCardLeft: {
    flex: 1,
  },
  expenseCardRight: {
    marginLeft: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    marginBottom: 10,
  },
  amountBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  categorySubtext: {
    fontSize: 11,
  },
  // Empty
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
