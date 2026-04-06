import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface Props {
  score: number;
  maxScore?: number;
}

export default function CreditScoreGauge({ score, maxScore = 850 }: Props) {
  const { colors } = useTheme();
  const ratio = Math.min(score / maxScore, 1);

  const cx = 150;
  const cy = 130;
  const r = 100;
  const strokeW = 18;
  const startAngle = 155;
  const endAngle = 385;
  const totalArc = endAngle - startAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const pt = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });

  const makeArc = (s: number, e: number) => {
    const p1 = pt(s);
    const p2 = pt(e);
    const large = e - s > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  // Segments matching SVG: teal, pink, blue, yellow
  const segments = [
    { color: '#3BB9A1', fraction: 0.35 },
    { color: '#EE89DF', fraction: 0.18 },
    { color: '#74B8EF', fraction: 0.22 },
    { color: '#FBDE9D', fraction: 0.25 },
  ];

  const gap = 3; // degree gap between segments
  let angle = startAngle;

  // Indicator position
  const dotAngle = startAngle + totalArc * ratio;
  const dotPos = pt(dotAngle);

  return (
    <View style={styles.container}>
      <Svg width={300} height={170} viewBox="0 0 300 170">
        {/* Colored arc segments */}
        {segments.map((seg, i) => {
          const segStart = angle;
          const segEnd = angle + totalArc * seg.fraction - gap;
          angle = segEnd + gap;
          return (
            <Path
              key={i}
              d={makeArc(segStart, segEnd)}
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}

        {/* Dashed tick arc */}
        <Path
          d={makeArc(startAngle, endAngle)}
          stroke="#A1A1A1"
          strokeWidth={1}
          strokeDasharray="2 16"
          fill="none"
        />

        {/* Indicator dot — white outer with blue glow */}
        <Circle cx={dotPos.x} cy={dotPos.y} r={14} fill="#74B8EF" opacity={0.3} />
        <Circle cx={dotPos.x} cy={dotPos.y} r={10} fill="#F9F9F9" stroke="#74B8EF" strokeWidth={4} />
      </Svg>

      <View style={styles.scoreOverlay}>
        <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 170,
    marginVertical: 8,
  },
  scoreOverlay: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
});
