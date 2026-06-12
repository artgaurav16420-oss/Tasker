import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. See .env.example.'
  );
}

const initialHash = typeof window !== 'undefined' ? window.location.hash : '';

export function isRecoveryFlow() {
  if (!initialHash) return false;
  const params = new URLSearchParams(initialHash.substring(1));
  return params.get('type') === 'recovery';
}

export function getRecoverySession() {
  if (!initialHash) return null;
  const params = new URLSearchParams(initialHash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken) return null;
  return { access_token: accessToken, refresh_token: refreshToken || undefined };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
