// src/components/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; redirectTo?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string; redirectTo?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            const { valid, user: verifiedUser } = await api.verifyToken();
            if (valid && verifiedUser) {
              setUser(verifiedUser);
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.clear();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.login({ email, password });

      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response from server');
      }

      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      if (response.user.role === 'admin') {
        return { success: true, redirectTo: '/admin/dashboard', message: 'Admin login successful' };
      }

      return { success: true, redirectTo: '/dashboard', message: 'Login successful' };
    } catch (error: any) {
      console.error('Login failed:', error);
      let errorMessage = 'Login failed';
      if (error.message.includes('401')) errorMessage = 'Invalid email or password';
      if (error.message.includes('Network')) errorMessage = 'Network error. Please check your connection';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await api.register(userData);

      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response from server');
      }

      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      if (response.user.role === 'admin') {
        return { success: true, redirectTo: '/admin/dashboard', message: 'Admin registration successful' };
      }

      return { success: true, redirectTo: '/dashboard', message: 'Registration successful' };
    } catch (error: any) {
      console.error('Registration failed:', error);
      let errorMessage = 'Registration failed';
      if (error.message.includes('409')) errorMessage = 'Email already registered';
      if (error.message.includes('Network')) errorMessage = 'Network error. Please check your connection';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.logout().catch(console.error);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};