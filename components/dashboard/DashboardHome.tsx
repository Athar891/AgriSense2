'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WeatherWidget } from './WeatherWidget';
import GovtSubsidiaries from './GovtSubsidiaries';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Sun,
  BarChart3,
  Activity,
  Droplets,
  Leaf,
  Bug,
  Calendar,
  Clock,
  MapPin,
  Thermometer,
  Gauge,
  Sprout,
  Wheat,
  Apple,
  Carrot,
  DollarSign,
  BookOpen,
  Target,
  Zap,
  Plus,
  Trash2,
  Minus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserDocRef, User } from '@/components/auth/AuthProvider';

interface DashboardHomeProps {
  userRole: 'farmer' | 'seller' | 'admin';
}

export function DashboardHome({ userRole }: DashboardHomeProps) {
  const recentAlerts = [
    { type: 'warning', message: 'Leaf blight detected in Field A-2', time: '2 hours ago' },
    { type: 'info', message: 'Irrigation scheduled for tomorrow', time: '4 hours ago' },
    { type: 'success', message: 'Harvest completed in Field B-1', time: '1 day ago' },
  ];

  const farmStats = [
    { title: 'Healthy Crops', value: '89%', icon: CheckCircle, color: 'text-green-600', bgGradient: 'from-green-500 to-emerald-600' },
    { title: 'Alerts', value: recentAlerts.length.toString(), icon: AlertTriangle, color: 'text-yellow-600', bgGradient: 'from-yellow-500 to-orange-600' },
    { title: 'Growth Rate', value: '+15%', icon: TrendingUp, color: 'text-purple-600', bgGradient: 'from-purple-500 to-indigo-600' },
    { title: 'Productivity', value: '92%', icon: Activity, color: 'text-blue-600', bgGradient: 'from-blue-500 to-cyan-600' },
  ];

  const cropFields = [
    { name: 'Field A-1', crop: 'Wheat', health: 95, stage: 'Flowering', area: '2.5 acres', nextAction: 'Fertilize in 3 days' },
    { name: 'Field A-2', crop: 'Corn', health: 78, stage: 'Vegetative', area: '3.0 acres', nextAction: 'Pest control needed' },
    { name: 'Field B-1', crop: 'Soybeans', health: 88, stage: 'Pod Development', area: '2.0 acres', nextAction: 'Harvest in 2 weeks' },
    { name: 'Field B-2', crop: 'Rice', health: 92, stage: 'Grain Filling', area: '1.5 acres', nextAction: 'Monitor water level' },
  ];

  const soilHealth = [
    { parameter: 'pH Level', value: 6.8, status: 'Optimal', color: 'text-green-600' },
    { parameter: 'Nitrogen', value: 85, status: 'Good', color: 'text-blue-600' },
    { parameter: 'Phosphorus', value: 72, status: 'Moderate', color: 'text-yellow-600' },
    { parameter: 'Potassium', value: 91, status: 'Excellent', color: 'text-green-600' },
  ];

  const irrigationSchedule = [
    { field: 'Field A-1', time: '06:00 AM', duration: '2 hours', status: 'Scheduled' },
    { field: 'Field A-2', time: '08:00 AM', duration: '1.5 hours', status: 'Completed' },
    { field: 'Field B-1', time: '10:00 AM', duration: '2.5 hours', status: 'In Progress' },
    { field: 'Field B-2', time: '02:00 PM', duration: '1 hour', status: 'Pending' },
  ];

  const pestAlerts = [
    { pest: 'Aphids', severity: 'High', affectedCrop: 'Wheat', recommendation: 'Apply neem oil spray' },
    { pest: 'Corn Borer', severity: 'Medium', affectedCrop: 'Corn', recommendation: 'Monitor closely' },
    { pest: 'Spider Mites', severity: 'Low', affectedCrop: 'Soybeans', recommendation: 'Increase humidity' },
  ];

  const marketPrices = [
    { crop: 'Wheat', price: '₹2,450/ton', change: '+5.2%', trend: 'up' },
    { crop: 'Corn', price: '₹1,850/ton', change: '-2.1%', trend: 'down' },
    { crop: 'Soybeans', price: '₹3,200/ton', change: '+8.7%', trend: 'up' },
    { crop: 'Rice', price: '₹2,800/ton', change: '+3.4%', trend: 'up' },
  ];

  const farmingTips = [
    { title: 'Optimal Harvesting Time', content: 'Harvest wheat when moisture content is 13-14% for best quality and storage.', icon: Wheat },
    { title: 'Water Conservation', content: 'Use drip irrigation during early morning hours to reduce evaporation losses.', icon: Droplets },
    { title: 'Pest Management', content: 'Plant marigolds around your fields to naturally repel harmful insects.', icon: Bug },
    { title: 'Soil Health', content: 'Rotate crops annually to maintain soil fertility and reduce pest buildup.', icon: Leaf },
  ];

  const getCropIcon = (crop: string) => {
    switch (crop.toLowerCase()) {
      case 'wheat': return <Wheat className="w-4 h-4" />;
      case 'corn': return <Sprout className="w-4 h-4" />;
      case 'soybeans': return <Leaf className="w-4 h-4" />;
      case 'rice': return <Sprout className="w-4 h-4" />;
      default: return <Sprout className="w-4 h-4" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Crop management state
  const { user } = useAuth();
  const [crops, setCrops] = useState<any[]>([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [cropsError, setCropsError] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropForm, setCropForm] = useState({
    name: '',
    type: '',
    plantationDate: '',
    irrigationProgress: 0,
    notes: ''
  });

  // Helper to get crops collection ref
  const getCropsCollectionRef = (user: User) => {
    return collection(getUserDocRef(user), 'crops');
  };

  // Load crops from Firestore on mount
  useEffect(() => {
    if (!user) return;
    setCropsLoading(true);
    setCropsError(null);
    getDocs(getCropsCollectionRef(user))
      .then(snapshot => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCrops(loaded);
      })
      .catch(e => setCropsError(e.message || 'Failed to load crops'))
      .finally(() => setCropsLoading(false));
  }, [user]);

  const handleAddCrop = async () => {
    if (!user) return;
    try {
      const docRef = await addDoc(getCropsCollectionRef(user), cropForm);
      setCrops(prev => [...prev, { id: docRef.id, ...cropForm }]);
      setCropForm({ name: '', type: '', plantationDate: '', irrigationProgress: 0, notes: '' });
      setShowCropModal(false);
    } catch (e: any) {
      setCropsError(e.message || 'Failed to add crop');
    }
  };

  const handleDeleteCrop = async (idx: number) => {
    if (!user) return;
    const crop = crops[idx];
    if (!crop.id) return;
    try {
      await deleteDoc(doc(getCropsCollectionRef(user), crop.id));
      setCrops(prev => prev.filter((_, i) => i !== idx));
    } catch (e: any) {
      setCropsError(e.message || 'Failed to delete crop');
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {farmStats.map((stat) => (
          <Card key={stat.title} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.bgGradient} opacity-10 rounded-bl-full transition-transform duration-300 group-hover:scale-110`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.bgGradient} shadow-md`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weather and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-5 rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
                <Sun className="w-5 h-5 text-white" />
              </div>
              Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <WeatherWidget showLocation={true} />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-5 rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="group flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200">
                  <div className={`w-3 h-3 rounded-full mt-2 shadow-sm ${
                    alert.type === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    alert.type === 'info' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' : 
                    'bg-gradient-to-r from-green-400 to-emerald-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Govt. Subsidiaries Section */}
      <GovtSubsidiaries />

      {/* Crop Management */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-5 rounded-bl-full" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 shadow-md">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            Crop Management
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {/* Show loading/error for crops */}
          {cropsLoading && <div className="text-gray-500">Loading crops...</div>}
          {cropsError && <div className="text-red-600">{cropsError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Crop Card */}
            <button
              type="button"
              onClick={() => setShowCropModal(true)}
              className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:bg-green-100/40 dark:hover:bg-green-900/40 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <Plus className="w-10 h-10 text-green-500 mb-2" />
              <span className="text-green-700 dark:text-green-300 font-semibold">Add New Crop</span>
            </button>
            {/* Render saved crops as cards */}
            {crops.map((crop, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 relative">
                <button
                  type="button"
                  onClick={() => handleDeleteCrop(idx)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 border border-gray-200 dark:bg-gray-800/80 dark:border-gray-700 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm transition-colors"
                  title="Delete Crop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{crop.name || crop.type}</h3>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Type:</span> {crop.type}</div>
                  <div><span className="font-medium">Plantation Date:</span> {crop.plantationDate}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Irrigation:</span>
                    <Progress value={crop.irrigationProgress} className="w-32 h-2" />
                    <span>{Math.round(crop.irrigationProgress / 10)}/10</span>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!user) return;
                          const crop = crops[idx];
                          const newVal = Math.max(0, crop.irrigationProgress - 10);
                          try {
                            await updateDoc(doc(getCropsCollectionRef(user), crop.id), { irrigationProgress: newVal });
                            setCrops(prev => prev.map((c, i) => i === idx ? { ...c, irrigationProgress: newVal } : c));
                          } catch (e: any) {
                            setCropsError(e.message || 'Failed to update irrigation');
                          }
                        }}
                        className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-200 dark:hover:bg-red-700 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors"
                        title="Decrease Irrigation"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!user) return;
                          const crop = crops[idx];
                          const newVal = Math.min(100, crop.irrigationProgress + 10);
                          try {
                            await updateDoc(doc(getCropsCollectionRef(user), crop.id), { irrigationProgress: newVal });
                            setCrops(prev => prev.map((c, i) => i === idx ? { ...c, irrigationProgress: newVal } : c));
                          } catch (e: any) {
                            setCropsError(e.message || 'Failed to update irrigation');
                          }
                        }}
                        className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-green-200 dark:hover:bg-green-700 text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors"
                        title="Increase Irrigation"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {crop.notes && <div><span className="font-medium">Notes:</span> {crop.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Crop</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAddCrop();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Crop Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={cropForm.name}
                  onChange={e => setCropForm(f => ({ ...f, name: e.target.value }))}
                  required
                  title="Crop Name"
                  placeholder="Enter crop name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Crop Type</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={cropForm.type}
                  onChange={e => setCropForm(f => ({ ...f, type: e.target.value }))}
                  placeholder="e.g. Maize, Wheat, Paddy"
                  required
                  title="Crop Type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plantation Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={cropForm.plantationDate}
                  onChange={e => setCropForm(f => ({ ...f, plantationDate: e.target.value }))}
                  required
                  title="Plantation Date"
                  placeholder="Select plantation date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Irrigation</label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setCropForm(f => ({ ...f, irrigationProgress: Math.min(100, f.irrigationProgress + 10) }))}
                    className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600"
                    title="Increase Irrigation Progress"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{cropForm.irrigationProgress}%</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={cropForm.notes}
                  onChange={e => setCropForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  title="Notes"
                  placeholder="Additional notes (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full">Save Crop</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Soil Health & Irrigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brown-400 to-amber-500 opacity-5 rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-brown-400 to-amber-500 shadow-md">
                <Gauge className="w-5 h-5 text-white" />
              </div>
              Soil Health
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {soilHealth.map((item) => (
                <div key={item.parameter} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.parameter}</p>
                    <p className={`text-sm ${item.color}`}>{item.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
                    <Progress value={item.value} className="w-20 h-2 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 opacity-5 rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 shadow-md">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              Irrigation Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {irrigationSchedule.map((item) => (
                <div key={item.field} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.field}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {item.time} • {item.duration}
                    </p>
                  </div>
                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pest Alerts & Market Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-pink-500 opacity-5 rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-pink-500 shadow-md">
                <Bug className="w-5 h-5 text-white" />
              </div>
              Pest Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {pestAlerts.map((pest) => (
                <div key={pest.pest} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{pest.pest}</h4>
                    <Badge variant={pest.severity === 'High' ? 'destructive' : pest.severity === 'Medium' ? 'secondary' : 'outline'}>
                      {pest.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Affecting: {pest.affectedCrop}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pest.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-5 rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 shadow-md">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              Market Prices
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {marketPrices.map((item) => (
                <div key={item.crop} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.crop}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </p>
                    <div className={`w-2 h-2 rounded-full mt-1 ${item.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}