import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useSearch } from '../context/SearchContext';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function LogoIcon({
  size = 24,
  color = '#FFFFFF',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <ClipPath id="logoClip">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#logoClip)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.3334 7.01118C14.3467 6.3519 13.1867 6 12 6V0C14.3734 0 16.6934 0.703788 18.6668 2.02237C20.6402 3.34094 22.1783 5.21509 23.0866 7.40778C23.9948 9.60048 24.2324 12.0133 23.7694 14.3411C23.3064 16.6688 22.1635 18.8071 20.4853 20.4853C18.8071 22.1635 16.6688 23.3064 14.3411 23.7694C12.0133 24.2324 9.60048 23.9948 7.40778 23.0866C5.21509 22.1783 3.34094 20.6402 2.02237 18.6668C0.703788 16.6934 0 14.3734 0 12H6C6 13.1867 6.3519 14.3467 7.01118 15.3334C7.67046 16.3201 8.60754 17.0891 9.70392 17.5433C10.8002 17.9974 12.0067 18.1162 13.1705 17.8847C14.3344 17.6532 15.4035 17.0818 16.2427 16.2427C17.0818 15.4035 17.6532 14.3344 17.8847 13.1705C18.1162 12.0067 17.9974 10.8002 17.5433 9.70392C17.0891 8.60754 16.3201 7.67046 15.3334 7.01118Z"
          fill={color}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 2.59875e-06C6 0.787934 5.84481 1.56815 5.54328 2.2961C5.24175 3.02406 4.79979 3.68549 4.24264 4.24264C3.68549 4.7998 3.02406 5.24175 2.2961 5.54328C1.56814 5.84481 0.787929 6 2.62266e-07 6L0 12C1.57586 12 3.13629 11.6896 4.5922 11.0866C6.04812 10.4835 7.371 9.59958 8.48526 8.48526C9.59958 7.371 10.4835 6.04812 11.0866 4.5922C11.6896 3.13629 12 1.57586 12 0L6 2.59875e-06Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}

function ExpenseRow({
  title,
  subtitle,
  amount,
  highlighted = false,
  iconName,
  isDark,
  starred,
  onToggleStar,
}: {
  title: string;
  subtitle: string;
  amount: string;
  highlighted?: boolean;
  iconName?: string;
  isDark: boolean;
  starred: boolean;
  onToggleStar: () => void;
}) {
  const inner = (
    <View style={styles.expenseInner}>
      <View style={[styles.expenseIconWrap, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
        {iconName ? (
          <MaterialCommunityIcons name={iconName as any} size={26} color={isDark ? '#FFFFFF' : '#3A3A3C'} />
        ) : (
          <LogoIcon size={26} color={isDark ? '#FFFFFF' : '#3A3A3C'} />
        )}
      </View>
      <View style={styles.expenseTextWrap}>
        <Text style={[styles.expenseTitle, !isDark && { color: '#111111' }]}>{title}</Text>
        <Text
          style={[
            styles.expenseSubtitle,
            highlighted && styles.expenseSubtitleHighlighted,
          ]}
        >
          {subtitle}
        </Text>
      </View>
      <TouchableOpacity onPress={onToggleStar} activeOpacity={0.7}>
        <MaterialCommunityIcons
          name={starred ? 'star' : 'star-outline'}
          size={22}
          color={starred ? '#FFD700' : isDark ? '#3D3D3D' : '#CCCCCC'}
          style={styles.starIcon}
        />
      </TouchableOpacity>
      <View
        style={[
          styles.amountBadge,
          !isDark && { backgroundColor: '#F0F0F0' },
          highlighted && (isDark ? styles.amountBadgeHighlighted : { backgroundColor: '#E8F5E9' }),
        ]}
      >
        <Text style={[styles.amountText, !isDark && { color: '#111111' }]}>{amount}</Text>
      </View>
    </View>
  );

  if (isDark) {
    return (
      <View style={styles.expenseRowOuter}>
        <LinearGradient
          colors={
            highlighted
              ? ['#192D29', '#262626', '#0A0A0A']
              : ['#262626', '#0A0A0A']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.expenseRow,
            highlighted ? styles.expenseRowHighlighted : styles.expenseRowDefault,
          ]}
        >
          <View style={styles.expenseInnerShadowLight} pointerEvents="none" />
          <View style={styles.expenseInnerShadowDark} pointerEvents="none" />
          {inner}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.expenseRow,
        {
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: highlighted ? '#C8E6C9' : '#E5E5EA',
        },
      ]}
    >
      {inner}
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { mode, colors } = useTheme();
  const { transactions, getMonthlyStats } = useTransactions();
  const { searchQuery } = useSearch();
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [starredTitles, setStarredTitles] = useState<Set<string>>(new Set());
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isDark = mode === 'dark';

  const toggleStar = (title: string) => {
    setStarredTitles((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const firstName = user?.name?.split(' ')[0] || 'Alex';

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === 'weekly' ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
  }, [activeTab]);

  const topExpenses = useMemo(() => {
    const now = new Date();
    const isWeekly = activeTab === 'weekly';

    // Current period boundaries
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentCutoff = isWeekly ? startOfWeek : startOfMonth;

    // Previous period boundaries
    const prevWeekStart = new Date(startOfWeek);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevCutoff = isWeekly ? prevWeekStart : prevMonthStart;
    const prevEnd = currentCutoff;

    const expenseTxns = transactions.filter((t) => t.type === 'expense');

    // Current period grouped by title
    const currentByTitle: Record<string, { total: number; categoryId: string }> = {};
    for (const t of expenseTxns) {
      if (new Date(t.date) >= currentCutoff) {
        if (!currentByTitle[t.title]) {
          currentByTitle[t.title] = { total: 0, categoryId: t.categoryId };
        }
        currentByTitle[t.title].total += t.amount;
      }
    }

    // Previous period grouped by title
    const prevByTitle: Record<string, number> = {};
    for (const t of expenseTxns) {
      const d = new Date(t.date);
      if (d >= prevCutoff && d < prevEnd) {
        prevByTitle[t.title] = (prevByTitle[t.title] || 0) + t.amount;
      }
    }

    const periodLabel = isWeekly ? 'week' : 'month';

    return Object.entries(currentByTitle)
      .filter(([title]) =>
        !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b[1].total - a[1].total)
      .map(([title, { total, categoryId }]) => {
        const cat = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
        const prevTotal = prevByTitle[title];
        let subtitle: string;
        let isMore = false;
        if (prevTotal == null) {
          subtitle = `New spend this ${periodLabel}`;
        } else if (total > prevTotal) {
          subtitle = `More than last ${periodLabel}`;
          isMore = true;
        } else if (total < prevTotal) {
          subtitle = `Less than last ${periodLabel}`;
        } else {
          subtitle = `Same as last ${periodLabel}`;
        }
        return { title, total, cat, subtitle, isMore };
      });
  }, [transactions, activeTab, searchQuery]);


  const monthlyStats = useMemo(() => {
    const now = new Date();
    return getMonthlyStats(now.getMonth(), now.getFullYear());
  }, [getMonthlyStats]);

  const cardWidth = SCREEN_WIDTH - 80;
  const cardHeight = cardWidth / 1.586;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.safe, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={[styles.greeting, { color: colors.text }]}>Hey, {firstName}</Text>
        <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>Add your yesterday's expense</Text>

        {/* Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#FED4B4', '#3BB9A1']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            style={[styles.card, { width: cardWidth, height: cardHeight }]}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardBankName}>ADRBank</Text>
              <View style={styles.cardLogoCircle}>
                <LogoIcon size={20} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.cardNumber}>8763 1111 2222 0329</Text>
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>Card Holder Name</Text>
                <Text style={styles.cardValue}>{(user?.name || 'USER').toUpperCase()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardLabel}>Expired Date</Text>
                <Text style={styles.cardValue}>10/28</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Your expenses */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your expenses</Text>

        {/* Toggle */}
        <View style={[styles.toggleWrap, { backgroundColor: isDark ? '#1C1C1C' : '#E8E8ED' }]}>
          <Animated.View
            style={[
              styles.toggleIndicator,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#FFFFFF',
                left: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '50%'],
                }),
              },
            ]}
          />
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setActiveTab('weekly')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.toggleText,
                { color: isDark ? '#666666' : '#999999' },
                activeTab === 'weekly' && { color: '#111111', fontWeight: '600' },
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setActiveTab('monthly')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.toggleText,
                { color: isDark ? '#666666' : '#999999' },
                activeTab === 'monthly' && { color: '#111111', fontWeight: '600' },
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expense rows */}
        <View style={styles.expenseList}>
          {topExpenses.length > 0 ? (
            topExpenses.map(({ title, total, cat, subtitle, isMore }, index) => (
              <ExpenseRow
                key={title}
                title={title.toUpperCase()}
                subtitle={subtitle}
                amount={formatCurrency(total)}
                highlighted={isMore || index === 0}
                iconName={cat?.icon}
                isDark={isDark}
                starred={starredTitles.has(title)}
                onToggleStar={() => toggleStar(title)}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No expenses yet. Tap + to add one.</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },

  // Content
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  // Greeting
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 14,
    marginBottom: 20,
  },

  // Card
  cardWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBankName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cardLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: 50,
    padding: 4,
    marginBottom: 14,
    position: 'relative',
  },
  toggleIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '50%',
    borderRadius: 50,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Expense List
  expenseList: {
    gap: 10,
  },
  expenseRowOuter: {
    borderRadius: 14,
    shadowColor: '#FAFAFA',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  expenseRow: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  expenseRowDefault: {
    borderWidth: 0.53,
    borderColor: '#262626',
  },
  expenseRowHighlighted: {
    borderWidth: 0.53,
    borderColor: '#262626',
  },
  expenseInnerShadowLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    shadowColor: '#FAFAFA',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
  },
  expenseInnerShadowDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 7,
  },
  expenseInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  expenseIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  expenseTextWrap: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  expenseSubtitle: {
    fontSize: 12,
    color: '#888888',
  },
  expenseSubtitleHighlighted: {
    color: '#6BADA0',
  },
  starIcon: {
    marginRight: 12,
  },
  amountBadge: {
    backgroundColor: '#252525',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  amountBadgeHighlighted: {
    backgroundColor: '#1A302C',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Monthly Summary
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
  },
});
