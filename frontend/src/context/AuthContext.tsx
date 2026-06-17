"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { socket } from '../utils/socket';

import { signOut, useSession } from "@/lib/auth-client";
import axios from 'axios';
import { API_BASE } from '@/utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
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
  const { data: session, isPending } = useSession();

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

  // 2. Sync Session from `better-auth` if needed
  useEffect(() => {
    if (!isHydrated || isPending) return;

    if (session?.user) {
      const storedToken = localStorage.getItem('zilverse_token');
      // If we don't have a token but have a session, we need to sync with Express
      if (!storedToken) {
        axios.post(`${API_BASE}/api/auth/social`, {
          email: session.user.email,
          name: session.user.name,
          provider: 'better-auth'
        })
        .then(res => {
          const { token: jwtToken, user: userData } = res.data;
          setUser(userData);
          setToken(jwtToken);
          localStorage.setItem('zilverse_token', jwtToken);
          localStorage.setItem('zilverse_user', JSON.stringify(userData));
          
          socket.auth = { token: jwtToken };
          socket.connect();
        })
        .catch(err => {
          console.error("Failed to sync social login with backend", err);
        });
      }
    }
  }, [session, isPending, isHydrated]);

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
    
    signOut().catch(console.error);
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
