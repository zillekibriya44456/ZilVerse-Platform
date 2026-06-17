"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { socket } from '../utils/socket';
import { API_BASE } from '@/utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isHydrated: boolean;   // ← expose so Navbar can suppress flicker
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]           = useState<User | null>(null);
  const [token, setToken]         = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── 1. Hydrate from localStorage on mount (client-only) ──────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('zilverse_token');
      const storedUser  = localStorage.getItem('zilverse_user');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);

        // Re-connect socket with the stored token
        socket.auth = { token: storedToken };
        if (!socket.connected) socket.connect();
      }
    } catch (e) {
      // Corrupted localStorage — clear it
      localStorage.removeItem('zilverse_token');
      localStorage.removeItem('zilverse_user');
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // ── 2. Login — sets state + persists + connects socket ──────────────────
  const login = useCallback((userData: User, newToken: string) => {
    // Persist first so any immediate re-read of localStorage is consistent
    localStorage.setItem('zilverse_token', newToken);
    localStorage.setItem('zilverse_user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    socket.auth = { token: newToken };
    if (!socket.connected) socket.connect();
  }, []);

  // ── 3. Logout — clear state + storage + disconnect socket ───────────────
  const logout = useCallback(() => {
    localStorage.removeItem('zilverse_token');
    localStorage.removeItem('zilverse_user');

    setUser(null);
    setToken(null);
    socket.disconnect();
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isHydrated,
    login,
    logout,
  }), [user, token, isHydrated, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
