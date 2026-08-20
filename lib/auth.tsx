'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthUser } from '@/lib/api';

type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  signIn: (token: string, user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('bb_user');
      if (stored && window.localStorage.getItem('bb_token')) setUser(JSON.parse(stored));
    } catch { /* ignore corrupted local storage */ }
    setHydrated(true);
  }, []);

  const signIn = useCallback((token: string, nextUser: AuthUser) => {
    window.localStorage.setItem('bb_token', token);
    window.localStorage.setItem('bb_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);
  const signOut = useCallback(() => {
    window.localStorage.removeItem('bb_token');
    window.localStorage.removeItem('bb_user');
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, hydrated, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
