import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import CreditScoreGauge from '../components/CreditScoreGauge';
import SpendingBarChart from '../components/SpendingBarChart';

export default function BalancesScreen() {
  const { colors } = useTheme();
  const { transactions, getMonthlyStats } = useTransactions();

  const now = new Date();
  const stats = getMonthlyStats(now.getMonth(), now.getFullYear());

  const barData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const s = getMonthlyStats(d.getMonth(), d.getFullYear());
      data.push({
        value1: s.expenses || (Math.random() * 400 + 100),
        value2: s.income || (Math.random() * 600 + 200),
      });
    }
    return data;
  }, [transactions]);

  const creditScore = useMemo(() => {
    if (stats.income === 0 && stats.expenses === 0) return 660;
    const ratio = stats.income > 0 ? 1 - (stats.expenses / stats.income) : 0;
    return Math.round(300 + ratio * 550);
  }, [stats]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.logoSmall}>
            <Text style={styles.logoSmallText}>P</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>PayU</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="magnify" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
        <LinearGradient
          colors={['#262626', '#0A0A0A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.currencyCard}
        >
          <View style={styles.currencyLeft}>
            <Text style={styles.flag}>🇨🇦</Text>
            <View>
              <Text style={[styles.currencyCode, { color: colors.text }]}>CAD</Text>
              <Text style={[styles.currencyName, { color: colors.textSecondary }]}>Canadian Dollar</Text>
            </View>
          </View>
          <View style={styles.currencyRight}>
            <TouchableOpacity>
              <MaterialCommunityIcons name="star-outline" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.enableButton, { borderColor: 'rgba(255,255,255,0.15)' }]}>
              <MaterialCommunityIcons name="plus" size={14} color={colors.text} />
              <Text style={[styles.enableText, { color: colors.text }]}>Enable</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <SpendingBarChart
          data={barData}
          spent={stats.expenses || 350}
          budget={stats.income || 640}
          title="Current margin: April Spendings"
        />

        {/* Bottom spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.text }]}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoSmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSmallText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  appName: {
    fontSize: 17,
    fontWeight: '700',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -7,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
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
  currencyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#262626',
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 20,
    shadowColor: '#FAFAFA',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
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
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
