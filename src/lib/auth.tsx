import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthState {
  /** false when Supabase env vars are missing; the app then runs in demo mode. */
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    college: string;
    branch: string;
    academicYear: string;
    githubUrl?: string;
    linkedinUrl?: string;
    leetcodeUrl?: string;
    hackerrankUrl?: string;
  }) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase is not configured.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signUp: AuthState['signUp'] = useCallback(async (p) => {
    if (!supabase) return { error: 'Supabase is not configured.', needsEmailConfirmation: false };
    // Signup metadata is read by the handle_new_user() trigger in schema (1).sql.
    const { data, error } = await supabase.auth.signUp({
      email: p.email,
      password: p.password,
      options: {
        data: {
          full_name: p.fullName,
          college: p.college,
          branch: p.branch,
          academic_year: p.academicYear,
          github_url: p.githubUrl ?? '',
          linkedin_url: p.linkedinUrl ?? '',
          leetcode_url: p.leetcodeUrl ?? '',
          hackerrank_url: p.hackerrankUrl ?? '',
        },
      },
    });
    return {
      error: error ? error.message : null,
      needsEmailConfirmation: !error && !data.session,
    };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  }, []);

  const value: AuthState = {
    configured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
