import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  accentIcon?: string;
}

export default function EmptyState({ icon, title, subtitle, accentIcon }: EmptyStateProps) {
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
        <MaterialCommunityIcons
          name={icon as any}
          size={48}
          color={isDark ? '#48484A' : '#AEAEB2'}
        />
        {accentIcon && (
          <View style={[styles.accentBadge, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
            <MaterialCommunityIcons
              name={accentIcon as any}
              size={18}
              color={isDark ? '#636366' : '#8E8E93'}
            />
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  accentBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
