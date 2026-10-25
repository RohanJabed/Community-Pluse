'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole } from '@/lib/types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    organization?: string;
    skills?: string[];
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  switchDemoRole: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string = 'admin123') => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to sign in', 'error');
        setLoading(false);
        return false;
      }
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      setLoading(false);
      return true;
    } catch {
      showToast('Network error during sign in', 'error');
      setLoading(false);
      return false;
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    organization?: string;
    skills?: string[];
  }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          password: formData.password || 'password123',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registration failed', 'error');
        setLoading(false);
        return false;
      }
      setUser(data.user);
      showToast(`Account created! Welcome, ${data.user.name}`, 'success');
      setLoading(false);
      return true;
    } catch {
      showToast('Network error during registration', 'error');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      showToast('Signed out successfully', 'info');
    } catch {
      setUser(null);
    }
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    if (targetRole === 'organizer') {
      await login('organizer@communitypulse.org', 'admin123');
    } else {
      await login('alex.volunteer@gmail.com', 'volunteer123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
