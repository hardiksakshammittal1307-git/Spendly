// app/(tabs)/analysis.js
import { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';
import useStore from '../../store/useStore';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function AnalysisScreen() {
  const isDark = useStore(s => s.isDark);
  const T = isDark ? COLORS.dark : COLORS.light;
  const transactions = useStore(s => s.transactions);
  const expenseCategories = useStore(s => s.expenseCategories);
  const incomeCategories = useStore(s => s.incomeCategories);
  const formatAmount = useStore(s => s.formatAmount);

  const [view, setView] = useState('expense');

  const cats = view === 'expense' ? expenseCategories : incomeCategories;
  const filtered = transactions.filter(t => t.type === view);
  const total = filtered.reduce((s, t) => s + t.amount, 0);

  // Build pie chart data
  const pieData = cats.map(cat => ({
    value: filtered.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0),
    color: cat.color,
    text: cat.icon,
    label: cat.name,
    id: cat.id,
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  // Build bar chart — last 6 months
  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const val = transactions
      .filter(t => {
        const td = new Date(t.date);
        return t.type === view &&
          td.getMonth() === d.getMonth() &&
          td.getFullYear() === d.getFullYear();
      })
      .reduce((s, t) => s + t.amount, 0);
    return {
      value: val,
      label: monthName,
      frontColor: view === 'expense' ? COLORS.expense : COLORS.income,
      topLabelComponent: val > 0
        ? () => <Text style={{ color: T.subtext, fontSize: 9, marginBottom: 2 }}>
            {val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(0)}
          </Text>
        : undefined,
    };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.xl, paddingBottom: 100 }}>

        {/* HEADER */}
        <Text style={{ color: T.text, fontSize: FONTS.xxl, fontWeight: FONTS.bold, marginBottom: SPACING.lg, letterSpacing: -0.5 }}>
          Analysis
        </Text>

        {/* TOGGLE */}
        <View style={{ flexDirection: 'row', backgroundColor: T.card, borderRadius: RADIUS.md, padding: 4, borderWidth: 1, borderColor: T.border, marginBottom: SPACING.xl }}>
          {['expense', 'income'].map(v => (
            <TouchableOpacity key={v} onPress={() => setView(v)}
              style={{ flex: 1, paddingVertical: 9, borderRadius: RADIUS.sm, alignItems: 'center',
                backgroundColor: view === v ? (v === 'expense' ? COLORS.expense : COLORS.income) : 'transparent' }}>
              <Text style={{ color: view === v ? '#fff' : T.subtext, fontWeight: FONTS.bold, fontSize: FONTS.sm, textTransform: 'capitalize' }}>
                {v === 'expense' ? '📤 Expenses' : '📥 Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TOTAL */}
        <View style={{ backgroundColor: T.card, borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: T.border, marginBottom: SPACING.lg, alignItems: 'center' }}>
          <Text style={{ color: T.subtext, fontSize: FONTS.sm, fontWeight: FONTS.semibold }}>
            Total {view === 'expense' ? 'Spent' : 'Earned'}
          </Text>
          <Text style={{ color: view === 'expense' ? COLORS.expense : COLORS.income, fontSize: FONTS.xxxl, fontWeight: FONTS.bold, marginTop: 4, letterSpacing: -1 }}>
            {formatAmount(total)}
          </Text>
          <Text style={{ color: T.muted, fontSize: FONTS.sm, marginTop: 4 }}>
            {filtered.length} transactions
          </Text>
        </View>

        {/* PIE CHART */}
        <View style={{ backgroundColor: T.card, borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: T.border, marginBottom: SPACING.lg }}>
          <Text style={{ color: T.text, fontSize: FONTS.lg, fontWeight: FONTS.bold, marginBottom: SPACING.lg }}>
            By Category
          </Text>
          {pieData.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Text style={{ fontSize: 36 }}>📊</Text>
              <Text style={{ color: T.muted, marginTop: 10, fontWeight: FONTS.semibold }}>No data yet</Text>
              <Text style={{ color: T.muted, fontSize: FONTS.sm }}>Add some transactions first</Text>
            </View>
          ) : (
            <>
              <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                <PieChart
                  data={pieData}
                  donut
                  radius={100}
                  innerRadius={60}
                  centerLabelComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: T.subtext, fontSize: FONTS.xs }}>Total</Text>
                      <Text style={{ color: T.text, fontSize: FONTS.md, fontWeight: FONTS.bold }}>
                        {formatAmount(total)}
                      </Text>
                    </View>
                  )}
                />
              </View>
              {/* LEGEND */}
              {pieData.map(d => (
                <View key={d.id} style={{ marginBottom: SPACING.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: d.color }} />
                      <Text style={{ color: T.text, fontSize: FONTS.sm, fontWeight: FONTS.semibold }}>
                        {d.label}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: T.text, fontSize: FONTS.sm, fontWeight: FONTS.bold }}>
                        {formatAmount(d.value)}
                      </Text>
                      <Text style={{ color: T.muted, fontSize: FONTS.xs }}>
                        {total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%
                      </Text>
                    </View>
                  </View>
                  {/* PROGRESS BAR */}
                  <View style={{ height: 6, backgroundColor: T.input, borderRadius: 99 }}>
                    <View style={{ height: '100%', width: `${total > 0 ? (d.value / total) * 100 : 0}%`, backgroundColor: d.color, borderRadius: 99 }} />
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        {/* BAR CHART */}
        <View style={{ backgroundColor: T.card, borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: T.border }}>
          <Text style={{ color: T.text, fontSize: FONTS.lg, fontWeight: FONTS.bold, marginBottom: SPACING.lg }}>
            Last 6 Months
          </Text>
          <BarChart
            data={barData}
            barWidth={32}
            spacing={16}
            roundedTop
            hideRules
            xAxisThickness={1}
            xAxisColor={T.border}
            yAxisThickness={0}
            yAxisTextStyle={{ color: T.muted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: T.muted, fontSize: 11 }}
            noOfSections={4}
            maxValue={Math.max(...barData.map(d => d.value), 1000)}
            width={SCREEN_WIDTH - 90}
            height={160}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}