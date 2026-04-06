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
  maxValue?: number;
  spent: number;
  budget: number;
  title: string;
}

export default function SpendingBarChart({ data, maxValue = 1000, spent, budget, title }: Props) {
  const { colors } = useTheme();
  const yLabels = ['$1000', '$500', '$200', '$0'];
  const chartHeight = 130;

  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {/* Y labels */}
        <View style={styles.yAxis}>
          {yLabels.map((label, i) => (
            <Text key={i} style={styles.yLabel}>{label}</Text>
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
                { top: (i / (yLabels.length - 1)) * chartHeight },
              ]}
            />
          ))}

          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((bar, i) => {
              const h1 = Math.max((bar.value1 / maxValue) * chartHeight, 8);
              const h2 = Math.max((bar.value2 / maxValue) * chartHeight, 8);
              return (
                <View key={i} style={styles.barGroup}>
                  {/* Dark bar with vertical line texture */}
                  <View style={[styles.bar, styles.darkBar, { height: h2 }]}>
                    {[0, 1, 2, 3, 4].map((j) => (
                      <View key={j} style={styles.barLine} />
                    ))}
                  </View>
                  {/* Gradient bar: peach top → teal bottom */}
                  <LinearGradient
                    colors={['#F6D2B3', '#3FB9A2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.bar, { height: h1 }]}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>{title}</Text>
        <View style={styles.footerValues}>
          <Text style={styles.footerAmount}>${spent.toFixed(2)}</Text>
          <Text style={styles.footerSlash}> / </Text>
          <Text style={styles.footerAmount}>${budget.toFixed(2)}</Text>
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
    color: '#464646',
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
    borderColor: 'rgba(204,204,204,0.4)',
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  darkBar: {
    backgroundColor: '#262626',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  barLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#262626',
    borderRightWidth: 0.5,
    borderRightColor: '#333',
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
    color: '#7A7A7A',
  },
  footerValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#3B2C6E',
  },
  footerSlash: {
    fontSize: 13,
    color: '#3B2C6E',
  },
});
