import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
}: {
  title: string;
  subtitle: string;
  amount: string;
  highlighted?: boolean;
}) {
  const inner = (
    <View style={styles.expenseInner}>
      <View style={styles.expenseIconWrap}>
        <LogoIcon size={26} color="#FFFFFF" />
      </View>
      <View style={styles.expenseTextWrap}>
        <Text style={styles.expenseTitle}>{title}</Text>
        <Text
          style={[
            styles.expenseSubtitle,
            highlighted && styles.expenseSubtitleHighlighted,
          ]}
        >
          {subtitle}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="star-outline"
        size={22}
        color="#3D3D3D"
        style={styles.starIcon}
      />
      <View
        style={[
          styles.amountBadge,
          highlighted && styles.amountBadgeHighlighted,
        ]}
      >
        <Text style={styles.amountText}>{amount}</Text>
      </View>
    </View>
  );

  return (
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
      {inner}
    </LinearGradient>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const firstName = user?.name?.split(' ')[0] || 'Alex';

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === 'weekly' ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
  }, [activeTab]);

  const cardWidth = SCREEN_WIDTH - 80;
  const cardHeight = cardWidth / 1.586;

  return (
    <View style={styles.root}>
      <View style={styles.safe}>
        {/* Content - flex fills remaining space */}
        <View style={styles.content}>
          {/* Greeting */}
          <Text style={styles.greeting}>Hey, {firstName}</Text>
          <Text style={styles.greetingSub}>Add your yesterday's expense</Text>

          {/* Card */}
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={['#D4A574', '#A8D4B8', '#6ECFB5']}
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
                  <Text style={styles.cardValue}>ALEX</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.cardLabel}>Expired Date</Text>
                  <Text style={styles.cardValue}>10/28</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Your expenses */}
          <Text style={styles.sectionTitle}>Your expenses</Text>

          {/* Toggle */}
          <View style={styles.toggleWrap}>
            <Animated.View
              style={[
                styles.toggleIndicator,
                {
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
                  activeTab === 'weekly' && styles.toggleTextActive,
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
                  activeTab === 'monthly' && styles.toggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>

          {/* Expense rows */}
          <View style={styles.expenseList}>
            <ExpenseRow
              title="FOOD"
              subtitle="Lesser than last week"
              amount="$1000"
            />
            <ExpenseRow
              title="TRAVEL"
              subtitle="More than last week"
              amount="$4000"
              highlighted
            />
          </View>

          <View style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  // Greeting
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 14,
    color: '#888888',
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
    color: '#FFFFFF',
    marginBottom: 12,
  },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1C',
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
    backgroundColor: '#FFFFFF',
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
    color: '#666666',
  },
  toggleTextActive: {
    color: '#111111',
    fontWeight: '600',
  },

  // Expense List
  expenseList: {
    gap: 10,
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
  expenseInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  expenseIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
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

});
