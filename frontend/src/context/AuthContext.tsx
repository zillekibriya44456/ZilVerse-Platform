"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../utils/socket';
import { API_BASE } from '@/utils/api';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  verified?: boolean;
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  login:  (userData: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Axios instance with auto-refresh ─────────────────────────────────────────
export const authAxios = axios.create({ baseURL: API_BASE });

// ── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,       setUser]       = useState<User | null>(null);
  const [token,      setToken]      = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Token refresh function ────────────────────────────────────────────────
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const storedRefresh = localStorage.getItem('zilverse_refresh');
      if (!storedRefresh) return null;

      const res = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken: storedRefresh });
      const { accessToken } = res.data;

      localStorage.setItem('zilverse_token', accessToken);
      setToken(accessToken);

      // Reconnect socket with new token
      socket.auth = { token: accessToken };
      if (socket.connected) socket.disconnect();
      socket.connect();

      return accessToken;
    } catch {
      // Refresh failed — force logout
      logout();
      return null;
    }
  }, []); // eslint-disable-line

  // ── Schedule silent refresh 2 min before expiry (15-min tokens) ──────────
  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    // Refresh after 13 minutes (2 min before 15-min expiry)
    refreshTimer.current = setTimeout(refreshAccessToken, 13 * 60 * 1000);
  }, [refreshAccessToken]);

  // ── 1. Hydrate from localStorage ─────────────────────────────────────────
  useEffect(() => {
    try {
      const storedToken   = localStorage.getItem('zilverse_token');
      const storedRefresh = localStorage.getItem('zilverse_refresh');
      const storedUser    = localStorage.getItem('zilverse_user');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);

        socket.auth = { token: storedToken };
        if (!socket.connected) socket.connect();

        scheduleRefresh(storedToken);
      }
    } catch {
      localStorage.removeItem('zilverse_token');
      localStorage.removeItem('zilverse_refresh');
      localStorage.removeItem('zilverse_user');
    } finally {
      setIsHydrated(true);
    }
  }, []); // eslint-disable-line

  // ── 2. Axios interceptor — auto-refresh on 401 TOKEN_EXPIRED ─────────────
  useEffect(() => {
    const interceptor = authAxios.interceptors.response.use(
      res => res,
      async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
          original._retry = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            original.headers['Authorization'] = `Bearer ${newToken}`;
            return authAxios(original);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => authAxios.interceptors.response.eject(interceptor);
  }, [refreshAccessToken]);

  // ── 3. Login ──────────────────────────────────────────────────────────────
  const login = useCallback((userData: User, accessToken: string, refreshToken?: string) => {
    localStorage.setItem('zilverse_token', accessToken);
    localStorage.setItem('zilverse_user', JSON.stringify(userData));
    if (refreshToken) localStorage.setItem('zilverse_refresh', refreshToken);

    setToken(accessToken);
    setUser(userData);

    socket.auth = { token: accessToken };
    if (!socket.connected) socket.connect();

    scheduleRefresh(accessToken);
  }, [scheduleRefresh]);

  // ── 4. Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('zilverse_refresh');
    const token        = localStorage.getItem('zilverse_token');

    // Revoke session on backend (fire-and-forget)
    if (token) {
      axios.post(`${API_BASE}/api/auth/logout`, { refreshToken }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }

    localStorage.removeItem('zilverse_token');
    localStorage.removeItem('zilverse_refresh');
    localStorage.removeItem('zilverse_user');

    setUser(null);
    setToken(null);

    if (socket.connected) socket.disconnect();
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isHydrated, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
