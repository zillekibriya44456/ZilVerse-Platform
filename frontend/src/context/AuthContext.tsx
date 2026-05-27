"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../utils/socket';

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
