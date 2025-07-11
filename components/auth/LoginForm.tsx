'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sprout, Shield, Store } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'seller' | 'admin'>('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }
    const result = await login(email, password, role);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle(role);
    if (!result.success) {
      setError(result.error || 'Google login failed');
    }
    setLoading(false);
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'farmer': return <Sprout className="w-5 h-5" />;
      case 'seller': return <Store className="w-5 h-5" />;
      case 'admin': return <Shield className="w-5 h-5" />;
      default: return <Sprout className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-green-600 p-3 rounded-full">
              <Sprout className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm">AgriSense</h1>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Smart Farming Platform</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: 'farmer' | 'seller' | 'admin') => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">
                      <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4" />
                        Farmer
                      </div>
                    </SelectItem>
                    <SelectItem value="seller">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Seller
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-[#3c4043] font-medium hover:bg-gray-100 mt-2 shadow-sm transition-colors"
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.36 1.53 7.82 2.81l5.8-5.8C34.36 3.54 29.64 1.5 24 1.5 14.82 1.5 6.88 7.48 3.34 15.44l6.74 5.23C12.12 14.36 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.15 24.5c0-1.64-.15-3.22-.43-4.74H24v9.04h12.44c-.54 2.9-2.18 5.36-4.64 7.04l7.18 5.59C43.98 37.36 46.15 31.36 46.15 24.5z"/><path fill="#FBBC05" d="M10.08 28.27A14.5 14.5 0 0 1 9.5 24c0-1.48.25-2.91.7-4.27l-6.74-5.23A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.5 10.5l7.58-6.23z"/><path fill="#EA4335" d="M24 46.5c6.48 0 11.92-2.14 15.9-5.84l-7.18-5.59c-2 1.36-4.54 2.18-8.72 2.18-6.38 0-11.88-4.86-13.92-11.27l-7.58 6.23C6.88 40.52 14.82 46.5 24 46.5z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                {loading ? 'Signing In...' : 'Sign in with Google'}
              </Button>

              <div className="text-center">
                <Button
                    type="button"
                    onClick={onSwitchToSignup}
                  className="text-green-600 hover:text-green-700 font-medium w-full mt-2 bg-transparent border-0 shadow-none"
                  >
                  Sign up as Seller
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Farmer's can only google sign in
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}