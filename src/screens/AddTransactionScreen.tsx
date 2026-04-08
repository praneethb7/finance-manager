import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Animated,
  KeyboardAvoidingView,
  Alert,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { validateAmount } from '../utils/validators';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PICKER_ITEM_HEIGHT = 40;
const PICKER_VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = PICKER_ITEM_HEIGHT * PICKER_VISIBLE_ITEMS;
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_REPEAT = 100;
const DAY_REPEAT = 100;

const MONTH_DATA = Array.from({ length: 12 * MONTH_REPEAT }, (_, i) => i);
const MONTH_MID_START = Math.floor(MONTH_REPEAT / 2) * 12;

const DAY_DATA = Array.from({ length: 31 * DAY_REPEAT }, (_, i) => i);
const DAY_MID_START = Math.floor(DAY_REPEAT / 2) * 31;

interface Props {
  onClose: () => void;
}

/* ─── Drum Picker Column ─── */
function DrumColumn({
  data,
  renderLabel,
  selectedIndex,
  onSelect,
  columnWidth,
  isItemDisabled,
  isDark,
}: {
  data: number[];
  renderLabel: (index: number) => string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  columnWidth: number;
  isItemDisabled?: (index: number) => boolean;
  isDark: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);
  const lastReportedIndex = useRef(selectedIndex);

  const padItems = Math.floor(PICKER_VISIBLE_ITEMS / 2);

  useEffect(() => {
    if (!isUserScrolling.current && selectedIndex !== lastReportedIndex.current) {
      lastReportedIndex.current = selectedIndex;
      scrollRef.current?.scrollTo({
        y: selectedIndex * PICKER_ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * PICKER_ITEM_HEIGHT,
        animated: false,
      });
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    isUserScrolling.current = false;
    const y = e.nativeEvent.contentOffset.y;
    let idx = Math.round(y / PICKER_ITEM_HEIGHT);
    idx = Math.max(0, Math.min(idx, data.length - 1));

    if (isItemDisabled && isItemDisabled(idx)) {
      scrollRef.current?.scrollTo({
        y: lastReportedIndex.current * PICKER_ITEM_HEIGHT,
        animated: true,
      });
      return;
    }

    lastReportedIndex.current = idx;
    onSelect(idx);
  }, [data.length, onSelect, isItemDisabled]);

  const handleScrollBegin = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  return (
    <View style={[{ width: columnWidth, height: PICKER_HEIGHT, overflow: 'hidden' }]}>
      <View pointerEvents="none" style={[styles.drumHighlight, {
        top: padItems * PICKER_ITEM_HEIGHT,
        height: PICKER_ITEM_HEIGHT,
        backgroundColor: isDark ? '#2C2C2E' : '#E0E0E0',
      }]} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={PICKER_ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(e) => {
          if (Math.abs(e.nativeEvent.velocity?.y ?? 0) < 0.1) {
            handleScrollEnd(e);
          }
        }}
        contentContainerStyle={{
          paddingTop: padItems * PICKER_ITEM_HEIGHT,
          paddingBottom: padItems * PICKER_ITEM_HEIGHT,
        }}
      >
        {data.map((item, i) => {
          const disabled = isItemDisabled ? isItemDisabled(i) : false;
          return (
            <View key={i} style={[styles.drumItem, { height: PICKER_ITEM_HEIGHT }]}>
              <Text style={[
                styles.drumItemText,
                { color: isDark ? '#666' : '#999' },
                i === selectedIndex && { color: isDark ? '#FFFFFF' : '#111111', fontWeight: '600', fontSize: 20 },
                disabled && { color: isDark ? '#333' : '#CCC' },
              ]}>
                {renderLabel(i)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ─── Main Screen ─── */
export default function AddTransactionScreen({ onClose }: Props) {
  const { addTransaction } = useTransactions();
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [errors, setErrors] = useState<{ amount?: string; category?: string }>({});
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [title, setTitle] = useState('');
  const [showTitleModal, setShowTitleModal] = useState(true);
  const titleInputRef = useRef<TextInput>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categories = DEFAULT_CATEGORIES.filter(
    (c) => c.type === type || c.type === 'both'
  );
  const selectedCat = DEFAULT_CATEGORIES.find((c) => c.id === selectedCategory);

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 50;
  const yearCount = currentYear - minYear + 1;
  const YEAR_DATA = Array.from({ length: yearCount }, (_, i) => i);

  const getMonthIndex = (m: number) => MONTH_MID_START + m;
  const getDayIndex = (d: number) => DAY_MID_START + (d - 1);
  const getYearIndex = (y: number) => y - minYear;

  const [monthIdx, setMonthIdx] = useState(getMonthIndex(date.getMonth()));
  const [dayIdx, setDayIdx] = useState(getDayIndex(date.getDate()));
  const [yearIdx, setYearIdx] = useState(getYearIndex(date.getFullYear()));

  const pickerMonth = ((monthIdx % 12) + 12) % 12;
  const pickerDay = ((dayIdx % 31) + 31) % 31 + 1;
  const pickerYear = minYear + yearIdx;

  const daysInPickerMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();

  useEffect(() => {
    const clampedDay = Math.min(pickerDay, daysInPickerMonth);
    const candidate = new Date(pickerYear, pickerMonth, clampedDay);
    if (candidate > today) {
      setDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    } else {
      setDate(candidate);
    }
  }, [pickerMonth, pickerDay, pickerYear, daysInPickerMonth]);

  const isMonthDisabled = useCallback((idx: number) => {
    const m = ((idx % 12) + 12) % 12;
    return pickerYear === currentYear && m > new Date().getMonth();
  }, [pickerYear, currentYear]);

  const isDayDisabled = useCallback((idx: number) => {
    const d = ((idx % 31) + 31) % 31 + 1;
    if (d > daysInPickerMonth) return true;
    if (pickerYear === currentYear && pickerMonth === new Date().getMonth() && d > new Date().getDate()) return true;
    return false;
  }, [daysInPickerMonth, pickerYear, pickerMonth, currentYear]);

  const isYearDisabled = useCallback((idx: number) => {
    return (minYear + idx) > currentYear;
  }, [minYear, currentYear]);

  const toggleType = (newType: 'expense' | 'income') => {
    setType(newType);
    setSelectedCategory('');
    Animated.spring(slideAnim, {
      toValue: newType === 'expense' ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
  };

  const validate = (): boolean => {
    const newErrors: { amount?: string; category?: string } = {};
    if (!amount || !validateAmount(amount)) {
      newErrors.amount = 'Enter a valid amount';
    }
    if (!selectedCategory) {
      newErrors.category = 'Select a category';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // Check title first — if missing, alert and reopen title modal
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this transaction.', [
        {
          text: 'OK',
          onPress: () => {
            setShowTitleModal(true);
            setTimeout(() => titleInputRef.current?.focus(), 300);
          },
        },
      ]);
      return;
    }

    if (!validate()) {
      // Build a list of missing fields for the alert
      const missing: string[] = [];
      if (!amount || !validateAmount(amount)) missing.push('Amount');
      if (!selectedCategory) missing.push('Category');
      Alert.alert('Missing Fields', `Please fill in: ${missing.join(', ')}`);
      return;
    }

    addTransaction({
      type,
      amount: parseFloat(amount),
      categoryId: selectedCategory,
      date: date.toISOString(),
      note: note.trim(),
      title: title.trim(),
    });

    Alert.alert(
      type === 'income' ? 'Income Added' : 'Expense Added',
      `₹${parseFloat(amount).toLocaleString('en-IN')} recorded successfully`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const formatDisplayDate = (d: Date) => {
    const t = new Date();
    const yesterday = new Date(t);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === t.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root,  { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Full-screen gradient background */}
      <LinearGradient
        colors={['#FED4B4', '#3BB9A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 0.25 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 180, 
        }}
      />

      {/* Header — sits on top of the gradient */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Bottom sheet card */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
        {/* Drag handle */}
        <View style={[styles.bottomSheetHandle, { backgroundColor: isDark ? '#444444' : '#CCCCCC' }]} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type Toggle */}
          <View style={[styles.toggleWrap, { backgroundColor: isDark ? '#1C1C1C' : '#E8E8ED' }]}>
            <Animated.View
              style={[
                styles.toggleIndicator,
                {
                  backgroundColor: '#FFFFFF',
                  left: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '50%'],
                  }),
                },
              ]}
            />
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => toggleType('expense')}
              activeOpacity={0.85}
            >
              <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => toggleType('income')}
              activeOpacity={0.85}
            >
              <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount</Text>
            <View style={[styles.amountInputWrap, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>₹</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(t) => {
                  setAmount(t);
                  if (errors.amount) setErrors((e) => ({ ...e, amount: undefined }));
                }}
              />
            </View>
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
          </View>

          {/* Category Dropdown */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            <TouchableOpacity
              style={[styles.dropdownBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              activeOpacity={0.7}
            >
              {selectedCat ? (
                <View style={styles.dropdownSelected}>
                  <View style={[styles.categoryIconCircle, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                    <MaterialCommunityIcons name={selectedCat.icon as any} size={20} color={isDark ? '#FFFFFF' : '#3A3A3C'} />
                  </View>
                  <Text style={[styles.dropdownSelectedText, { color: colors.text }]}>{selectedCat.name}</Text>
                </View>
              ) : (
                <Text style={[styles.dropdownPlaceholder, { color: colors.textTertiary }]}>Select a category</Text>
              )}
              <MaterialCommunityIcons
                name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {showCategoryDropdown && (
              <View style={[styles.dropdownList, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: colors.inputBorder },
                      selectedCategory === cat.id && { backgroundColor: isDark ? '#3A3A3C' : '#D1D1D6' },
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      setShowCategoryDropdown(false);
                      if (errors.category) setErrors((e) => ({ ...e, category: undefined }));
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryIconCircle, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                      <MaterialCommunityIcons name={cat.icon as any} size={20} color={isDark ? '#FFFFFF' : '#3A3A3C'} />
                    </View>
                    <Text style={[
                      styles.dropdownItemText,
                      { color: colors.textSecondary },
                      selectedCategory === cat.id && { color: colors.text },
                    ]}>
                      {cat.name}
                    </Text>
                    {selectedCategory === cat.id && (
                      <MaterialCommunityIcons name="check" size={18} color={isDark ? '#FFFFFF' : '#3A3A3C'} style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Date – Drum Picker */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Date</Text>
            <Text style={[styles.dateDisplay, { color: colors.text }]}>{formatDisplayDate(date)}</Text>
            <View style={[styles.drumPickerContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <DrumColumn
                data={MONTH_DATA}
                renderLabel={(i) => MONTH_NAMES_SHORT[((i % 12) + 12) % 12]}
                selectedIndex={monthIdx}
                onSelect={setMonthIdx}
                columnWidth={SCREEN_WIDTH * 0.28}
                isItemDisabled={isMonthDisabled}
                isDark={isDark}
              />
              <DrumColumn
                data={DAY_DATA}
                renderLabel={(i) => String(((i % 31) + 31) % 31 + 1)}
                selectedIndex={dayIdx}
                onSelect={setDayIdx}
                columnWidth={SCREEN_WIDTH * 0.2}
                isItemDisabled={isDayDisabled}
                isDark={isDark}
              />
              <DrumColumn
                data={YEAR_DATA}
                renderLabel={(i) => String(minYear + i)}
                selectedIndex={yearIdx}
                onSelect={setYearIdx}
                columnWidth={SCREEN_WIDTH * 0.28}
                isItemDisabled={isYearDisabled}
                isDark={isDark}
              />
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Note (optional)</Text>
            <TextInput
              style={[styles.noteInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Add a note..."
              placeholderTextColor={colors.textTertiary}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={200}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} style={styles.submitWrap}>
            <View style={styles.submitBtn}>
              <MaterialCommunityIcons
                name={type === 'expense' ? 'minus-circle-outline' : 'plus-circle-outline'}
                size={22}
                color="#1A1A1A"
              />
              <Text style={styles.submitText}>
                Add {type === 'expense' ? 'Expense' : 'Income'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Title Entry Modal */}
      <Modal
        visible={showTitleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTitleModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>

      
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() =>{
               if(title.trim())setShowTitleModal(false)
               else titleInputRef.current?.focus();
            }} 
          />


          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 400, // tall enough to always be behind keyboard
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }} />

        
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
          >
            <View style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}>
              <View style={[styles.modalCard, { backgroundColor: 'transparent' }]}>
                <View style={[styles.modalHandle, { backgroundColor: isDark ? '#444444' : '#CCCCCC' }]} />

                <View style={styles.modalHeader}>
                  <TouchableOpacity
                      onPress={()=>setShowTitleModal(false)} 
                      style={{ position: 'absolute', left: 0 }}
                    >
                      <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Enter Title</Text>
                </View>

                <View style={[styles.modalInputWrap, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderColor: colors.inputBorder }]}>
                  <TextInput
                    ref={titleInputRef}
                    style={[styles.modalInput, { color: colors.text }]}
                    placeholder="Title"
                    placeholderTextColor={colors.textTertiary}
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      if (title.trim()) setShowTitleModal(false);
                    }}
                  />
                  <Text style={[styles.modalInputIcon, { color: colors.textTertiary }]}>T</Text>
                </View>

                <TouchableOpacity
                  style={[styles.modalCategoryBtn, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
                  onPress={() => {
                    if (title.trim()) {
                      setShowTitleModal(false);
                      setTimeout(() => setShowCategoryDropdown(true), 200);
                    } else {
                      Alert.alert("Please enter a title first");
                      titleInputRef.current?.focus();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {selectedCat ? (
                    <View style={styles.modalCategorySelected}>
                      <View style={[styles.categoryIconCircle, { backgroundColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
                        <MaterialCommunityIcons name={selectedCat.icon as any} size={20} color={isDark ? '#FFFFFF' : '#3A3A3C'} />
                      </View>
                      <Text style={[styles.modalCategoryText, { color: colors.text }]}>{selectedCat.name}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.modalCategoryText, { color: colors.textTertiary }]}>Select Category</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header — sits on the gradient
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },

  // Bottom sheet card
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: 30,
    padding: 0,
    marginBottom: 20,
    position: 'relative',
  },
  toggleIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '50%',
    borderRadius: 50,
    overflow: 'hidden',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  toggleTextActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },

  // Amount
  amountSection: {
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 7 : 4,
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 25,
    fontWeight: '700',
    padding: 0,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },

  // Category Dropdown
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  dropdownSelected: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownSelectedText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownList: {
    marginTop: 6,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Date
  dateDisplay: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },

  // Drum Picker
  drumPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  drumHighlight: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 8,
    zIndex: 0,
  },
  drumItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumItemText: {
    fontSize: 18,
    fontWeight: '400',
  },

  // Note
  noteInput: {
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Submit
  submitWrap: {
    marginTop: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    paddingVertical: 9,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  submitText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Error
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginBottom: 4,
  },

  // Title Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  modalInputIcon: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalCategoryBtn: {
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCategorySelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalCategoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});