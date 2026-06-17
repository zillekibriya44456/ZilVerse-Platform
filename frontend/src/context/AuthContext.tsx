"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { socket } from '../utils/socket';
import axios from 'axios';
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
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Initial Local Storage Hydration (runs once)
  useEffect(() => {
    const storedToken = localStorage.getItem('zilverse_token');
    const storedUser = localStorage.getItem('zilverse_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        socket.auth = { token: storedToken };
        socket.connect();
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
    setIsHydrated(true);
  }, []);

  // 2. Removed better-auth session sync to prevent conflicts and loops

  // Stable Login Reference
  const login = useCallback((userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('zilverse_token', newToken);
    localStorage.setItem('zilverse_user', JSON.stringify(userData));
    
    socket.auth = { token: newToken };
    socket.connect();
  }, []);

  // Stable Logout Reference
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('zilverse_token');
    localStorage.removeItem('zilverse_user');
    socket.disconnect();
  }, []);

  // Memoize Provider Value
  const value = useMemo(() => ({
    user,
    token,
    login,
    logout
  }), [user, token, login, logout]);

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
