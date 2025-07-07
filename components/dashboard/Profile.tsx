'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Settings,
  Edit,
  Save,
  Camera
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

export function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getDoc(doc(db, 'users', user.id)).then((docSnap) => {
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      } else {
        setProfileData({
          name: user.name,
          email: user.email,
          role: user.role,
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: false,
    darkMode: false
  });

  const handleSave = async () => {
    if (!user) return;
    setError('');
    try {
      await updateDoc(doc(db, 'users', user.id), profileData);
      setIsEditing(false);
    } catch (e: any) {
      setError(e.message || 'Failed to update profile');
    }
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const stats = [
    { label: 'Total Fields', value: '12', icon: MapPin },
    { label: 'Diseases Detected', value: '47', icon: Camera },
    { label: 'Products Purchased', value: '23', icon: Calendar },
    { label: 'Community Posts', value: '8', icon: User },
  ];

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setDeleting(true);
    setError('');
    try {
      await deleteDoc(doc(db, 'users', user.id));
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      await logout();
    } catch (e: any) {
      setError(e.message || 'Failed to delete account');
    }
    setDeleting(false);
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profileData) return <div>No profile data found.</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
          <Button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{profileData.name}</h3>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {profileData.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : ''}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name || ''}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email || ''}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profileData.role || ''}
                    onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location || ''}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size</Label>
                  <Input
                    id="farmSize"
                    value={profileData.farmSize || ''}
                    onChange={(e) => setProfileData({...profileData, farmSize: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={profileData.experience || ''}
                    onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={profileData.specialization || ''}
                    onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Notifications</span>
                  <button
                    onClick={() => togglePreference('emailNotifications')}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      preferences.emailNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.emailNotifications ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SMS Alerts</span>
                  <button
                    onClick={() => togglePreference('smsAlerts')}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      preferences.smsAlerts ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.smsAlerts ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dark Mode</span>
                  <button
                    onClick={() => togglePreference('darkMode')}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      preferences.darkMode ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.darkMode ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Activity Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Joined {new Date(profileData.joinDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {profileData.specialization}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {profileData.location}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}