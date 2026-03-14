// app/(tabs)/settings.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, CURRENCIES, FONTS, RADIUS, SPACING } from '../../constants/theme';
import useStore from '../../store/useStore';
import { exportAsExcel, exportAsPDF } from '../../utils/exportData';
import { cancelAllReminders, scheduleSpendlyReminders } from '../../utils/notifications';

const EMOJI_OPTIONS = ['🍕','🚌','👕','💊','🎮','💡','🏠','📚','✈️','🎁','💼','💻','👛','📈','🏘️','🛒','🧴','🎯','🎬','🍔','🚗','🛍️','💰','🏧'];
const COLOR_OPTIONS = ['#F59E0B','#3B82F6','#EC4899','#10B981','#8B5CF6','#F97316','#6366F1','#14B8A6','#EF4444','#22C55E','#06B6D4','#FBBF24'];

export default function SettingsScreen() {
  const isDark = useStore(s => s.isDark);
  const T = isDark ? COLORS.dark : COLORS.light;
  const toggleTheme = useStore(s => s.toggleTheme);
  const currency = useStore(s => s.currency);
  const setCurrency = useStore(s => s.setCurrency);
  const expenseCategories = useStore(s => s.expenseCategories);
  const incomeCategories = useStore(s => s.incomeCategories);
  const addExpenseCategory = useStore(s => s.addExpenseCategory);
  const addIncomeCategory = useStore(s => s.addIncomeCategory);
  const deleteExpenseCategory = useStore(s => s.deleteExpenseCategory);
  const deleteIncomeCategory = useStore(s => s.deleteIncomeCategory);
  const transactions = useStore(s => s.transactions);
  const accounts = useStore(s => s.accounts);

  const [section, setSection] = useState(null);
  const [catType, setCatType] = useState('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#F59E0B');
  const [showAddCat, setShowAddCat] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [lendAlertsOn, setLendAlertsOn] = useState(true);

  // Start notifications when screen loads
  useEffect(() => {
    scheduleSpendlyReminders();
  }, []);

  const handleToggleNotifications = async (value) => {
    setNotificationsOn(value);
    if (value) {
      const success = await scheduleSpendlyReminders();
      if (success) {
        Alert.alert(
          '✅ Reminders On',
          'You will be reminded every 4 hours:\n\n☀️ 8:00 AM\n🍽️ 12:00 PM\n☕ 4:00 PM\n🌙 8:00 PM\n🌑 12:00 AM'
        );
      } else {
        Alert.alert(
          'Permission Needed',
          'Please allow notifications in your phone Settings → Apps → Spendly → Notifications.'
        );
        setNotificationsOn(false);
      }
    } else {
      await cancelAllReminders();
      Alert.alert('🔕 Reminders Off', 'All reminders have been cancelled.');
    }
  };

  const handleExport = async (type) => {
    if (transactions.length === 0) {
      Alert.alert('No Data', 'Add some transactions first before exporting.');
      return;
    }
    Alert.alert(
      `Export as ${type}`,
      `Export ${transactions.length} transactions as ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export', onPress: async () => {
            const success = type === 'PDF'
              ? await exportAsPDF(transactions, accounts, currency)
              : await exportAsExcel(transactions, accounts, currency);
            if (!success) {
  Alert.alert('Export Failed', 'Please make sure you have storage permission enabled for Spendly in your phone settings.');
}
          }
        }
      ]
    );
  };

  const handleAddCategory = () => {
    if (!newCatName) return;
    const cat = {
      id: Date.now().toString(),
      name: newCatName,
      icon: newCatIcon,
      color: newCatColor,
    };
    if (catType === 'expense') addExpenseCategory(cat);
    else addIncomeCategory(cat);
    setNewCatName('');
    setNewCatIcon('📦');
    setNewCatColor('#F59E0B');
    setShowAddCat(false);
  };

  const Row = ({ icon, label, right, onPress, danger, description }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: T.border }}>
      <View style={{ width: 36, height: 36, borderRadius: RADIUS.md,
        backgroundColor: danger ? COLORS.expenseSoft : COLORS.primarySoft,
        alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: danger ? COLORS.expense : T.text, fontWeight: FONTS.semibold, fontSize: FONTS.md }}>
          {label}
        </Text>
        {description && (
          <Text style={{ color: T.muted, fontSize: FONTS.xs, marginTop: 2 }}>{description}</Text>
        )}
      </View>
      {right}
      {onPress && !right && <Ionicons name="chevron-forward" size={16} color={T.muted} />}
    </TouchableOpacity>
  );

  // ── CURRENCY SCREEN ───────────────────────────────────────────
  if (section === 'currency') return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: SPACING.xl, borderBottomWidth: 1, borderBottomColor: T.border }}>
        <TouchableOpacity onPress={() => setSection(null)}>
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={{ color: T.text, fontSize: FONTS.xl, fontWeight: FONTS.bold }}>
          Currency
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: SPACING.xl }}>
        {CURRENCIES.map(c => (
          <TouchableOpacity key={c.code} onPress={() => { setCurrency(c); setSection(null); }}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: currency.code === c.code ? COLORS.primarySoft : T.card,
              borderWidth: 1, borderColor: currency.code === c.code ? COLORS.primary : T.border,
              borderRadius: RADIUS.lg, padding: 16, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: RADIUS.md,
                backgroundColor: currency.code === c.code ? COLORS.primary : T.input,
                alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: currency.code === c.code ? '#fff' : T.text,
                  fontWeight: FONTS.bold, fontSize: FONTS.lg }}>
                  {c.symbol}
                </Text>
              </View>
              <View>
                <Text style={{ color: T.text, fontWeight: FONTS.bold, fontSize: FONTS.md }}>
                  {c.name}
                </Text>
                <Text style={{ color: T.subtext, fontSize: FONTS.sm }}>{c.code}</Text>
              </View>
            </View>
            {currency.code === c.code && (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  // ── CATEGORIES SCREEN ─────────────────────────────────────────
  if (section === 'categories') return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: SPACING.xl,
        borderBottomWidth: 1, borderBottomColor: T.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setSection(null)}>
            <Ionicons name="arrow-back" size={24} color={T.text} />
          </TouchableOpacity>
          <Text style={{ color: T.text, fontSize: FONTS.xl, fontWeight: FONTS.bold }}>
            Categories
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddCat(true)}
          style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
            paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.sm }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', margin: SPACING.xl,
        backgroundColor: T.card, borderRadius: RADIUS.md,
        padding: 4, borderWidth: 1, borderColor: T.border }}>
        {['expense', 'income'].map(v => (
          <TouchableOpacity key={v} onPress={() => setCatType(v)}
            style={{ flex: 1, paddingVertical: 9, borderRadius: RADIUS.sm,
              alignItems: 'center',
              backgroundColor: catType === v ? COLORS.primary : 'transparent' }}>
            <Text style={{ color: catType === v ? '#fff' : T.subtext,
              fontWeight: FONTS.bold, fontSize: FONTS.sm, textTransform: 'capitalize' }}>
              {catType === v ? '✓ ' : ''}{v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: 100 }}>
        {(catType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
          <View key={cat.id} style={{ flexDirection: 'row', alignItems: 'center',
            gap: 12, paddingVertical: 12,
            borderBottomWidth: 1, borderBottomColor: T.border }}>
            <View style={{ width: 44, height: 44, borderRadius: RADIUS.md,
              backgroundColor: cat.color + '22',
              alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
            </View>
            <Text style={{ flex: 1, color: T.text, fontWeight: FONTS.semibold, fontSize: FONTS.md }}>
              {cat.name}
            </Text>
            <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: cat.color }} />
            <TouchableOpacity onPress={() => {
              Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {
                  if (catType === 'expense') deleteExpenseCategory(cat.id);
                  else deleteIncomeCategory(cat.id);
                }}
              ]);
            }}>
              <Ionicons name="trash-outline" size={18} color={T.muted} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* ADD CATEGORY MODAL */}
      <Modal visible={showAddCat} animationType="slide" transparent>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowAddCat(false)} />
        <View style={{ backgroundColor: T.card, borderTopLeftRadius: 24,
          borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: FONTS.xl, fontWeight: FONTS.bold, marginBottom: 16 }}>
            New {catType === 'expense' ? 'Expense' : 'Income'} Category
          </Text>

          <TextInput value={newCatName} onChangeText={setNewCatName}
            placeholder="Category name (e.g. Gym, Rent)"
            placeholderTextColor={T.muted}
            style={{ backgroundColor: T.input, borderRadius: RADIUS.lg,
              padding: 14, color: T.text, fontSize: FONTS.md, marginBottom: 14 }} />

          <Text style={{ color: T.subtext, fontSize: FONTS.sm,
            fontWeight: FONTS.semibold, marginBottom: 8 }}>Pick Icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {EMOJI_OPTIONS.map(e => (
              <TouchableOpacity key={e} onPress={() => setNewCatIcon(e)}
                style={{ width: 44, height: 44, borderRadius: RADIUS.md, marginRight: 8,
                  borderWidth: 2,
                  borderColor: newCatIcon === e ? COLORS.primary : T.border,
                  backgroundColor: newCatIcon === e ? COLORS.primarySoft : T.input,
                  alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={{ color: T.subtext, fontSize: FONTS.sm,
            fontWeight: FONTS.semibold, marginBottom: 8 }}>Pick Color</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
            {COLOR_OPTIONS.map(c => (
              <TouchableOpacity key={c} onPress={() => setNewCatColor(c)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c,
                  borderWidth: newCatColor === c ? 3 : 0, borderColor: T.text }} />
            ))}
          </View>

          <TouchableOpacity onPress={handleAddCategory}
            style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
              padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.lg }}>
              Add Category ✓
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );

  // ── MAIN SETTINGS ─────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.xl, paddingBottom: 100 }}>

        <Text style={{ color: T.text, fontSize: FONTS.xxl, fontWeight: FONTS.bold,
          marginBottom: SPACING.xl, letterSpacing: -0.5 }}>
          Settings
        </Text>

        {/* PROFILE CARD */}
        <View style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
          padding: SPACING.xl, marginBottom: SPACING.xl,
          flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28 }}>👤</Text>
          </View>
          <View>
            <Text style={{ color: '#fff', fontSize: FONTS.lg, fontWeight: FONTS.bold }}>
              Welcome to Spendly!
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sm, marginTop: 2 }}>
              {transactions.length} transactions · {accounts.length} accounts
            </Text>
          </View>
        </View>

        {/* APPEARANCE */}
        <Text style={{ color: T.muted, fontSize: FONTS.xs, fontWeight: FONTS.bold,
          letterSpacing: 1, marginBottom: SPACING.sm, textTransform: 'uppercase' }}>
          Appearance
        </Text>
        <View style={{ backgroundColor: T.card, borderRadius: RADIUS.xl,
          paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl,
          borderWidth: 1, borderColor: T.border }}>
          <Row icon="🌙" label="Dark Mode"
            description={isDark ? 'Currently using dark theme' : 'Currently using light theme'}
            right={
              <Switch value={isDark} onValueChange={toggleTheme}
                trackColor={{ false: T.border, true: COLORS.primary }}
                thumbColor="#fff" />
            } />
          <Row icon="💱" label="Currency"
            description={`${currency.symbol} — ${currency.name} (${currency.code})`}
            onPress={() => setSection('currency')} />
        </View>

        {/* DATA MANAGEMENT */}
        <Text style={{ color: T.muted, fontSize: FONTS.xs, fontWeight: FONTS.bold,
          letterSpacing: 1, marginBottom: SPACING.sm, textTransform: 'uppercase' }}>
          Data Management
        </Text>
        <View style={{ backgroundColor: T.card, borderRadius: RADIUS.xl,
          paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl,
          borderWidth: 1, borderColor: T.border }}>
          <Row icon="🗂️" label="Manage Categories"
            description="Add or remove custom income & expense categories"
            onPress={() => setSection('categories')} />
          <Row icon="📄" label="Export as PDF"
            description={`Export ${transactions.length} transactions as PDF`}
            onPress={() => handleExport('PDF')} />
          <Row icon="📊" label="Export as Excel"
            description={`Export ${transactions.length} transactions as .xlsx`}
            onPress={() => handleExport('Excel')} />
        </View>

        {/* NOTIFICATIONS */}
        <Text style={{ color: T.muted, fontSize: FONTS.xs, fontWeight: FONTS.bold,
          letterSpacing: 1, marginBottom: SPACING.sm, textTransform: 'uppercase' }}>
          Notifications
        </Text>
        <View style={{ backgroundColor: T.card, borderRadius: RADIUS.xl,
          paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl,
          borderWidth: 1, borderColor: T.border }}>
          <Row icon="🔔" label="Every 4 Hours Reminder"
            description="Reminds at 8AM · 12PM · 4PM · 8PM · 12AM"
            right={
              <Switch value={notificationsOn}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: T.border, true: COLORS.primary }}
                thumbColor="#fff" />
            } />
          <Row icon="⏰" label="Lend & Borrow Alerts"
            description="Get notified when due dates are approaching"
            right={
              <Switch value={lendAlertsOn}
                onValueChange={setLendAlertsOn}
                trackColor={{ false: T.border, true: COLORS.primary }}
                thumbColor="#fff" />
            } />
        </View>

        {/* ABOUT */}
        <Text style={{ color: T.muted, fontSize: FONTS.xs, fontWeight: FONTS.bold,
          letterSpacing: 1, marginBottom: SPACING.sm, textTransform: 'uppercase' }}>
          About
        </Text>
        <View style={{ backgroundColor: T.card, borderRadius: RADIUS.xl,
          paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl,
          borderWidth: 1, borderColor: T.border }}>
          <Row icon="ℹ️" label="App Version" description="Spendly v1.0.0 — Your first app!" />
        </View>

        <Text style={{ textAlign: 'center', color: T.muted, fontSize: FONTS.xs, marginTop: 8 }}>
          💰 Spendly v1.0.0
        </Text>
        <Text style={{ textAlign: 'center', color: T.muted, fontSize: FONTS.xs, marginTop: 4 }}>
          Designed & Developed by
        </Text>
        <Text style={{ textAlign: 'center', color: COLORS.primary, fontSize: FONTS.md,
          fontWeight: FONTS.bold, marginTop: 2, marginBottom: 20 }}>
          Hardik Mittal ✨
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}