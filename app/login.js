// app/login.js
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform,
    SafeAreaView,
    ScrollView,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import useStore from '../store/useStore';
import { supabase } from '../supabase';
export default function LoginScreen() {
  const isDark = useStore(s => s.isDark);
  const T = isDark ? COLORS.dark : COLORS.light;
  const setUser = useStore(s => s.setUser);

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
      return;
    }
    setUser(data.user);
    router.replace('/(tabs)');
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Signup Failed', error.message);
      return;
    }
    Alert.alert(
      '✅ Account Created!',
      'Please check your email to verify your account, then log in.',
      [{ text: 'OK', onPress: () => setMode('login') }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* TOP SECTION */}
          <View style={{ alignItems: 'center', paddingTop: 60, paddingBottom: 40 }}>
            <View style={{ width: 80, height: 80, borderRadius: 24,
              backgroundColor: COLORS.primary,
              alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 40 }}>💰</Text>
            </View>
            <Text style={{ color: T.text, fontSize: 32, fontWeight: FONTS.bold,
              letterSpacing: -1 }}>
              Spendly
            </Text>
            <Text style={{ color: T.subtext, fontSize: FONTS.md, marginTop: 6 }}>
              {mode === 'login' ? 'Welcome back! 👋' : 'Create your account 🚀'}
            </Text>
          </View>

          {/* FORM */}
          <View style={{ paddingHorizontal: SPACING.xl }}>

            {/* MODE TOGGLE */}
            <View style={{ flexDirection: 'row', backgroundColor: T.card,
              borderRadius: RADIUS.md, padding: 4,
              borderWidth: 1, borderColor: T.border, marginBottom: 24 }}>
              {['login', 'signup'].map(m => (
                <TouchableOpacity key={m} onPress={() => setMode(m)}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: RADIUS.sm,
                    alignItems: 'center',
                    backgroundColor: mode === m ? COLORS.primary : 'transparent' }}>
                  <Text style={{ color: mode === m ? '#fff' : T.subtext,
                    fontWeight: FONTS.bold, fontSize: FONTS.md,
                    textTransform: 'capitalize' }}>
                    {m === 'login' ? 'Log In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* NAME (signup only) */}
            {mode === 'signup' && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: T.subtext, fontSize: FONTS.sm,
                  fontWeight: FONTS.semibold, marginBottom: 8 }}>
                  Full Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Hardik Mittal"
                  placeholderTextColor={T.muted}
                  autoCapitalize="words"
                  style={{ backgroundColor: T.input, borderRadius: RADIUS.lg,
                    padding: 14, color: T.text, fontSize: FONTS.md,
                    borderWidth: 1, borderColor: T.border }} />
              </View>
            )}

            {/* EMAIL */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: T.subtext, fontSize: FONTS.sm,
                fontWeight: FONTS.semibold, marginBottom: 8 }}>
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={T.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ backgroundColor: T.input, borderRadius: RADIUS.lg,
                  padding: 14, color: T.text, fontSize: FONTS.md,
                  borderWidth: 1, borderColor: T.border }} />
            </View>

            {/* PASSWORD */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: T.subtext, fontSize: FONTS.sm,
                fontWeight: FONTS.semibold, marginBottom: 8 }}>
                Password
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center',
                backgroundColor: T.input, borderRadius: RADIUS.lg,
                borderWidth: 1, borderColor: T.border }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter password'}
                  placeholderTextColor={T.muted}
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, padding: 14, color: T.text, fontSize: FONTS.md }} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 14 }}>
                  <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              onPress={mode === 'login' ? handleLogin : handleSignup}
              disabled={loading}
              style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
                padding: 16, alignItems: 'center', marginBottom: 16,
                opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: '#fff', fontWeight: FONTS.bold, fontSize: FONTS.lg }}>
                    {mode === 'login' ? 'Log In →' : 'Create Account →'}
                  </Text>
              }
            </TouchableOpacity>

            {/* SKIP / GUEST */}
            <TouchableOpacity onPress={() => router.replace('/(tabs)')}
              style={{ alignItems: 'center', padding: 12 }}>
              <Text style={{ color: T.muted, fontSize: FONTS.sm }}>
                Skip for now — use without account
              </Text>
            </TouchableOpacity>

          </View>

          {/* FOOTER */}
          <View style={{ alignItems: 'center', paddingVertical: 30 }}>
            <Text style={{ color: T.muted, fontSize: FONTS.xs }}>
              Your data is encrypted & safe 🔒
            </Text>
            <Text style={{ color: T.muted, fontSize: FONTS.xs, marginTop: 4 }}>
              Designed & Developed by Hardik Mittal ✨
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}