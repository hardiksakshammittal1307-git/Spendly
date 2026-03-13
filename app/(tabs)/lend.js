// app/(tabs)/lend.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
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

export default function LendScreen() {
  const isDark = useStore(s => s.isDark);
  const T = isDark ? COLORS.dark : COLORS.light;
  const lendBorrowRecords = useStore(s => s.lendBorrowRecords);
  const addLendBorrow = useStore(s => s.addLendBorrow);
  const settleLendBorrow = useStore(s => s.settleLendBorrow);
  const deleteLendBorrow = useStore(s => s.deleteLendBorrow);
  const formatAmount = useStore(s => s.formatAmount);

  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [lendType, setLendType] = useState('lent');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
    if (!person || !amount || isNaN(parseFloat(amount))) return;
    addLendBorrow({
      type: lendType,
      person,
      amount: parseFloat(amount),
      note,
      date: today,
      dueDate,
    });
    setPerson(''); setAmount(''); setNote(''); setDueDate('');
    setShowModal(false);
  };

  const active = lendBorrowRecords.filter(r => !r.settled);
  const settled = lendBorrowRecords.filter(r => r.settled);
  const lent = active.filter(r => r.type === 'lent');
  const borrowed = active.filter(r => r.type === 'borrowed');

  const totalLent = lent.reduce((s, r) => s + r.amount, 0);
  const totalBorrowed = borrowed.reduce((s, r) => s + r.amount, 0);

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  const filtered = filter === 'all' ? active
    : filter === 'lent' ? lent
    : filter === 'borrowed' ? borrowed
    : settled;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.xl, paddingBottom: 100 }}>

        {/* HEADER */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
          <Text style={{ color: T.text, fontSize: FONTS.xxl, fontWeight: FONTS.bold, letterSpacing: -0.5 }}>
            Lend & Borrow
          </Text>
          <TouchableOpacity onPress={() => setShowModal(true)}
            style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.sm }}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* SUMMARY CARDS */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: SPACING.xl }}>
          <View style={{ flex: 1, backgroundColor: COLORS.incomeSoft, borderRadius: RADIUS.xl, padding: SPACING.lg }}>
            <Text style={{ color: COLORS.income, fontSize: FONTS.xs, fontWeight: FONTS.bold, marginBottom: 4 }}>
              💚 You'll Receive
            </Text>
            <Text style={{ color: COLORS.income, fontSize: FONTS.xl, fontWeight: FONTS.bold, letterSpacing: -0.5 }}>
              {formatAmount(totalLent)}
            </Text>
            <Text style={{ color: COLORS.income, fontSize: FONTS.xs, marginTop: 2, opacity: 0.7 }}>
              {lent.length} pending
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: COLORS.expenseSoft, borderRadius: RADIUS.xl, padding: SPACING.lg }}>
            <Text style={{ color: COLORS.expense, fontSize: FONTS.xs, fontWeight: FONTS.bold, marginBottom: 4 }}>
              ❤️ You Owe
            </Text>
            <Text style={{ color: COLORS.expense, fontSize: FONTS.xl, fontWeight: FONTS.bold, letterSpacing: -0.5 }}>
              {formatAmount(totalBorrowed)}
            </Text>
            <Text style={{ color: COLORS.expense, fontSize: FONTS.xs, marginTop: 2, opacity: 0.7 }}>
              {borrowed.length} pending
            </Text>
          </View>
        </View>

        {/* FILTER TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
          {[
            { id: 'all', label: 'All Active' },
            { id: 'lent', label: '↗️ Lent' },
            { id: 'borrowed', label: '↙️ Borrowed' },
            { id: 'settled', label: '✅ Settled' },
          ].map(f => (
            <TouchableOpacity key={f.id} onPress={() => setFilter(f.id)}
              style={{ marginRight: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 2,
                borderColor: filter === f.id ? COLORS.primary : T.border,
                backgroundColor: filter === f.id ? COLORS.primarySoft : 'transparent' }}>
              <Text style={{ color: filter === f.id ? COLORS.primary : T.subtext, fontWeight: FONTS.semibold, fontSize: FONTS.sm }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RECORDS */}
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 40 }}>🤝</Text>
            <Text style={{ color: T.subtext, fontWeight: FONTS.bold, fontSize: FONTS.lg, marginTop: 12 }}>
              {filter === 'settled' ? 'No settled records' : 'Nothing here yet'}
            </Text>
            <Text style={{ color: T.muted, fontSize: FONTS.sm, marginTop: 4 }}>
              Tap Add to record a lend or borrow
            </Text>
          </View>
        ) : filtered.map(r => {
          const overdue = isOverdue(r.dueDate);
          const isLent = r.type === 'lent';
          const color = isLent ? COLORS.income : COLORS.expense;
          const bg = isLent ? COLORS.incomeSoft : COLORS.expenseSoft;

          return (
            <View key={r.id} style={{ backgroundColor: T.card, borderRadius: RADIUS.lg, padding: SPACING.lg,
              borderWidth: 1, borderColor: overdue ? COLORS.expense + '55' : T.border, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                {/* ICON */}
                <View style={{ width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20 }}>{isLent ? '↗️' : '↙️'}</Text>
                </View>

                {/* DETAILS */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontWeight: FONTS.bold, fontSize: FONTS.md }}>{r.person}</Text>
                  {r.note ? <Text style={{ color: T.subtext, fontSize: FONTS.xs, marginTop: 2 }}>{r.note}</Text> : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Ionicons name="calendar-outline" size={12} color={overdue ? COLORS.expense : T.muted} />
                    <Text style={{ fontSize: FONTS.xs, color: overdue ? COLORS.expense : T.muted, fontWeight: overdue ? FONTS.bold : FONTS.regular }}>
                      {r.dueDate ? (overdue ? '⚠️ Overdue · ' + r.dueDate : 'Due ' + r.dueDate) : 'No due date'}
                    </Text>
                  </View>
                  <Text style={{ color: T.muted, fontSize: FONTS.xs, marginTop: 2 }}>Added {r.date}</Text>
                </View>

                {/* AMOUNT + ACTIONS */}
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Text style={{ color, fontWeight: FONTS.bold, fontSize: FONTS.lg, letterSpacing: -0.5 }}>
                    {isLent ? '+' : '-'}{formatAmount(r.amount)}
                  </Text>
                  {!r.settled && (
                    <TouchableOpacity onPress={() => settleLendBorrow(r.id)}
                      style={{ backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ color: COLORS.primary, fontSize: FONTS.xs, fontWeight: FONTS.bold }}>
                        Settle ✓
                      </Text>
                    </TouchableOpacity>
                  )}
                  {r.settled && (
                    <View style={{ backgroundColor: COLORS.incomeSoft, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ color: COLORS.income, fontSize: FONTS.xs, fontWeight: FONTS.bold }}>✓ Settled</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

      </ScrollView>

      {/* ── ADD MODAL ── */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setShowModal(false)} />
          <View style={{ backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>

            <Text style={{ color: T.text, fontSize: FONTS.xl, fontWeight: FONTS.bold, marginBottom: 20 }}>
              Add Record
            </Text>

            {/* LENT / BORROWED TOGGLE */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[
                { id: 'lent', label: '↗️ I Lent', color: COLORS.income, soft: COLORS.incomeSoft },
                { id: 'borrowed', label: '↙️ I Borrowed', color: COLORS.expense, soft: COLORS.expenseSoft },
              ].map(t => (
                <TouchableOpacity key={t.id} onPress={() => setLendType(t.id)}
                  style={{ flex: 1, padding: 12, borderRadius: RADIUS.lg, borderWidth: 2,
                    borderColor: lendType === t.id ? t.color : T.border,
                    backgroundColor: lendType === t.id ? t.soft : 'transparent',
                    alignItems: 'center' }}>
                  <Text style={{ color: lendType === t.id ? t.color : T.subtext, fontWeight: FONTS.bold, fontSize: FONTS.sm }}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* PERSON NAME */}
            <TextInput value={person} onChangeText={setPerson}
              placeholder="Person's name"
              placeholderTextColor={T.muted}
              style={{ backgroundColor: T.input, borderRadius: RADIUS.lg, padding: 14, color: T.text, fontSize: FONTS.md, marginBottom: 12 }} />

            {/* AMOUNT */}
            <TextInput value={amount} onChangeText={setAmount}
              placeholder="Amount (e.g. 500.00)"
              placeholderTextColor={T.muted} keyboardType="decimal-pad"
              style={{ backgroundColor: T.input, borderRadius: RADIUS.lg, padding: 14, color: T.text, fontSize: FONTS.md, marginBottom: 12 }} />

            {/* NOTE */}
            <TextInput value={note} onChangeText={setNote}
              placeholder="Note (e.g. Lunch split)"
              placeholderTextColor={T.muted}
              style={{ backgroundColor: T.input, borderRadius: RADIUS.lg, padding: 14, color: T.text, fontSize: FONTS.md, marginBottom: 12 }} />

            {/* DUE DATE */}
            <Text style={{ color: T.subtext, fontSize: FONTS.sm, fontWeight: FONTS.semibold, marginBottom: 6 }}>
              Due Date (for reminder)
            </Text>
            <TextInput value={dueDate} onChangeText={setDueDate}
              placeholder="YYYY-MM-DD (e.g. 2026-04-01)"
              placeholderTextColor={T.muted}
              style={{ backgroundColor: T.input, borderRadius: RADIUS.lg, padding: 14, color: T.text, fontSize: FONTS.md, marginBottom: 20 }} />

            <TouchableOpacity onPress={handleAdd}
              style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.lg }}>Save Record ✓</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}