'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthContextType } from './types';
import { AUTH_TOKEN_KEY, fetchCurrentUser, loginWithApi } from '@/lib/api-client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (typeof window === 'undefined') {
        if (isMounted) setLoading(false);
        return;
      }

      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginWithApi(email, password);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      }
      setUser(response.user);
      return response.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (_credential: string) => {
    throw new Error('Google sign-in is not configured in backend yet.');
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
