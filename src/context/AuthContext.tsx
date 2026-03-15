import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '@/lib/supabase';
import type { AuthUser, LoginCredentials, RegisterCredentials, UserProfile, Organisation } from '@/types/auth';
import { setAuthToken, api } from '@/services/api';

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<{ error: string | null }>;
  signUp: (credentials: RegisterCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'fullName' | 'avatarUrl' | 'department'>>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo mode mock user — used when Supabase is not configured
const DEMO_USER: AuthUser = {
  id: 'demo-user-001',
  email: 'demo@itson.pro',
  profile: {
    id: 'demo-user-001',
    organisationId: 'demo-org-001',
    email: 'demo@itson.pro',
    fullName: 'Demo User',
    avatarUrl: null,
    role: 'owner',
    department: 'Management',
  },
  organisation: {
    id: 'demo-org-001',
    name: 'CLG Demo Company',
    slug: 'clg-demo',
    plan: 'trial',
  },
};

async function fetchUserProfile(userId: string): Promise<{ profile: UserProfile | null; organisation: Organisation | null }> {
  if (!supabase) return { profile: null, organisation: null };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, organisations(*)')
    .eq('id', userId)
    .single();

  if (error || !profile) return { profile: null, organisation: null };

  return {
    profile: {
      id: profile.id,
      organisationId: profile.organisation_id,
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      role: profile.role as UserProfile['role'],
      department: profile.department,
    },
    organisation: profile.organisations
      ? {
          id: (profile.organisations as any).id,
          name: (profile.organisations as any).name,
          slug: (profile.organisations as any).slug,
          plan: (profile.organisations as any).plan,
        }
      : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: isDemoMode ? DEMO_USER : null,
    session: null,
    loading: !isDemoMode,
    isDemoMode,
  });

  useEffect(() => {
    if (isDemoMode || !supabase) return;

    // Initial session fetch
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setAuthToken(session.access_token);
        const { profile, organisation } = await fetchUserProfile(session.user.id);
        setState({
          session,
          user: { id: session.user.id, email: session.user.email ?? '', profile, organisation },
          loading: false,
          isDemoMode: false,
        });
      } else {
        setAuthToken(null);
        setState(s => ({ ...s, loading: false }));
      }
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthToken(session.access_token);
        const { profile, organisation } = await fetchUserProfile(session.user.id);
        setState({
          session,
          user: { id: session.user.id, email: session.user.email ?? '', profile, organisation },
          loading: false,
          isDemoMode: false,
        });
      } else {
        setAuthToken(null);
        setState({ user: null, session: null, loading: false, isDemoMode: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async ({ email, password }: LoginCredentials) => {
    if (isDemoMode) {
      // Demo mode: accept any credentials
      setState(s => ({ ...s, user: DEMO_USER }));
      return { error: null };
    }
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    }
    // REST API backend fallback (no Supabase configured)
    try {
      const data = await api.post<{ accessToken: string; user: { id: string; email: string; role: string } }>(
        '/api/auth/login',
        { email, password },
      );
      setAuthToken(data.accessToken);
      setState(s => ({
        ...s,
        user: {
          id: data.user.id,
          email: data.user.email,
          profile: {
            id: data.user.id,
            organisationId: '',
            email: data.user.email,
            fullName: data.user.email,
            avatarUrl: null,
            role: (data.user.role?.toLowerCase() ?? 'member') as UserProfile['role'],
            department: null,
          },
          organisation: null,
        },
      }));
      return { error: null };
    } catch (err: any) {
      return { error: err?.message ?? 'Login failed' };
    }
  }, []);

  const signUp = useCallback(async ({ email, password, fullName, organisationName }: RegisterCredentials) => {
    if (isDemoMode || !supabase) return { error: 'Configure Supabase to enable registration.' };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, organisation_name: organisationName } },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Registration failed. Please try again.' };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    if (isDemoMode || !supabase) {
      setState(s => ({ ...s, user: null }));
      return;
    }
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (isDemoMode || !supabase) return { error: 'Configure Supabase to enable password reset.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, 'fullName' | 'avatarUrl' | 'department'>>) => {
    if (isDemoMode || !supabase || !state.user) return { error: null };
    const { error } = await supabase.from('profiles').update({
      full_name: updates.fullName,
      avatar_url: updates.avatarUrl,
      department: updates.department,
      updated_at: new Date().toISOString(),
    }).eq('id', state.user.id);
    if (error) return { error: error.message };
    setState(s => ({
      ...s,
      user: s.user ? {
        ...s.user,
        profile: s.user.profile ? { ...s.user.profile, ...updates } : null,
      } : null,
    }));
    return { error: null };
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
