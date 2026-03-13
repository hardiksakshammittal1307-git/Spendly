// utils/notifications.js
// 🔔 Spendly notification system — reminders every 4 hours

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure how notifications appear when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permission from user
export async function requestNotificationPermission() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

// Schedule reminders every 4 hours
// Times: 8 AM, 12 PM, 4 PM, 8 PM, 12 AM (5 times a day)
export async function scheduleSpendlyReminders() {
  // Cancel all existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const reminders = [
    { hour: 8,  message: "☀️ Morning check-in! Record any expenses from last night." },
    { hour: 12, message: "🍽️ Lunch break! Don't forget to log your morning expenses." },
    { hour: 16, message: "☕ Afternoon reminder! Keep your Spendly up to date." },
    { hour: 20, message: "🌙 Evening update! Log today's expenses before you forget." },
    { hour: 0,  message: "🌑 End of day! Final reminder to record today's spending." },
  ];

  for (const r of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💰 Spendly Reminder",
        body: r.message,
        sound: true,
      },
      trigger: {
        hour: r.hour,
        minute: 0,
        repeats: true,
      },
    });
  }

  return true;
}

// Schedule lend/borrow due date reminder
export async function scheduleDueReminder(person, amount, dueDate, symbol) {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const due = new Date(dueDate);
  // Remind 1 day before due date at 9 AM
  const reminderDate = new Date(due);
  reminderDate.setDate(due.getDate() - 1);
  reminderDate.setHours(9, 0, 0, 0);

  if (reminderDate > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Payment Due Tomorrow!",
        body: `${person} owes you ${symbol}${amount}. Due date is tomorrow!`,
        sound: true,
      },
      trigger: reminderDate,
    });
  }

  // Also remind on the due date itself at 9 AM
  const dueDayReminder = new Date(due);
  dueDayReminder.setHours(9, 0, 0, 0);

  if (dueDayReminder > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 Payment Due Today!",
        body: `${person} owes you ${symbol}${amount}. Due date is TODAY!`,
        sound: true,
      },
      trigger: dueDayReminder,
    });
  }
}

// Cancel all notifications
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}