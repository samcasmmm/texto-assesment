import React, { createContext, useState, useContext, useEffect } from 'react';
import { storageService } from '@/services/storage';
import api from '@/services/api';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = storageService.get('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const data = await api.get('/auth/me');
          if (data?.data?.success) {
            setUser(data?.data?.user);
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
    } catch (e) {
      console.error('Auth verification failed', e);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth', {
      email,
      password,
    });
    if (response?.data?.success) {
      const data = response.data;
      storageService.set('token', data?.token);
      setToken(data?.token);
      setUser(data?.user);
    }
  };

  const logout = () => {
    storageService.remove('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
