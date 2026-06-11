import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. See .env.example.'
  );
}

// Capture URL hash before Supabase async init clears it
const initialHash = typeof window !== 'undefined' ? window.location.hash : '';

export function isRecoveryFlow() {
  if (!initialHash) return false;
  const params = new URLSearchParams(initialHash.substring(1));
  return params.get('type') === 'recovery';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
