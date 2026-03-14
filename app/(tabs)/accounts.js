// app/(tabs)/accounts.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';
import useStore from '../../store/useStore';

const ACCOUNT_ICONS = ['💵', '📱', '🏦', '💳', '👜', '💰', '🏧', '💎'];
const ACCOUNT_COLORS = [
  '#22C55E', '#3B82F6', '#8B5CF6', '#EF4444',
  '#F59E0B', '#06B6D4', '#EC4899', '#14B8A6',
];

export default function AccountsScreen() {
  const isDark = useStore(s => s.isDark);
  const T = isDark ? COLORS.dark : COLORS.light;
  const accounts = useStore(s => s.accounts);
  const transactions = useStore(s => s.transactions);
  const budgets = useStore(s => s.budgets);
  const expenseCategories = useStore(s => s.expenseCategories);
  const addAccount = useStore(s => s.addAccount);
const deleteAccount = useStore(s => s.deleteAccount);
  const addBudget = useStore(s => s.addBudget);
  const deleteBudget = useStore(s => s.deleteBudget);
  const getBudgetSpent = useStore(s => s.getBudgetSpent);
  const formatAmount = useStore(s => s.formatAmount);
  const getTotalAssets = useStore(s => s.getTotalAssets);

  const [subTab, setSubTab] = useState('accounts');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);

  // Add account form
  const [accName, setAccName] = useState('');
  const [accIcon, setAccIcon] = useState('💵');
  const [accColor, setAccColor] = useState('#22C55E');
  const [accBalance, setAccBalance] = useState('');

  // Add budget form
  const [budgetCatId, setBudgetCatId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  const handleAddAccount = () => {
    if (!accName || !accBalance) return;
    addAccount({
      id: Date.now().toString(),
      name: accName,
      icon: accIcon,
      color: accColor,
      balance: parseFloat(parseFloat(accBalance).toFixed(2)),
    });
    setAccName(''); setAccBalance(''); setAccIcon('💵'); setAccColor('#22C55E');
    setShowAddAccount(false);
  };

  const handleAddBudget = () => {
    if (!budgetCatId || !budgetLimit) return;
    addBudget({ categoryId: budgetCatId, limit: parseFloat(budgetLimit) });
    setBudgetCatId(''); setBudgetLimit('');
    setShowAddBudget(false);
  };

  const totalAssets = getTotalAssets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.xl, paddingBottom: 100 }}>

        {/* HEADER */}
        <Text style={{ color: T.text, fontSize: FONTS.xxl, fontWeight: FONTS.bold, marginBottom: SPACING.lg, letterSpacing: -0.5 }}>
          Finance
        </Text>

        {/* SUB TABS */}
        <View style={{ flexDirection: 'row', backgroundColor: T.card, borderRadius: RADIUS.md, padding: 4, borderWidth: 1, borderColor: T.border, marginBottom: SPACING.xl }}>
          {['accounts', 'budget', 'transfer'].map(v => (
            <TouchableOpacity key={v} onPress={() => setSubTab(v)}
              style={{ flex: 1, paddingVertical: 9, borderRadius: RADIUS.sm, alignItems: 'center',
                backgroundColor: subTab === v ? COLORS.primary : 'transparent' }}>
              <Text style={{ color: subTab === v ? '#fff' : T.subtext, fontWeight: FONTS.bold, fontSize: FONTS.xs, textTransform: 'capitalize' }}>
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── ACCOUNTS TAB ── */}
        {subTab === 'accounts' && (
          <View>
            {/* TOTAL ASSETS */}
            <View style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg }}>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: FONTS.sm }}>Total Assets</Text>
              <Text style={{ color: '#fff', fontSize: FONTS.xxxl, fontWeight: FONTS.bold, marginTop: 4, letterSpacing: -1 }}>
                {formatAmount(totalAssets)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FONTS.sm, marginTop: 4 }}>
                {accounts.length} accounts
              </Text>
            </View>

            {/* ACCOUNT CARDS */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: SPACING.lg }}>
              {accounts.map(acc => (
                <View key={acc.id} style={{ width: '47%', backgroundColor: T.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: T.border, overflow: 'hidden' }}>
                  <View style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: 30, backgroundColor: acc.color + '22' }} />
                  {/* DELETE BUTTON */}
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Delete Account',
                        `Delete "${acc.name}"? This won't delete its transactions.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteAccount(acc.id) }
                        ]
                      );
                    }}
                    style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26,
                      borderRadius: 13, backgroundColor: COLORS.expenseSoft,
                      alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <Ionicons name="trash-outline" size={13} color={COLORS.expense} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 28, marginBottom: 8 }}>{acc.icon}</Text>
                  <Text style={{ color: T.subtext, fontSize: FONTS.xs, fontWeight: FONTS.semibold, marginBottom: 4 }}>{acc.name}</Text>
                  <Text style={{ color: acc.balance < 0 ? COLORS.expense : T.text, fontSize: FONTS.lg, fontWeight: FONTS.bold, letterSpacing: -0.5 }}>
                    {acc.balance < 0 ? '-' : ''}{formatAmount(Math.abs(acc.balance))}
                  </Text>
                </View>
              ))}

              {/* ADD ACCOUNT BUTTON */}
              <TouchableOpacity onPress={() => setShowAddAccount(true)}
                style={{ width: '47%', backgroundColor: T.input, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 2, borderColor: T.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', minHeight: 110 }}>
                <Ionicons name="add-circle-outline" size={28} color={T.muted} />
                <Text style={{ color: T.muted, fontSize: FONTS.sm, fontWeight: FONTS.semibold, marginTop: 6 }}>Add Account</Text>
              </TouchableOpacity>
            </View>

            {/* RECENT ACCOUNT ACTIVITY */}
            <Text style={{ color: T.text, fontSize: FONTS.lg, fontWeight: FONTS.bold, marginBottom: SPACING.md }}>
              Recent Activity
            </Text>
            {transactions.slice(0, 5).map(txn => {
              const acc = accounts.find(a => a.id === txn.accountId);
              return (
                <View key={txn.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border }}>
                  <View style={{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: (acc?.color || '#888') + '22', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18 }}>{acc?.icon || '💰'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontWeight: FONTS.semibold, fontSize: FONTS.sm }}>{txn.note || 'Transaction'}</Text>
                    <Text style={{ color: T.subtext, fontSize: FONTS.xs }}>{acc?.name || 'Unknown'} · {txn.date}</Text>
                  </View>
                  <Text style={{ color: txn.type === 'income' ? COLORS.income : COLORS.expense, fontWeight: FONTS.bold, fontSize: FONTS.sm }}>
                    {txn.type === 'income' ? '+' : '-'}{formatAmount(txn.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── BUDGET TAB ── */}
        {subTab === 'budget' && (
          <View>
            <TouchableOpacity onPress={() => setShowAddBudget(true)}
              style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: SPACING.lg }}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.md }}>Set New Budget</Text>
            </TouchableOpacity>

            {budgets.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 40 }}>🎯</Text>
                <Text style={{ color: T.subtext, fontWeight: FONTS.bold, fontSize: FONTS.lg, marginTop: 12 }}>No budgets yet</Text>
                <Text style={{ color: T.muted, fontSize: FONTS.sm, marginTop: 4 }}>Set spending limits for your categories</Text>
              </View>
            ) : budgets.map(b => {
              const cat = expenseCategories.find(c => c.id === b.categoryId) || { icon: '📦', name: 'Other', color: '#888' };
              const spent = getBudgetSpent(b.categoryId);
              const pct = Math.min((spent / b.limit) * 100, 100);
              const over = spent > b.limit;
              return (
                <View key={b.id} style={{ backgroundColor: T.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: over ? COLORS.expense + '44' : T.border, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                      <View>
                        <Text style={{ color: T.text, fontWeight: FONTS.bold, fontSize: FONTS.md }}>{cat.name}</Text>
                        <Text style={{ color: T.subtext, fontSize: FONTS.xs }}>{formatAmount(spent)} of {formatAmount(b.limit)}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ color: over ? COLORS.expense : COLORS.income, fontWeight: FONTS.bold, fontSize: FONTS.sm }}>{pct.toFixed(0)}%</Text>
                      <TouchableOpacity onPress={() => deleteBudget(b.id)}>
                        <Ionicons name="trash-outline" size={16} color={T.muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{ height: 8, backgroundColor: T.input, borderRadius: 99 }}>
                    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: over ? COLORS.expense : cat.color, borderRadius: 99 }} />
                  </View>
                  {over && (
                    <Text style={{ color: COLORS.expense, fontSize: FONTS.xs, fontWeight: FONTS.bold, marginTop: 6 }}>
                      ⚠️ Over budget by {formatAmount(spent - b.limit)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── TRANSFER TAB ── */}
        {subTab === 'transfer' && (
          <View>
            {transactions.filter(t => t.type === 'transfer').length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 40 }}>🔄</Text>
                <Text style={{ color: T.subtext, fontWeight: FONTS.bold, fontSize: FONTS.lg, marginTop: 12 }}>No transfers yet</Text>
                <Text style={{ color: T.muted, fontSize: FONTS.sm, marginTop: 4 }}>Use the Home screen to add a transfer</Text>
              </View>
            ) : transactions.filter(t => t.type === 'transfer').map(txn => {
              const fromAcc = accounts.find(a => a.id === txn.accountId);
              const toAcc = accounts.find(a => a.id === txn.toAccountId);
              return (
                <View key={txn.id} style={{ backgroundColor: T.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: T.border, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.transferSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="swap-horizontal" size={22} color={COLORS.transfer} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: T.text, fontWeight: FONTS.bold, fontSize: FONTS.md }}>
                        {fromAcc?.icon} {fromAcc?.name} → {toAcc?.icon} {toAcc?.name}
                      </Text>
                      <Text style={{ color: T.subtext, fontSize: FONTS.xs, marginTop: 2 }}>{txn.date}</Text>
                    </View>
                    <Text style={{ color: COLORS.transfer, fontWeight: FONTS.bold, fontSize: FONTS.md }}>
                      {formatAmount(txn.amount)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* ── ADD ACCOUNT MODAL ── */}
      <Modal visible={showAddAccount} animationType="slide" transparent onRequestClose={() => setShowAddAccount(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setShowAddAccount(false)} />
          <View style={{ backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <Text style={{ color: T.text, fontSize: FONTS.xl, fontWeight: FONTS.bold, marginBottom: 20 }}>New Account</Text>

            {/* ICON PICKER */}
            <Text style={{ color: T.subtext, fontSize: FONTS.sm, fontWeight: FONTS.semibold, marginBottom: 8 }}>Icon</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {ACCOUNT_ICONS.map(icon => (
                <TouchableOpacity key={icon} onPress={() => setAccIcon(icon)}
                  style={{ width: 44, height: 44, borderRadius: RADIUS.md, borderWidth: 2, borderColor: accIcon === icon ? COLORS.primary : T.border, alignItems: 'center', justifyContent: 'center', backgroundColor: accIcon === icon ? COLORS.primarySoft : T.input }}>
                  <Text style={{ fontSize: 20 }}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* COLOR PICKER */}
            <Text style={{ color: T.subtext, fontSize: FONTS.sm, fontWeight: FONTS.semibold, marginBottom: 8 }}>Color</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {ACCOUNT_COLORS.map(color => (
                <TouchableOpacity key={color} onPress={() => setAccColor(color)}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color, borderWidth: accColor === color ? 3 : 0, borderColor: T.text }} />
              ))}
            </View>

            <TextInput value={accName} onChangeText={setAccName} placeholder="Account name (e.g. UPI, Cash)"
              placeholderTextColor={T.muted}
              style={{ backgroundColor: T.input, borderRadius: RADIUS.lg, padding: 14, color: T.text, fontSize: FONTS.md, marginBottom: 12 }} />
            <TextInput value={accBalance} onChangeText={setAccBalance} placeholder="Opening balance (e.g. 5000.00)"
              placeholderTextColor={T.muted} keyboardType="decimal-pad"
              style={{ backgroundColor: T.input, borderRadius: RADIUS.lg, padding: 14, color: T.text, fontSize: FONTS.md, marginBottom: 20 }} />

            <TouchableOpacity onPress={handleAddAccount}
              style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.lg }}>Add Account ✓</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── ADD BUDGET MODAL ── */}
      <Modal visible={showAddBudget} animationType="slide" transparent onRequestClose={() => setShowAddBudget(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setShowAddBudget(false)} />
          <View style={{ backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <Text style={{ color: T.text, fontSize: FONTS.xl, fontWeight: FONTS.bold, marginBottom: 20 }}>Set Budget</Text>

            <Text style={{ color: T.subtext, fontSize: FONTS.sm, fontWeight: FONTS.semibold, marginBottom: 8 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {expenseCategories.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setBudgetCatId(c.id)}
                  style={{ marginRight: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 2,
                    borderColor: budgetCatId === c.id ? c.color : T.border,
                    backgroundColor: budgetCatId === c.id ? c.color + '22' : 'transparent' }}>
                  <Text style={{ color: budgetCatId === c.id ? c.color : T.subtext, fontWeight: FONTS.semibold, fontSize: FONTS.sm }}>
                    {c.icon} {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput value={budgetLimit} onChangeText={setBudgetLimit}
              placeholder="Monthly limit (e.g. 5000.00)"
              placeholderTextColor={T.muted} keyboardType="decimal-pad"
              style={{ backgroundColor: T.input, borderRadius: RADIUS.lg, padding: 14, color: T.text, fontSize: FONTS.md, marginBottom: 20 }} />

            <TouchableOpacity onPress={handleAddBudget}
              style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.lg }}>Set Budget ✓</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}