import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (role: 'PASSENGER' | 'OPERATOR' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('algions_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize or fetch current user profile
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('algions_auth_token');
      const savedUser = localStorage.getItem('algions_auth_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // verify in background
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('algions_auth_user', JSON.stringify(res.data.data));
        } catch (e) {
          console.warn('Stale auth session, auto-logging in default passenger');
          await quickSwitchRole('PASSENGER');
        }
      } else {
        // Default to Demo Passenger for immediate convenience
        await quickSwitchRole('PASSENGER');
      }
      setIsLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email: string, password = 'Password123!') => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: loggedInUser, token: authToken } = res.data.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('algions_auth_token', authToken);
      localStorage.setItem('algions_auth_user', JSON.stringify(loggedInUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('algions_auth_token');
    localStorage.removeItem('algions_auth_user');
  };

  const quickSwitchRole = async (role: 'PASSENGER' | 'OPERATOR' | 'ADMIN') => {
    let email = 'passenger@example.com';
    if (role === 'OPERATOR') email = 'operator@royalbus.com';
    if (role === 'ADMIN') email = 'admin@algions.com';

    await login(email, 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        quickSwitchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
