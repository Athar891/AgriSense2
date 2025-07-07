'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function OnboardingModal() {
  const { needsOnboarding, completeOnboarding, user } = useAuth();
  const [role, setRole] = useState<'farmer' | 'seller' | 'admin'>('farmer');
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!needsOnboarding) return null;

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
    } catch (e: any) {
      setError(e.message || 'Failed to complete onboarding');
    }
    setLoading(false);
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
} 