'use client';

import {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode,
} from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export type OAuthProvider = 'google' | 'github' | 'facebook';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn:         (email: string, password: string) => Promise<{ error: string | null }>;
  signUp:         (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithOAuth:(provider: OAuthProvider)         => Promise<{ error: string | null }>;
  signOut:        () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

// createBrowserClient deduplicates internally — safe to call in render.
function makeClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = makeClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await makeClient().auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await makeClient().auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : undefined;
    const { error } = await makeClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await makeClient().auth.signOut();
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, signIn, signUp, signInWithOAuth, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
