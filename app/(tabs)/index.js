// app/(tabs)/index.js
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';
import useStore from '../../store/useStore';

export default function HomeScreen() {
  const isDark = useStore(s => s.isDark);
  const T = isDark ? COLORS.dark : COLORS.light;
  const transactions = useStore(s => s.transactions);
  const accounts = useStore(s => s.accounts);
  const expenseCategories = useStore(s => s.expenseCategories);
  const incomeCategories = useStore(s => s.incomeCategories);
  const addTransaction = useStore(s => s.addTransaction);
  const editTransaction = useStore(s => s.editTransaction);
  const deleteTransaction = useStore(s => s.deleteTransaction);
  const formatAmount = useStore(s => s.formatAmount);
  const getTotalIncome = useStore(s => s.getTotalIncome);
  const getTotalExpense = useStore(s => s.getTotalExpense);
  const currency = useStore(s => s.currency);

  const [period, setPeriod] = useState('monthly');
  const [showModal, setShowModal] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);

  // Form state
  const [txnType, setTxnType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());

  // Picker state — outside modal so Android shows them
  const [pickerMode, setPickerMode] = useState(null); // 'date' | 'time' | null

  const allCats = [...expenseCategories, ...incomeCategories];
  const cats = txnType === 'expense' ? expenseCategories : incomeCategories;
  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const netBalance = totalIncome - totalExpense;

  const formatDate = (d) =>
    d.toLocaleDateString('en-IN', {
      weekday: 'short', day: '2-digit',
      month: 'short', year: 'numeric',
    });

  const formatTime = (d) =>
    d.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

  const openAddModal = (type = 'expense') => {
    setEditingTxn(null);
    setTxnType(type);
    setAmount('');
    setNote('');
    setSelectedCat('');
    setSelectedAccount('');
    setSelectedDateTime(new Date());
    setShowModal(true);
  };

  const openEditModal = (txn) => {
    setEditingTxn(txn);
    setTxnType(txn.type);
    setAmount(txn.amount.toString());
    setNote(txn.note || '');
    setSelectedCat(txn.categoryId || '');
    setSelectedAccount(txn.accountId || '');

    let dt = null;

    if (txn.date) {
      try {
        const [y, m, d] = txn.date.split('-').map(Number);
        let hour = 12, min = 0;

        if (txn.time) {
          const upper = txn.time.trim().toUpperCase();
          // Try "12:00 PM" format first
          const ampmMatch = upper.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
          // Try 24hr "20:03" format as fallback
          const hrMatch = upper.match(/^(\d{1,2}):(\d{2})$/);

          if (ampmMatch) {
            hour = parseInt(ampmMatch[1], 10);
            min = parseInt(ampmMatch[2], 10);
            if (ampmMatch[3] === 'PM' && hour !== 12) hour += 12;
            if (ampmMatch[3] === 'AM' && hour === 12) hour = 0;
          } else if (hrMatch) {
            hour = parseInt(hrMatch[1], 10);
            min = parseInt(hrMatch[2], 10);
          }
        }

        dt = new Date(y, m - 1, d, hour, min, 0, 0);
        if (isNaN(dt.getTime())) dt = null;
      } catch {
        dt = null;
      }
    }

    // Only fall back to now if we truly couldn't parse
    setSelectedDateTime(dt || new Date());
    setShowModal(true);
  };

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const dt = selectedDateTime instanceof Date && !isNaN(selectedDateTime.getTime())
      ? selectedDateTime
      : new Date();

    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    const finalDate = `${y}-${m}-${d}`;
    const finalTime = formatTime(dt);

    const txnData = {
      type: txnType,
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      categoryId: selectedCat || cats[0]?.id,
      accountId: selectedAccount || accounts[0]?.id,
      note,
      date: finalDate,
      time: finalTime,
      currency: currency.code,
    };

    if (editingTxn) {
      editTransaction(editingTxn.id, txnData);
    } else {
      addTransaction(txnData);
    }
    setShowModal(false);
  };

  const handleDelete = (txn) => {
    Alert.alert(
      'Delete Transaction',
      `Delete "${txn.note || 'this transaction'}" of ${formatAmount(txn.amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(txn.id) },
      ]
    );
  };

  const now = new Date();
  const filteredTxns = transactions.filter(t => {
    if (!t.date) return true;
    const parts = t.date.split('-');
    if (parts.length !== 3) return true;
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const d = new Date(year, month, day);
    if (period === 'daily') {
      return d.getDate() === now.getDate() &&
             d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
    }
    if (period === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    // Monthly
    return d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: T.bg }]}>
          <View>
            <Text style={{ color: T.subtext, fontSize: FONTS.sm }}>Good day 👋</Text>
            <Text style={{ color: T.text, fontSize: FONTS.xl, fontWeight: FONTS.bold, marginTop: 2 }}>
              Spendly
            </Text>
          </View>
          <TouchableOpacity onPress={() => openAddModal('expense')}
            style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
              paddingHorizontal: 16, paddingVertical: 10,
              flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.sm }}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* BALANCE CARD */}
        <View style={[styles.balanceCard, { backgroundColor: COLORS.primary }]}>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: FONTS.sm, fontWeight: FONTS.semibold }}>
            Net Balance
          </Text>
          <Text style={{ color: '#fff', fontSize: FONTS.xxxl, fontWeight: FONTS.bold,
            marginVertical: 6, letterSpacing: -1 }}>
            {formatAmount(netBalance)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <View style={styles.balanceChip}>
              <Ionicons name="arrow-down" size={14} color="#6EE7B7" />
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Income</Text>
                <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.md }}>
                  {formatAmount(totalIncome)}
                </Text>
              </View>
            </View>
            <View style={styles.balanceChip}>
              <Ionicons name="arrow-up" size={14} color="#FCA5A5" />
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Expenses</Text>
                <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.md }}>
                  {formatAmount(totalExpense)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* PERIOD TOGGLE */}
        <View style={{ paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: 'row', backgroundColor: T.card,
            borderRadius: RADIUS.md, padding: 4, borderWidth: 1, borderColor: T.border }}>
            {['daily', 'weekly', 'monthly'].map(p => (
              <TouchableOpacity key={p} onPress={() => setPeriod(p)}
                style={{ flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm,
                  backgroundColor: period === p ? COLORS.primary : 'transparent',
                  alignItems: 'center' }}>
                <Text style={{ color: period === p ? '#fff' : T.subtext,
                  fontWeight: FONTS.semibold, fontSize: FONTS.sm, textTransform: 'capitalize' }}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={{ paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Expense', icon: 'arrow-up-outline', color: COLORS.expense, bg: COLORS.expenseSoft, type: 'expense' },
              { label: 'Income', icon: 'arrow-down-outline', color: COLORS.income, bg: COLORS.incomeSoft, type: 'income' },
              { label: 'Transfer', icon: 'swap-vertical-outline', color: COLORS.transfer, bg: COLORS.transferSoft, type: 'transfer' },
            ].map(a => (
              <TouchableOpacity key={a.label} onPress={() => openAddModal(a.type)}
                style={{ flex: 1, backgroundColor: a.bg, borderRadius: RADIUS.lg,
                  padding: 14, alignItems: 'center', gap: 6 }}>
                <View style={{ width: 36, height: 36, borderRadius: RADIUS.md,
                  backgroundColor: a.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={a.icon} size={18} color={a.color} />
                </View>
                <Text style={{ fontSize: FONTS.xs, fontWeight: FONTS.bold, color: a.color }}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TRANSACTIONS LIST */}
        <View style={{ paddingHorizontal: SPACING.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: T.text, fontSize: FONTS.lg, fontWeight: FONTS.bold }}>
              Transactions
            </Text>
            <Text style={{ color: T.muted, fontSize: FONTS.xs }}>
              {filteredTxns.length} records
            </Text>
          </View>

          {filteredTxns.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 40 }}>💸</Text>
              <Text style={{ color: T.subtext, marginTop: 12, fontWeight: FONTS.semibold }}>
                No transactions yet
              </Text>
              <Text style={{ color: T.muted, fontSize: FONTS.sm, marginTop: 4 }}>
                Tap Add to record your first one
              </Text>
            </View>
          ) : filteredTxns.map(txn => {
            const cat = allCats.find(c => c.id === txn.categoryId)
              || { icon: '💰', name: 'Other', color: '#888' };
            return (
              <View key={txn.id} style={{ flexDirection: 'row', alignItems: 'center',
                gap: 12, paddingVertical: 12,
                borderBottomWidth: 1, borderBottomColor: T.border }}>
                <View style={{ width: 44, height: 44, borderRadius: RADIUS.md,
                  backgroundColor: cat.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontWeight: FONTS.semibold, fontSize: FONTS.md }}>
                    {txn.note || cat.name}
                  </Text>
                  <Text style={{ color: T.subtext, fontSize: FONTS.xs, marginTop: 2 }}>
                    {cat.name} · {txn.date}{txn.time ? ' · ' + txn.time : ''}
                  </Text>
                </View>
                <Text style={{ fontWeight: FONTS.bold, fontSize: FONTS.md,
                  color: txn.type === 'income' ? COLORS.income : COLORS.expense }}>
                  {txn.type === 'income' ? '+' : '-'}{formatAmount(txn.amount)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity onPress={() => openEditModal(txn)}
                    style={{ width: 32, height: 32, borderRadius: RADIUS.sm,
                      backgroundColor: COLORS.primarySoft,
                      alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="pencil-outline" size={15} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(txn)}
                    style={{ width: 32, height: 32, borderRadius: RADIUS.sm,
                      backgroundColor: COLORS.expenseSoft,
                      alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="trash-outline" size={15} color={COLORS.expense} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── NATIVE DATE/TIME PICKER ── */}
      {pickerMode !== null && (
        <DateTimePicker
          value={
            selectedDateTime instanceof Date && !isNaN(selectedDateTime.getTime())
              ? selectedDateTime
              : new Date()
          }
          mode={pickerMode}
          display={pickerMode === 'date' ? 'calendar' : 'clock'}
          is24Hour={false}
          onChange={(event, date) => {
            const currentMode = pickerMode;
            setPickerMode(null);
            if (event.type === 'set' && date) {
              setSelectedDateTime(prev => {
                const base = prev instanceof Date && !isNaN(prev.getTime())
                  ? new Date(prev.getTime())
                  : new Date();
                if (currentMode === 'date') {
                  base.setFullYear(date.getFullYear());
                  base.setMonth(date.getMonth());
                  base.setDate(date.getDate());
                } else {
                  base.setHours(date.getHours());
                  base.setMinutes(date.getMinutes());
                  base.setSeconds(0);
                }
                return base;
              });
            }
            setTimeout(() => setShowModal(true), 150);
          }}
        />
      )}

      {/* ── ADD / EDIT MODAL ── */}
      <Modal visible={showModal} animationType="slide" transparent
        onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => setShowModal(false)} />

          <View style={{ backgroundColor: T.card, borderTopLeftRadius: 24,
            borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '92%' }}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* HEADER */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: T.text, fontSize: FONTS.xl, fontWeight: FONTS.bold }}>
                  {editingTxn ? '✏️ Edit Record' : '➕ New Record'}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color={T.subtext} />
                </TouchableOpacity>
              </View>

              {/* TYPE */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['expense', 'income', 'transfer'].map(t => (
                  <TouchableOpacity key={t} onPress={() => setTxnType(t)}
                    style={{ paddingHorizontal: 16, paddingVertical: 8,
                      borderRadius: RADIUS.full, borderWidth: 2,
                      borderColor: txnType === t ? COLORS.primary : T.border,
                      backgroundColor: txnType === t ? COLORS.primarySoft : 'transparent' }}>
                    <Text style={{ color: txnType === t ? COLORS.primary : T.subtext,
                      fontWeight: FONTS.bold, fontSize: FONTS.sm, textTransform: 'capitalize' }}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* AMOUNT */}
              <View style={{ backgroundColor: T.input, borderRadius: RADIUS.lg,
                padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: T.subtext, fontSize: FONTS.xxl,
                  fontWeight: FONTS.bold, marginRight: 8 }}>
                  {currency.symbol}
                </Text>
                <TextInput value={amount} onChangeText={setAmount}
                  placeholder="0.00" placeholderTextColor={T.muted}
                  keyboardType="decimal-pad"
                  style={{ flex: 1, fontSize: FONTS.xxl, fontWeight: FONTS.bold, color: T.text }} />
              </View>

              {/* DATE & TIME BUTTONS */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>

                {/* DATE */}
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    setTimeout(() => setPickerMode('date'), 250);
                  }}
                  style={{ flex: 1, backgroundColor: T.input, borderRadius: RADIUS.lg,
                    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
                    borderWidth: 2, borderColor: COLORS.primary + '44' }}>
                  <View style={{ width: 36, height: 36, borderRadius: RADIUS.md,
                    backgroundColor: COLORS.primarySoft,
                    alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="calendar" size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={{ color: T.muted, fontSize: 10, fontWeight: FONTS.bold,
                      textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Date
                    </Text>
                    <Text style={{ color: T.text, fontSize: FONTS.sm,
                      fontWeight: FONTS.bold, marginTop: 2 }}>
                      {formatDate(selectedDateTime)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* TIME */}
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    setTimeout(() => setPickerMode('time'), 250);
                  }}
                  style={{ backgroundColor: T.input, borderRadius: RADIUS.lg,
                    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
                    borderWidth: 2, borderColor: COLORS.primary + '44' }}>
                  <View style={{ width: 36, height: 36, borderRadius: RADIUS.md,
                    backgroundColor: COLORS.primarySoft,
                    alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="time" size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={{ color: T.muted, fontSize: 10, fontWeight: FONTS.bold,
                      textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Time
                    </Text>
                    <Text style={{ color: T.text, fontSize: FONTS.sm,
                      fontWeight: FONTS.bold, marginTop: 2 }}>
                      {formatTime(selectedDateTime)}
                    </Text>
                  </View>
                </TouchableOpacity>

              </View>

              {/* CATEGORY */}
              <Text style={{ color: T.subtext, fontSize: FONTS.xs,
                fontWeight: FONTS.semibold, marginBottom: 8 }}>
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}>
                {cats.map(c => (
                  <TouchableOpacity key={c.id} onPress={() => setSelectedCat(c.id)}
                    style={{ marginRight: 8, paddingHorizontal: 12, paddingVertical: 7,
                      borderRadius: RADIUS.full, borderWidth: 2,
                      borderColor: selectedCat === c.id ? c.color : T.border,
                      backgroundColor: selectedCat === c.id ? c.color + '22' : 'transparent' }}>
                    <Text style={{ color: selectedCat === c.id ? c.color : T.subtext,
                      fontWeight: FONTS.semibold, fontSize: FONTS.sm }}>
                      {c.icon} {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* ACCOUNT */}
              <Text style={{ color: T.subtext, fontSize: FONTS.xs,
                fontWeight: FONTS.semibold, marginBottom: 8 }}>
                Account
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}>
                {accounts.map(a => (
                  <TouchableOpacity key={a.id} onPress={() => setSelectedAccount(a.id)}
                    style={{ marginRight: 8, paddingHorizontal: 12, paddingVertical: 7,
                      borderRadius: RADIUS.full, borderWidth: 2,
                      borderColor: selectedAccount === a.id ? COLORS.primary : T.border,
                      backgroundColor: selectedAccount === a.id ? COLORS.primarySoft : 'transparent' }}>
                    <Text style={{ color: selectedAccount === a.id ? COLORS.primary : T.subtext,
                      fontWeight: FONTS.semibold, fontSize: FONTS.sm }}>
                      {a.icon} {a.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* NOTE */}
              <TextInput value={note} onChangeText={setNote}
                placeholder="Note (optional)"
                placeholderTextColor={T.muted}
                style={{ backgroundColor: T.input, borderRadius: RADIUS.lg,
                  padding: 14, color: T.text, fontSize: FONTS.md, marginBottom: 16 }} />

              {/* SAVE */}
              <TouchableOpacity onPress={handleSave}
                style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
                  padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.lg }}>
                  {editingTxn ? 'Update Record ✓' : 'Save Record ✓'}
                </Text>
              </TouchableOpacity>

              {/* DELETE (edit mode) */}
              {editingTxn && (
                <TouchableOpacity
                  onPress={() => { setShowModal(false); handleDelete(editingTxn); }}
                  style={{ backgroundColor: COLORS.expenseSoft, borderRadius: RADIUS.lg,
                    padding: 14, alignItems: 'center', marginTop: 10 }}>
                  <Text style={{ color: COLORS.expense, fontWeight: FONTS.bold, fontSize: FONTS.md }}>
                    🗑️ Delete This Record
                  </Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl, paddingBottom: SPACING.lg,
  },
  balanceCard: {
    marginHorizontal: SPACING.xl, borderRadius: RADIUS.xl,
    padding: SPACING.xl, marginBottom: SPACING.xl,
  },
  balanceChip: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
});