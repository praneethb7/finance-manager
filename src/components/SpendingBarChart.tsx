import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface BarData {
  value1: number; // gradient bar
  value2: number; // dark bar (taller background)
}

interface Props {
  data: BarData[];
  spent: number;
  budget: number;
  title: string;
}

export default function SpendingBarChart({ data, spent, budget, title }: Props) {
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';
  const chartHeight = 130;

  // Compute max from actual data, with a sensible minimum
  const dataMax = Math.max(...data.map((b) => Math.max(b.value1, b.value2)), 1);
  const maxValue = Math.ceil(dataMax / 100) * 100 || 100; // round up to nearest 100

  // Dynamic y-axis labels: top, 2/3, 1/3, 0
  const yLabels = [
    `₹${maxValue}`,
    `₹${Math.round((maxValue * 2) / 3)}`,
    `₹${Math.round(maxValue / 3)}`,
    '₹0',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {/* Y labels */}
        <View style={styles.yAxis}>
          {yLabels.map((label, i) => (
            <Text key={i} style={[styles.yLabel, { color: isDark ? '#464646' : '#999999' }]}>{label}</Text>
          ))}
        </View>

        {/* Chart body */}
        <View style={styles.chartBody}>
          {/* Grid lines — dashed, light */}
          {yLabels.map((_, i) => (
            <View
              key={i}
              style={[
                styles.gridLine,
                {
                  top: (i / (yLabels.length - 1)) * chartHeight,
                  borderColor: isDark ? 'rgba(204,204,204,0.4)' : 'rgba(0,0,0,0.1)',
                },
              ]}
            />
          ))}

          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((bar, i) => {
              const h1 = Math.max((bar.value1 / maxValue) * chartHeight, 8);
              const h2 = Math.max((bar.value2 / maxValue) * chartHeight, 8);
              return (
                <View key={i} style={[styles.barGroup, { height: Math.max(h1, h2) }]}>
                  {/* Dark bar behind gradient bar */}
                  <View style={[styles.bar, styles.darkBar, { height: h2, position: 'absolute', left: 0, bottom: 0, backgroundColor: isDark ? '#262626' : '#E0E0E0' }]}>
                    {[0, 1, 2, 3, 4].map((j) => (
                      <View key={j} style={[styles.barLine, { backgroundColor: isDark ? '#262626' : '#E0E0E0', borderRightColor: isDark ? '#333' : '#CCC' }]} />
                    ))}
                  </View>
                  {/* Gradient bar: peach top → teal bottom, overlapping */}
                  <LinearGradient
                    colors={['#F6D2B3', '#3FB9A2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.bar, { height: h1, position: 'absolute', left: 4, bottom: 0 }]}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerTitle, { color: isDark ? '#7A7A7A' : '#999999' }]}>{title}</Text>
        <View style={styles.footerValues}>
          <Text style={[styles.footerAmount, { color: isDark ? '#6B8A7A' : '#4A7A6A' }]}>₹{spent.toFixed(2)}</Text>
          <Text style={[styles.footerSlash, { color: isDark ? '#6B8A7A' : '#4A7A6A' }]}> / </Text>
          <Text style={[styles.footerAmount, { color: isDark ? '#6B8A7A' : '#4A7A6A' }]}>₹{budget.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  chartArea: {
    flexDirection: 'row',
    height: 130,
  },
  yAxis: {
    width: 42,
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  yLabel: {
    fontSize: 10,
    textAlign: 'right',
  },
  chartBody: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    borderStyle: 'dashed',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: 4,
  },
  barGroup: {
    position: 'relative',
    width: 28,
    alignItems: 'flex-end',
  },
  bar: {
    width: 18,
    borderRadius: 4,
    overflow: 'hidden',
  },
  darkBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  barLine: {
    width: 1,
    height: '100%',
    borderRightWidth: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: 42,
  },
  footerTitle: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  footerValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  footerSlash: {
    fontSize: 13,
  },
});
