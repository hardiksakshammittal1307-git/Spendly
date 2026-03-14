// utils/notifications.js
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Create notification channel for Android
async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('spendly-reminders', {
      name: 'Spendly Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
      sound: true,
    });
  }
}

// Request permission
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
export async function scheduleSpendlyReminders() {
  try {
    await setupAndroidChannel();

    const granted = await requestNotificationPermission();
    if (!granted) return false;

    // Cancel existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const reminders = [
      { hour: 8,  minute: 0, body: "☀️ Morning check-in! Don't forget to log last night's expenses." },
      { hour: 12, minute: 0, body: "🍽️ Lunch break! Log your morning expenses in Spendly." },
      { hour: 16, minute: 0, body: "☕ Afternoon reminder! Keep your finances up to date." },
      { hour: 20, minute: 0, body: "🌙 Evening update! Log today's expenses before you forget." },
      { hour: 0,  minute: 0, body: "🌑 End of day! Final reminder to record today's spending." },
    ];

    for (const r of reminders) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Spendly Reminder',
          body: r.body,
          sound: true,
          channelId: 'spendly-reminders',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: r.hour,
          minute: r.minute,
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}

// Cancel all reminders
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Schedule due date reminder for lend/borrow
export async function scheduleDueReminder(person, amount, dueDate, symbol) {
  try {
    await setupAndroidChannel();
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const due = new Date(dueDate);
    const reminderDate = new Date(due);
    reminderDate.setDate(due.getDate() - 1);
    reminderDate.setHours(9, 0, 0, 0);

    if (reminderDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Payment Due Tomorrow!',
          body: `${person} owes you ${symbol}${amount}. Due date is tomorrow!`,
          sound: true,
          channelId: 'spendly-reminders',
        },
        trigger: reminderDate,
      });
    }
  } catch (error) {
    console.error('Due reminder error:', error);
  }
}