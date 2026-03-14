// supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gugdqdmlhdreibpvncpa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Z2RxZG1saGRyZWlicHZuY3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0Nzg4MDAsImV4cCI6MjA4OTA1NDgwMH0.QNlcztvpv3NyqpRSlZJ3CLT9whFmVSsuMl1B8EDU5y0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});