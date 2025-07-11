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
  Camera,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/components/auth/AuthProvider';

function getUserDocRef(user: User) {
  if (!user) throw new Error('No user');
  if (user.role === 'farmer') return doc(db, 'farmers', user.id);
  if (user.role === 'seller') return doc(db, 'sellers', user.id);
  throw new Error('Unknown role');
}

export function Profile() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getDoc(getUserDocRef(user)).then((docSnap) => {
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
        setIsEditing(false);
        if (docSnap.data().preferences?.darkMode !== undefined) {
          setPreferences((prev: any) => ({
            ...prev,
            darkMode: docSnap.data().preferences.darkMode
          }));
          setTheme(docSnap.data().preferences.darkMode ? 'dark' : 'light');
        } else {
          const local = localStorage.getItem('agrisense_dark_mode');
          if (local !== null) {
            setPreferences((prev: any) => ({ ...prev, darkMode: local === 'true' }));
            setTheme(local === 'true' ? 'dark' : 'light');
          }
        }
      } else {
        setProfileData(null);
        setIsEditing(false);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, setTheme]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: false,
    darkMode: false
  });

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setSaving(true);
    try {
      await updateDoc(getUserDocRef(user), profileData);
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
        duration: 2000,
      });
    } catch (e: any) {
      setError(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = async (key: keyof typeof preferences) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (key === 'darkMode') {
        setTheme(!prev.darkMode ? 'dark' : 'light');
        localStorage.setItem('agrisense_dark_mode', String(!prev.darkMode));
        if (user) {
          updateDoc(getUserDocRef(user), {
            'preferences.darkMode': !prev.darkMode
          });
        }
      }
      return updated;
    });
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
      await deleteDoc(getUserDocRef(user));
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
  if (!profileData) return (
    <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
      <p>No profile data found. Please complete your onboarding or contact support.</p>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">{saving ? 'Saving...' : 'Save'}</span>
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="px-2 sm:px-4">
              <Edit className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Edit Profile</span>
            </Button>
          )}
          <Button onClick={handleDeleteAccount} className="bg-black text-white px-2 sm:bg-red-600 sm:hover:bg-red-700 sm:px-4" disabled={deleting}>
            <span className="sm:hidden"><Trash2 className="w-5 h-5" /></span>
            <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Delete Account'}</span>
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
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center overflow-hidden relative group">
                  {profileData.photoURL ? (
                    <img
                      src={profileData.photoURL}
                      alt="Profile"
                      className="w-20 h-20 object-cover rounded-full"
                    />
                  ) : (
                  <User className="w-10 h-10 text-green-600 dark:text-green-400" />
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 m-2 cursor-pointer group-hover:scale-110 transition-transform" title="Upload profile image">
                      <span className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                      <Camera className="w-7 h-7 text-white drop-shadow z-20 relative" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        title="Upload profile image"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileData((prev: any) => ({ ...prev, photoURL: reader.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
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
                    title="Toggle Email Notifications"
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
                    title="Toggle SMS Alerts"
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
                    title="Toggle Dark Mode"
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
                    Joined {profileData.joinDate && !isNaN(new Date(profileData.joinDate).getTime())
                      ? new Date(profileData.joinDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {profileData.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {profileData.location || 'N/A'}
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