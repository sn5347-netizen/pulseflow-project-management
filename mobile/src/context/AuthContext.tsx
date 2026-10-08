import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { mobileApi, setOnAuthExpired, setOnNetworkStatusChange } from '../services/api';

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnline: boolean;
  sessionExpiredMsg: string | null;
  clearSessionExpiredMsg: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(null);

  useEffect(() => {
    setOnAuthExpired((msg) => {
      setUser(null);
      setToken(null);
      setSessionExpiredMsg(msg);
    });

    setOnNetworkStatusChange((online) => {
      setIsOnline(online);
    });

    const initAuth = async () => {
      try {
        const storedToken = await storage.getToken();
        const storedUser = await storage.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          // Verify with backend
          try {
            const meRes = await mobileApi.auth.me();
            if (meRes.user) {
              setUser(meRes.user);
              await storage.saveUser(meRes.user);
            }
          } catch (e: any) {
            // If offline, keep offline session
            console.log('Backend auth verification check:', e.message);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await mobileApi.auth.login(credentials);
    if (res.token && res.user) {
      await storage.saveToken(res.token);
      await storage.saveUser(res.user);
      setToken(res.token);
      setUser(res.user);
      setSessionExpiredMsg(null);
    }
  };

  const register = async (data: { fullName: string; email: string; password: string }) => {
    const res = await mobileApi.auth.register(data);
    if (res.token && res.user) {
      await storage.saveToken(res.token);
      await storage.saveUser(res.user);
      setToken(res.token);
      setUser(res.user);
      setSessionExpiredMsg(null);
    }
  };

  const logout = async () => {
    try {
      await mobileApi.auth.logout();
    } catch {}
    await storage.removeToken();
    await storage.removeUser();
    setToken(null);
    setUser(null);
  };

  const clearSessionExpiredMsg = () => setSessionExpiredMsg(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isOnline,
        sessionExpiredMsg,
        clearSessionExpiredMsg,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

