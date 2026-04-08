import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import EmptyState from '../components/EmptyState';

export default function StatsScreen() {
  const { colors } = useTheme();
  const { transactions } = useTransactions();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {transactions.length === 0 ? (
        <EmptyState
          icon="chart-line"
          title="No stats to show"
          subtitle="Once you start logging transactions, detailed charts and insights will appear here."
          accentIcon="finance"
        />
      ) : (
        <EmptyState
          icon="chart-areaspline"
          title="Stats coming soon"
          subtitle="We're building detailed analytics and insights for your spending habits. Stay tuned!"
          accentIcon="rocket-launch-outline"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
