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

  const cx = 135;
  const cy = 120;
  const r = 90;
  const strokeW = 8;
  const startAngle = 160;
  const endAngle = 385;
  const totalArc = endAngle - startAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const ptAtRadius = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle)),
  });
  const pt = (angle: number) => ptAtRadius(angle, r);

  const makeArcAtRadius = (s: number, e: number, radius: number) => {
    const p1 = ptAtRadius(s, radius);
    const p2 = ptAtRadius(e, radius);
    const large = e - s > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  const makeArc = (s: number, e: number) => makeArcAtRadius(s, e, r);

  // Segments: teal, pink, blue, yellow
  const segments = [
    { color: '#3BB9A1', fraction: 0.35 },
    { color: '#EE89DF', fraction: 0.18 },
    { color: '#74B8EF', fraction: 0.22 },
    { color: '#FBDE9D', fraction: 0.25 },
  ];

  const gap = 7; // degree gap between segments
  let angle = startAngle;

  // Indicator position
  const dotAngle = startAngle + totalArc * ratio;
  const dotPos = pt(dotAngle);

  // Inner tick dots radius (inside the colored arcs)
  const tickRadius = r - strokeW / 2 - 8;

  // Generate tick dot positions
  const tickDots: { x: number; y: number }[] = [];
  const tickCount = 30;
  for (let i = 0; i <= tickCount; i++) {
    const a = startAngle + (totalArc / tickCount) * i;
    tickDots.push(ptAtRadius(a, tickRadius));
  }

  return (
    <View style={styles.container}>
      <Svg width={270} height={155} viewBox="0 0 270 155">
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

        {/* Dashed tick dots on inner radius */}
        {tickDots.map((dot, i) => (
          <Circle
            key={`tick-${i}`}
            cx={dot.x}
            cy={dot.y}
            r={1.2}
            fill="#888"
            opacity={0.6}
          />
        ))}

        {/* Indicator dot */}
        <Circle cx={dotPos.x} cy={dotPos.y} r={14} fill="#74B8EF" opacity={0.3} />
        <Circle cx={dotPos.x} cy={dotPos.y} r={9} fill="#F9F9F9" stroke="#74B8EF" strokeWidth={4} />
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
    height: 155,
    marginVertical: 6,
  },
  scoreOverlay: {
    position: 'absolute',
    bottom: 16,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 50,
    fontWeight: '400',
    letterSpacing: -1,
  },
});
