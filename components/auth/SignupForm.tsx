'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sprout, Shield, Store, UserPlus } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'farmer' | 'seller' | 'admin'>('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Validation
    if (!email || !password || !confirmPassword || !name) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    const result = await signup({ email, password, name, role });
    if (!result.success) {
      setError(result.error || 'Signup failed');
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle(role);
    if (!result.success) {
      setError(result.error || 'Google signup failed');
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
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <UserPlus className="w-6 h-6" />
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Sign up to start your farming journey
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Button type="button" onClick={handleGoogleSignup} className="w-full bg-blue-600 hover:bg-blue-700 mt-2" disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign up with Google'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 