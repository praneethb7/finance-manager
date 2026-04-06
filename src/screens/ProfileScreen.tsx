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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Tab = 'preview' | 'edit';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('preview');

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  // Toggle indicator slides left/right
  const toggleTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1], // will be multiplied by half-width via onLayout
  });

  const [toggleWidth, setToggleWidth] = useState(0);

  return (
    <View style={styles.root}>
      <View style={styles.safe}>
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
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>
                  {(user?.name?.[0] ?? 'A').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.profileName}>{user?.name ?? 'Alex yu'}</Text>
            </View>

            {/* Tab Toggle with animated indicator */}
            <View
              style={styles.toggleWrap}
              onLayout={(e) => setToggleWidth(e.nativeEvent.layout.width)}
            >
              {/* Animated sliding background */}
              <Animated.View
                style={[
                  styles.toggleIndicator,
                  {
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
                  style={[styles.toggleText, activeTab === 'preview' && styles.toggleTextActive]}
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
                  style={[styles.toggleText, activeTab === 'edit' && styles.toggleTextActive]}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab content with fade */}
            <Animated.View style={{ opacity: contentFade }}>
              {activeTab === 'preview' ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>
                    Total spendings: <Text style={styles.previewValue}>$2000</Text>
                  </Text>
                  <Text style={styles.previewLabel}>
                    Email : <Text style={styles.previewValue}>{user?.email ?? 'alex@gmail.com'}</Text>
                  </Text>
                  <Text style={styles.previewLabel}>
                    Balance : <Text style={styles.previewValue}>$20000</Text>
                  </Text>
                </View>
              ) : (
                <View style={styles.editSection}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#555"
                    value={fullName}
                    onChangeText={setFullName}
                  />

                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#555"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordWrap}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Create a password"
                      placeholderTextColor="#555"
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
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#555"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />

                  <TouchableOpacity style={styles.updateBtn} activeOpacity={0.85}>
                    <Text style={styles.updateBtnText}>Update Details</Text>
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1C',
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
    backgroundColor: '#FFFFFF',
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
    color: '#666666',
  },
  toggleTextActive: {
    color: '#111111',
    fontWeight: '600',
  },

  // Preview
  previewSection: {
    gap: 20,
  },
  previewLabel: {
    fontSize: 16,
    color: '#999999',
  },
  previewValue: {
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Edit
  editSection: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },
  updateBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  updateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },

});
