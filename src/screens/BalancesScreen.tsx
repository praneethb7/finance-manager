import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useCurrency } from '../context/CurrencyContext';
import CreditScoreGauge from '../components/CreditScoreGauge';
import SpendingBarChart from '../components/SpendingBarChart';
import EmptyState from '../components/EmptyState';

export default function BalancesScreen() {
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';
  const { transactions, getMonthlyStats } = useTransactions();
  const { currency, toggleCurrency } = useCurrency();

  const now = new Date();
  const stats = getMonthlyStats(now.getMonth(), now.getFullYear(), currency);

  const barData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const s = getMonthlyStats(d.getMonth(), d.getFullYear(), currency);
      data.push({
        value1: s.expenses,
        value2: s.income,
      });
    }
    return data;
  }, [transactions, currency]);

  const creditScore = useMemo(() => {
    if (stats.income === 0 && stats.expenses === 0) return 660;
    const ratio = stats.income > 0 ? 1 - (stats.expenses / stats.income) : 0;
    return Math.round(300 + ratio * 550);
  }, [stats]);

  // Show the "other" currency card — the one you can switch TO
  const isCAD = currency === 'CAD';
  const cardFlag = isCAD ? '🇮🇳' : '🇨🇦';
  const cardCode = isCAD ? 'INR' : 'CAD';
  const cardName = isCAD ? 'Indian Rupee' : 'Canadian Dollar';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>Your Balances</Text>
        <Text style={[styles.subheading, { color: colors.textSecondary }]}>
          Manage your multi-currency accounts
        </Text>

        <CreditScoreGauge score={creditScore} />
        <Text style={[styles.scoreLabel, { color: colors.text }]}>
          Your Credit Score is {creditScore >= 700 ? 'good' : creditScore >= 600 ? 'average' : 'low'}
        </Text>
        <Text style={[styles.scoreDate, { color: colors.textTertiary }]}>
          Last Check on {now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Currencies</Text>

        

        {/* Card for the OTHER currency (the one to switch to) */}
        <View style={[styles.currencyCardOuter, !isDark && { shadowColor: '#000', shadowOpacity: 0.08 }]}>
          <LinearGradient
            colors={isDark ? ['#262626', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.currencyCard, { borderColor: isDark ? '#262626' : '#E5E5EA' }]}
          >
            {isDark && <View style={styles.innerShadowLight} pointerEvents="none" />}
            {isDark && <View style={styles.innerShadowDark} pointerEvents="none" />}
            <View style={styles.currencyLeft}>
              <Text style={styles.flag}>{cardFlag}</Text>
              <View>
                <Text style={[styles.currencyCode, { color: colors.text }]}>{cardCode}</Text>
                <Text style={[styles.currencyName, { color: colors.textSecondary }]}>{cardName}</Text>
              </View>
            </View>
            <View style={styles.currencyRight}>
              <TouchableOpacity>
                <MaterialCommunityIcons name="star-outline" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.enableButton, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#D1D5DB' }]}
                onPress={toggleCurrency}
              >
                <MaterialCommunityIcons name="swap-horizontal" size={14} color={colors.text} />
                <Text style={[styles.enableText, { color: colors.text }]}>Enable</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {transactions.length === 0 ? (
          <EmptyState
            icon="chart-bar"
            title="No spending data yet"
            subtitle="Start tracking your income and expenses to see your spending trends here."
            accentIcon="trending-up"
          />
        ) : (
          <SpendingBarChart
            data={barData}
            spent={stats.expenses}
            budget={stats.income}
            title={`Current margin: ${new Date().toLocaleString('default', { month: 'long' })} Spendings`}
          />
        )}

        {/* Bottom spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  subheading: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  scoreDate: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  activeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  currencyCardOuter: {
    marginBottom: 25,
    borderRadius: 14,
    shadowColor: '#FAFAFA',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  currencyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 0.53,
    borderColor: '#262626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 65,
    overflow: 'hidden',
  },
  innerShadowLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    shadowColor: '#FAFAFA',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
  },
  innerShadowDark: {
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
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flag: {
    fontSize: 24,
  },
  currencyCode: {
    fontSize: 15,
    fontWeight: '700',
  },
  currencyName: {
    fontSize: 12,
  },
  currencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  enableText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
