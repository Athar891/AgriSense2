'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OnboardingPage() {
  const { user, needsOnboarding, completeOnboarding, isAuthenticated } = useAuth();
  const [role, setRole] = useState<'farmer' | 'seller' | 'admin'>('farmer');
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    } else if (!needsOnboarding) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, needsOnboarding, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!name) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    try {
      await completeOnboarding({ name, role });
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Failed to complete onboarding');
    }
    setLoading(false);
  };

  if (!isAuthenticated || !needsOnboarding) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Role</label>
            <Select value={role} onValueChange={v => setRole(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? 'Saving...' : 'Complete Onboarding'}
          </Button>
        </form>
      </div>
    </div>
  );
} 