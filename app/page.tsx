'use client';

import { useState } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'farmer' | 'seller' | 'admin'>('farmer');

  const handleLogin = (role: 'farmer' | 'seller' | 'admin') => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {!isAuthenticated ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <Dashboard userRole={userRole} onLogout={handleLogout} />
        )}
      </div>
    </AuthProvider>
  );
}