'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS = {
  'student@ulsa.edu.ni': {
    id: '2',
    email: 'student@ulsa.edu.ni',
    name: 'Juan García',
    role: 'student' as const,
  },
  'admin@ulsa.edu.ni': {
    id: '1',
    email: 'admin@ulsa.edu.ni',
    name: 'Admin User',
    role: 'admin' as const,
  },
  'bienestar.estudiantil@ulsa.edu.ni': {
    id: '3',
    email: 'bienestar.estudiantil@ulsa.edu.ni',
    name: 'Bienestar Estudiantil',
    role: 'admin' as const,
  },
  'd.asesoria-estudiantil@ulsa.edu.ni': {
    id: '4',
    email: 'd.asesoria-estudiantil@ulsa.edu.ni',
    name: 'Dirección de Asesoría Estudiantil',
    role: 'admin' as const,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  };

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
      if (mockUser && password === 'password') {
        setUser(mockUser);
        return mockUser;
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      // NOTE: For a real production app, verify this credential server-side.
      const payload = parseJwt(credential);
      const email = payload.email as string;
      const name = payload.name as string;

      const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
      const user: User = mockUser ?? {
        id: email,
        email,
        name,
        role: 'student',
      };

      setUser(user);
      return user;
    } catch (error) {
      throw new Error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
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
