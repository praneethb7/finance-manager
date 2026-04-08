import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

interface TopBarProps {
  showSearch?: boolean;
}

export default function TopBar({ showSearch = true }: TopBarProps) {
  const { mode, colors, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: menuOpen ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: menuOpen ? 1 : 0.9,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
    ]).start();
  }, [menuOpen]);

  const isDark = mode === 'dark';

  return (
    <>
      {menuOpen && (
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      <View style={[styles.topBar, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={styles.topBarLeft}
          activeOpacity={0.8}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <View style={[styles.logoBox, { backgroundColor: colors.text }]}>
            <Text style={[styles.logoLetter, { color: colors.background }]}>P</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>PayU</Text>
        </TouchableOpacity>
        <View style={styles.topBarRight}>
          {showSearch && (
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (searchOpen) {
                  setSearchOpen(false);
                  setSearchQuery('');
                } else {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }
              }}
            >
              <MaterialCommunityIcons
                name={searchOpen ? 'close' : 'magnify'}
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Dropdown Menu */}
        {menuOpen && (
          <Animated.View
            style={[
              styles.dropdown,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderColor: isDark ? '#333' : '#E0E0E0',
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Dark / Light Mode Toggle */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => {
                toggleTheme();
              }}
            >
              <MaterialCommunityIcons
                name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
                size={20}
                color={isDark ? '#FFFFFF' : '#111111'}
              />
              <Text style={[styles.menuLabel, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Text>
              <MaterialCommunityIcons
                name={isDark ? 'toggle-switch-off-outline' : 'toggle-switch'}
                size={28}
                color={isDark ? '#666' : '#111111'}
              />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#333' : '#E0E0E0' }]} />

            {/* Log Out */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => {
                setMenuOpen(false);
                signOut();
              }}
            >
              <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
              <Text style={[styles.menuLabel, { color: '#FF3B30' }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
      {showSearch && searchOpen && (
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textTertiary} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 100,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 18,
    fontWeight: '800',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  iconBtn: {
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -5,
    right: -7,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E03333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: 58,
    left: 18,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: 210,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 101,
    borderWidth: 0.5,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
});
