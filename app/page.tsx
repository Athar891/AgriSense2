'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Dashboard } from '@/components/dashboard/Dashboard';

function AppContent() {
  const { user, isAuthenticated, login, signup, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = async (email: string, password: string, role: 'farmer' | 'seller' | 'admin') => {
    setAuthError('');
    const result = await login(email, password, role);
    if (!result.success) {
      setAuthError(result.error || 'Login failed');
    }
  };

  const handleSignup = async (userData: { email: string; password: string; name: string; role: 'farmer' | 'seller' | 'admin' }) => {
    setAuthError('');
    const result = await signup(userData);
    if (!result.success) {
      setAuthError(result.error || 'Signup failed');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const switchToSignup = () => {
    setShowSignup(true);
    setAuthError('');
  };

  const switchToLogin = () => {
    setShowSignup(false);
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {!isAuthenticated ? (
        showSignup ? (
          <SignupForm onSignup={handleSignup} onSwitchToLogin={switchToLogin} error={authError} />
        ) : (
          <LoginForm onLogin={handleLogin} onSwitchToSignup={switchToSignup} error={authError} />
        )
      ) : (
        <Dashboard userRole={user?.role || 'farmer'} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}