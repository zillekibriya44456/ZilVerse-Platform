"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Check local storage for token and user on initial load
    const storedToken = localStorage.getItem('zilverse_token');
    const storedUser = localStorage.getItem('zilverse_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Pass JWT token securely in handshake auth payload
        socket.auth = { token: storedToken };
        socket.connect();
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      const storedToken = localStorage.getItem('zilverse_token');
      if (!storedToken) {
        // Sync session with Express backend to get JWT token
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
  }, [session, isPending]);

  const login = (userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('zilverse_token', newToken);
    localStorage.setItem('zilverse_user', JSON.stringify(userData));
    
    // Pass JWT token securely in handshake auth payload
    socket.auth = { token: newToken };
    socket.connect();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('zilverse_token');
    localStorage.removeItem('zilverse_user');
    
    signOut().catch(console.error);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
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
