import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase/client';
import { UserProfile } from './types';
import { log } from './logger';

export type { UserProfile };

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (user: User | null, profile?: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user, profile = null) => set({ user, profile, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

let globalProfileChannel: ReturnType<typeof supabase.channel> | null = null;
let activeSessionRequest = 0;

async function fetchProfile(uid: string) {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('uid', uid).maybeSingle();
    if (error) throw error;
    return data as UserProfile | null;
  } catch (err) {
    log.error('Error fetching profile:', err);
    return null;
  }
}

function subscribeProfile(user: User) {
  if (globalProfileChannel) {
    supabase.removeChannel(globalProfileChannel);
    globalProfileChannel = null;
  }

  globalProfileChannel = supabase
    .channel(`users:uid:${user.id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users', filter: `uid=eq.${user.id}` },
      async (payload) => {
        const requestId = activeSessionRequest;
        try {
          if (requestId !== activeSessionRequest) return;
          if (payload.new) {
            useAuthStore.getState().setUser(user, payload.new as UserProfile);
            return;
          }
          const profile = await fetchProfile(user.id);
          if (requestId !== activeSessionRequest) return;
          useAuthStore.getState().setUser(user, profile);
        } catch (err) {
          log.error(err);
        }
      },
    )
    .subscribe();
}

async function handleSession(session: Session | null) {
  const requestId = ++activeSessionRequest;

  const user = session?.user ?? null;
  if (!user) {
    if (globalProfileChannel) {
      supabase.removeChannel(globalProfileChannel);
      globalProfileChannel = null;
    }
    useAuthStore.getState().setUser(null, null);
    return;
  }

  try {
    // Fetch profile first while old channel is still active (no subscription gap)
    const profile = await fetchProfile(user.id);
    if (requestId !== activeSessionRequest) return;

    // Swap channels after successful profile fetch
    if (globalProfileChannel) {
      supabase.removeChannel(globalProfileChannel);
      globalProfileChannel = null;
    }

    useAuthStore.getState().setUser(user, profile);
    if (requestId !== activeSessionRequest) return;

    // Guard: ensure no newer session superseded this one before subscribing
    if (requestId !== activeSessionRequest) return;
    subscribeProfile(user);
  } catch (err) {
    if (requestId !== activeSessionRequest) return;
    log.error(err);
    useAuthStore.getState().setUser(user, null);
  }
}

export function initAuth() {
  let disposed = false;

  supabase.auth.getSession().then(({ data, error }) => {
    if (disposed) return;
    if (error) {
      log.error('Session fetch error:', error);
      useAuthStore.getState().setUser(null, null);
      return;
    }
    handleSession(data.session);
  }).catch((err) => {
    log.error('Failed to get session:', err);
    if (!disposed) {
      useAuthStore.getState().setUser(null, null);
    }
  });

  const subscription = supabase.auth.onAuthStateChange((_event, session) => {
    if (disposed) return;
    handleSession(session);
  });

  return () => {
    disposed = true;
    subscription.data.subscription.unsubscribe();
    if (globalProfileChannel) {
      supabase.removeChannel(globalProfileChannel);
      globalProfileChannel = null;
    }
  };
}
