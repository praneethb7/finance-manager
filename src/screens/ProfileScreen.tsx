import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  UIManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatters';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Tab = 'preview' | 'edit';

export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { mode, colors } = useTheme();
  const { transactions } = useTransactions();
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const isDark = mode === 'dark';

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current; // 0 = preview, 1 = edit
  const contentFade = useRef(new Animated.Value(1)).current;

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    // Fade out content
    Animated.timing(contentFade, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      // Slide the toggle indicator
      Animated.spring(slideAnim, {
        toValue: tab === 'edit' ? 1 : 0,
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }).start();
      // Fade in content
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const [toggleWidth, setToggleWidth] = useState(0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.safe, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar + Name */}
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.text }]}>
                <Text style={[styles.avatarLetter, { color: colors.background }]}>
                  {(user?.name?.[0] ?? 'A').toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.profileName, { color: colors.text }]}>{user?.name ?? 'Alex yu'}</Text>
            </View>

            {/* Tab Toggle with animated indicator */}
            <View
              style={[styles.toggleWrap, { backgroundColor: isDark ? '#1C1C1C' : '#E8E8ED' }]}
              onLayout={(e) => setToggleWidth(e.nativeEvent.layout.width)}
            >
              {/* Animated sliding background */}
              <Animated.View
                style={[
                  styles.toggleIndicator,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#FFFFFF',
                    width: toggleWidth ? (toggleWidth - 8) / 2 : '48%',
                    transform: [
                      {
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, toggleWidth ? (toggleWidth - 8) / 2 : 0],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => switchTab('preview')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isDark ? '#666666' : '#999999' },
                    activeTab === 'preview' && { color: '#111111', fontWeight: '600' },
                  ]}
                >
                  Preview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => switchTab('edit')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isDark ? '#666666' : '#999999' },
                    activeTab === 'edit' && { color: '#111111', fontWeight: '600' },
                  ]}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab content with fade */}
            <Animated.View style={{ opacity: contentFade }}>
              {activeTab === 'preview' ? (
                <View style={styles.previewSection}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    Total spendings: <Text style={[styles.previewValue, { color: colors.text }]}>{formatCurrency(totalExpenses)}</Text>
                  </Text>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    Email : <Text style={[styles.previewValue, { color: colors.text }]}>{user?.email ?? 'alex@gmail.com'}</Text>
                  </Text>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    Balance : <Text style={[styles.previewValue, { color: balance >= 0 ? '#27AE60' : '#FF2D55' }]}>{formatCurrency(Math.abs(balance))}{balance < 0 ? ' (deficit)' : ''}</Text>
                  </Text>
                </View>
              ) : (
                <View style={styles.editSection}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textTertiary}
                    value={fullName}
                    onChangeText={setFullName}
                  />

                  <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
                  <View style={[styles.passwordWrap, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    <TextInput
                      style={[styles.passwordInput, { color: colors.text }]}
                      placeholder="Create a password"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />

                  {updateError ? <Text style={styles.errorText}>{updateError}</Text> : null}
                  {updateSuccess ? <Text style={styles.successText}>Profile updated!</Text> : null}

                  <TouchableOpacity
                    style={[styles.updateBtn, { backgroundColor: colors.text }]}
                    activeOpacity={0.85}
                    onPress={async () => {
                      setUpdateError('');
                      setUpdateSuccess(false);
                      if (password && password !== confirmPassword) {
                        setUpdateError('Passwords do not match');
                        return;
                      }
                      if (password && password.length < 6) {
                        setUpdateError('Password must be at least 6 characters');
                        return;
                      }
                      try {
                        await updateProfile(fullName, email, password || undefined);
                        setUpdateSuccess(true);
                        setPassword('');
                        setConfirmPassword('');
                      } catch (err: any) {
                        setUpdateError(err?.message || 'Update failed');
                      }
                    }}
                  >
                    <Text style={[styles.updateBtnText, { color: colors.background }]}>Update Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

      </View>
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
    flex: 1,
    paddingHorizontal: 18,
  },
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 80,
  },

  // Profile header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: 50,
    padding: 4,
    marginBottom: 28,
    position: 'relative',
  },
  toggleIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 50,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Preview
  previewSection: {
    gap: 20,
  },
  previewLabel: {
    fontSize: 16,
  },
  previewValue: {
    fontWeight: '700',
  },

  // Edit
  editSection: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },
  updateBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  updateBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  successText: {
    color: '#27AE60',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
