<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-2563EB?style=for-the-badge" />
<img src="https://img.shields.io/badge/platform-Android-22C55E?style=for-the-badge" />
<img src="https://img.shields.io/badge/built_with-React_Native-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/expo-SDK_54-000020?style=for-the-badge&logo=expo" />

# 💰 Spendly
### Your Smart Personal Finance Manager

*Track expenses, budgets & loans — your smart money manager!*

**Designed & Developed by [Hardik Mittal](https://github.com/hardiksakshammittal1307-git) ✨**

</div>

---

## 📖 About Spendly

**Spendly** is a smart and simple personal finance app designed to help you take full control of your money. Track your daily income and expenses, manage multiple accounts, set monthly budgets, and monitor your spending with beautiful charts and analysis.

Never lose track of who owes you money — Spendly's built-in **Lend & Borrow** feature lets you record loans, set due dates, and get overdue alerts automatically. Stay on top of your finances with smart reminders every 4 hours throughout the day.

With support for **10 major currencies**, dark mode, PDF and Excel export, and data that saves permanently on your device — Spendly is the only finance app you'll ever need.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💸 **Transactions** | Add, edit & delete income/expenses with date & time picker |
| 💳 **Accounts** | Manage multiple accounts — Cash, UPI, Savings, Credit & more |
| 🎯 **Budgets** | Set monthly spending limits with over-budget alerts |
| 🔄 **Transfers** | Transfer money between your accounts instantly |
| 🤝 **Lend & Borrow** | Track loans with due dates and overdue detection |
| 📊 **Analysis** | Beautiful pie charts & bar charts for spending insights |
| 📄 **Export** | Export your data as PDF or Excel (CSV) |
| 🌙 **Dark Mode** | Full dark mode support across all screens |
| 💱 **Multi Currency** | Support for 10 major currencies including ₹ INR |
| 🔔 **Notifications** | Smart reminders at 8AM, 12PM, 4PM, 8PM & 12AM |
| 💾 **Offline First** | All data saved permanently on your device |
| 🎨 **Custom Categories** | Add your own income & expense categories |

---

## 🛠️ Tech Stack

```
React Native + Expo SDK 54
├── Expo Router          — File-based navigation
├── Zustand              — State management
├── AsyncStorage         — Permanent local data storage
├── expo-notifications   — Scheduled daily reminders
├── expo-print           — PDF export
├── XLSX                 — Excel/CSV export
├── react-native-gifted-charts — Pie & bar charts
├── @react-native-community/datetimepicker — Native date/time picker
└── EAS Build            — APK generation & deployment
```

---

## 📱 Screenshots

| Home Screen | Analysis | Accounts & Budget |
|---|---|---|
| Balance card, transactions, quick actions | Pie chart & bar chart insights | Account cards & budget progress |

---

## 🚀 Getting Started

### Prerequisites
- Node.js LTS
- Expo Go app on your Android/iOS device

### Installation

```bash
# Clone the repository
git clone https://github.com/hardiksakshammittal1307-git/Spendly.git

# Navigate to project
cd Spendly

# Install dependencies
npm install

# Start the development server
npx expo start --clear
```

Scan the QR code with **Expo Go** on your phone and the app will load instantly!

---

## 📦 Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

---

## 📂 Project Structure

```
Spendly/
├── app/
│   ├── _layout.js          ← Root layout & splash screen
│   └── (tabs)/
│       ├── index.js         ← Home screen
│       ├── analysis.js      ← Charts & insights
│       ├── accounts.js      ← Accounts, budget, transfers
│       ├── lend.js          ← Lend & borrow tracker
│       └── settings.js      ← App settings
├── store/
│   └── useStore.js          ← Zustand store + AsyncStorage
├── constants/
│   └── theme.js             ← Colors, fonts, currencies
└── utils/
    ├── notifications.js     ← Scheduled reminders
    └── exportData.js        ← PDF & Excel export
```

---

## 🔮 Roadmap — Spendly v2.0

- [ ] 🔐 Login with Google / Email
- [ ] ☁️ Cloud sync across devices (Supabase)
- [ ] 📱 Home screen widget
- [ ] 🏦 Bank statement import
- [ ] 📈 Investment & savings tracker
- [ ] 🌍 Multi language support
- [ ] 🎯 Financial goals & savings targets
- [ ] 📅 Recurring transactions

---

## 🙏 Feedback & Contributions

I just released **Spendly v1.0.0** and I would love your feedback!

- 🐛 **Found a bug?** Open an [Issue](https://github.com/hardiksakshammittal1307-git/Spendly/issues)
- 💡 **Have a feature idea?** Open an [Issue](https://github.com/hardiksakshammittal1307-git/Spendly/issues) and label it `enhancement`
- ⭐ **Like the project?** Give it a star — it means a lot!

Every suggestion goes directly into the next version of Spendly!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ by Hardik Mittal**

*If you found this helpful, please consider giving it a ⭐*

</div>