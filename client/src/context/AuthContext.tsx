import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'ADMIN' | 'OPERATOR' | 'PASSENGER';
  operatorId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
    let isMounted = true;

    async function loadUser() {
      const savedToken = localStorage.getItem('algions_auth_token');
      const savedUser = localStorage.getItem('algions_auth_user');

      if (savedToken && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (isMounted) {
            setUser(parsed);
            setToken(savedToken);
          }
          const res = await api.get('/auth/me');
          if (isMounted) {
            setUser(res.data.data);
            localStorage.setItem('algions_auth_user', JSON.stringify(res.data.data));
          }
        } catch {
          console.warn('Stale auth session or sleeping server, switching to passenger session');
          try {
            await quickSwitchRole('PASSENGER');
          } catch (e) {
            console.warn('API backend unreachable or waking up:', e);
            if (isMounted) {
              setUser({
                id: 'guest',
                name: 'Guest Passenger',
                email: 'passenger@example.com',
                role: 'PASSENGER'
              });
            }
          }
        }
      } else {
        try {
          await quickSwitchRole('PASSENGER');
        } catch (e) {
          console.warn('API backend unreachable or waking up:', e);
          if (isMounted) {
            setUser({
              id: 'guest',
              name: 'Guest Passenger',
              email: 'passenger@example.com',
              role: 'PASSENGER'
            });
          }
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
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

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { user: registeredUser, token: authToken } = res.data.data;
      setUser(registeredUser);
      setToken(authToken);
      localStorage.setItem('algions_auth_token', authToken);
      localStorage.setItem('algions_auth_user', JSON.stringify(registeredUser));
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
        register,
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
