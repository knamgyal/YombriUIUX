import { initializeSupabase } from '@yombri/supabase-client';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and Anon Key must be provided in app.config.ts'
  );
}

export const supabase = initializeSupabase({
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
});
