// app/(tabs)/_layout.js
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import useStore from '../../store/useStore';
import { scheduleSpendlyReminders } from '../../utils/notifications';

export default function TabsLayout() {
  const isDark = useStore(s => s.isDark);
  const isLoaded = useStore(s => s.isLoaded);
  const loadAll = useStore(s => s.loadAll);
  const T = isDark ? COLORS.dark : COLORS.light;

  useEffect(() => {
    loadAll();
    scheduleSpendlyReminders();
  }, []);

  if (!isLoaded) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <Text style={{ fontSize: 64 }}>💰</Text>
        <Text style={{
          color: '#fff',
          fontSize: 32,
          fontWeight: '800',
          letterSpacing: -1,
        }}>
          Spendly
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
          Loading your finances...
        </Text>
        <ActivityIndicator
          color="rgba(255,255,255,0.8)"
          size="large"
          style={{ marginTop: 8 }}
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: T.card,
            borderTopColor: T.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: T.muted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) =>
              <Ionicons name="home-outline" size={size} color={color} />,
          }} />
        <Tabs.Screen name="analysis"
          options={{
            title: 'Analysis',
            tabBarIcon: ({ color, size }) =>
              <Ionicons name="pie-chart-outline" size={size} color={color} />,
          }} />
        <Tabs.Screen name="accounts"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ color, size }) =>
              <Ionicons name="wallet-outline" size={size} color={color} />,
          }} />
        <Tabs.Screen name="lend"
          options={{
            title: 'Lend',
            tabBarIcon: ({ color, size }) =>
              <Ionicons name="people-outline" size={size} color={color} />,
          }} />
        <Tabs.Screen name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) =>
              <Ionicons name="settings-outline" size={size} color={color} />,
          }} />
      </Tabs>
    </>
  );
}