// utils/exportData.js
// 📤 Export transactions as PDF or Excel (Expo Go compatible)

import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ── EXPORT AS PDF ──────────────────────────────────────────────
export async function exportAsPDF(transactions, accounts, currency) {
  try {
    const sym = currency.symbol;

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    const rows = transactions.map((t, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9f9f9'}">
        <td style="padding:10px 12px;font-size:12px;border-bottom:1px solid #eee;">${t.date}</td>
        <td style="padding:10px 12px;font-size:12px;border-bottom:1px solid #eee;text-transform:capitalize;">${t.type}</td>
        <td style="padding:10px 12px;font-size:12px;border-bottom:1px solid #eee;">${t.note || '-'}</td>
        <td style="padding:10px 12px;font-size:12px;border-bottom:1px solid #eee;text-align:right;
          color:${t.type === 'income' ? '#16A34A' : '#DC2626'};font-weight:700;">
          ${t.type === 'income' ? '+' : '-'}${sym}${t.amount.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 32px; color: #1A1A1A; }
          .header { margin-bottom: 24px; }
          .app-name { color: #2563EB; font-size: 26px; font-weight: 800; }
          .subtitle { color: #6B6B6B; font-size: 13px; margin-top: 4px; }
          .summary { display: flex; gap: 12px; margin-bottom: 28px; }
          .card { flex: 1; padding: 14px 16px; border-radius: 10px; }
          .card-label { font-size: 11px; font-weight: 700; margin-bottom: 5px; }
          .card-value { font-size: 20px; font-weight: 800; }
          .section-title { font-size: 14px; font-weight: 700; color: #1A1A1A; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #2563EB; }
          th { color: white; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 700; }
          th:last-child { text-align: right; }
          .footer { margin-top: 24px; color: #9CA3AF; font-size: 11px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="app-name">💰 Spendly</div>
          <div class="subtitle">Transaction Report · Generated ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        <div class="summary">
          <div class="card" style="background:#DCFCE7;">
            <div class="card-label" style="color:#16A34A;">INCOME</div>
            <div class="card-value" style="color:#16A34A;">${sym}${totalIncome.toFixed(2)}</div>
          </div>
          <div class="card" style="background:#FEE2E2;">
            <div class="card-label" style="color:#DC2626;">EXPENSES</div>
            <div class="card-value" style="color:#DC2626;">${sym}${totalExpense.toFixed(2)}</div>
          </div>
          <div class="card" style="background:#EFF4FF;">
            <div class="card-label" style="color:#2563EB;">NET BALANCE</div>
            <div class="card-value" style="color:#2563EB;">${sym}${netBalance.toFixed(2)}</div>
          </div>
        </div>

        <div class="section-title">All Transactions (${transactions.length})</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Note</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="footer">
          Spendly v1.0.0 · ${transactions.length} transactions · ${currency.code} · Your Personal Finance App
        </div>
      </body>
      </html>
    `;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Check if sharing is available
    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or Share Spendly Report',
        UTI: 'com.adobe.pdf',
      });
    } else {
      // Fallback — open print dialog
      await Print.printAsync({ uri });
    }

    return true;
  } catch (error) {
    console.error('PDF Error:', error.message);
    throw error;
  }
}

// ── EXPORT AS EXCEL ────────────────────────────────────────────
export async function exportAsExcel(transactions, accounts, currency) {
  try {
    const sym = currency.symbol;

    // Build CSV content (works in Expo Go without native modules)
    const headers = ['Date', 'Type', 'Category', 'Account', 'Note', 'Amount', 'Currency'];

    const rows = transactions.map(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      const amount = t.type === 'income' ? t.amount : -t.amount;
      return [
        t.date,
        t.type,
        t.categoryId || '-',
        acc?.name || '-',
        `"${(t.note || '-').replace(/"/g, '""')}"`,
        amount.toFixed(2),
        t.currency || currency.code,
      ].join(',');
    });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const summary = [
      '',
      '--- SUMMARY ---',
      `Total Income,${sym}${totalIncome.toFixed(2)}`,
      `Total Expenses,${sym}${totalExpense.toFixed(2)}`,
      `Net Balance,${sym}${(totalIncome - totalExpense).toFixed(2)}`,
      `Total Transactions,${transactions.length}`,
      `Currency,${currency.code}`,
      `Generated,${new Date().toLocaleDateString()}`,
    ];

    const csvContent = [
      headers.join(','),
      ...rows,
      ...summary,
    ].join('\n');

    // Save as CSV (opens in Excel perfectly)
    const uri = FileSystem.documentDirectory + `Spendly_Export_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(uri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Save or Share Spendly Data',
      });
    }

    return true;
  } catch (error) {
    console.error('Excel Error:', error.message);
    throw error;
  }
}