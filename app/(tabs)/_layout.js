// app/(tabs)/_layout.js
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import useStore from '../../store/useStore';
import { supabase } from '../../supabase';
import { scheduleSpendlyReminders } from '../../utils/notifications';

export default function TabsLayout() {
  const isDark = useStore(s => s.isDark);
  const isLoaded = useStore(s => s.isLoaded);
  const loadAll = useStore(s => s.loadAll);
  const setUser = useStore(s => s.setUser);
  const T = isDark ? COLORS.dark : COLORS.light;
  const router = useRouter();

  useEffect(() => {
    loadAll();
    scheduleSpendlyReminders();

    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUser(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        router.replace('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#2563EB',
        alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Text style={{ fontSize: 64 }}>💰</Text>
        <Text style={{ color: '#fff', fontSize: 32,
          fontWeight: '800', letterSpacing: -1 }}>
          Spendly
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)',
          fontSize: 14, marginTop: 4 }}>
          Loading your finances...
        </Text>
        <ActivityIndicator color="rgba(255,255,255,0.8)"
          size="large" style={{ marginTop: 8 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: T.card,
            borderTopColor: T.border,
            borderTopWidth: 1,
            height: 90,
            paddingBottom: 30,
            paddingTop: 6,
            elevation: 8,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: T.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Home',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="home-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="analysis" options={{ title: 'Analysis',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="pie-chart-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="accounts" options={{ title: 'Accounts',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="wallet-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="lend" options={{ title: 'Lend',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="people-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="settings-outline" size={size} color={color} /> }} />
      </Tabs>
    </>
  );
}
