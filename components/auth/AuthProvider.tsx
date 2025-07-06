'use client';

import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = {
    user: null,
    isAuthenticated: false,
    login: async (email: string, password: string) => {
      // Mock authentication
      console.log('Login attempt:', { email, password });
    },
    logout: () => {
      console.log('Logout');
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}