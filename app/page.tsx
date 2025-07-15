'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Dashboard } from '@/components/dashboard/Dashboard';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const switchToSignup = () => {
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
  };

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {!isAuthenticated ? (
        showSignup ? (
          <SignupForm onSwitchToLogin={switchToLogin} />
        ) : (
          <LoginForm onSwitchToSignup={switchToSignup} />
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