import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

let supabaseClient: SupabaseClient | null = null;

export function initializeSupabase(
  supabaseUrl: string,
  supabaseAnonKey: string
): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseClient;
}

// Add this for testing
export function __resetClientForTesting(): void {
  supabaseClient = null;
}

// ADD THIS MISSING FUNCTION
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error(
      'Supabase client not initialized. Call initializeSupabase first.'
    );
  }
  return supabaseClient;
}

export async function getCurrentUserId(): Promise<string> {
  const client = getSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    throw new Error('User not authenticated');
  }

  return user.id;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const {
      data: { session },
    } = await client.auth.getSession();
    return session !== null;
  } catch {
    return false;
  }
}
