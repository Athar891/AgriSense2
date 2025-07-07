'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Gauge,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  BarChart3,
  Camera,
  Smartphone
} from 'lucide-react';

interface SensorData {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'wind' | 'pressure';
  value: number;
  unit: string;
  status: 'online' | 'offline' | 'warning';
  location: string;
  lastUpdate: string;
  threshold: {
    min: number;
    max: number;
  };
}

interface EquipmentStatus {
  id: string;
  name: string;
  type: 'irrigation' | 'sprinkler' | 'sensor' | 'camera' | 'gateway';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  battery?: number;
  signal?: number;
  lastSeen: string;
  location: string;
}

interface CropHealthData {
  field: string;
  crop: string;
  health: number;
  stress: number;
  growth: number;
  lastScan: string;
  alerts: string[];
}

export function LiveMonitoring() {
  const [sensorData, setSensorData] = useState<SensorData[]>([
    {
      id: 'temp-001',
      name: 'Temperature Sensor',
      type: 'temperature',
      value: 24.5,
      unit: '°C',
      status: 'online',
      location: 'Field A-1',
      lastUpdate: '2 min ago',
      threshold: { min: 15, max: 35 }
    },
    {
      id: 'humidity-001',
      name: 'Humidity Sensor',
      type: 'humidity',
      value: 65,
      unit: '%',
      status: 'online',
      location: 'Field A-1',
      lastUpdate: '2 min ago',
      threshold: { min: 40, max: 80 }
    },
    {
      id: 'soil-001',
      name: 'Soil Moisture',
      type: 'soil_moisture',
      value: 72,
      unit: '%',
      status: 'online',
      location: 'Field A-1',
      lastUpdate: '5 min ago',
      threshold: { min: 30, max: 85 }
    },
    {
      id: 'light-001',
      name: 'Light Sensor',
      type: 'light',
      value: 850,
      unit: 'lux',
      status: 'warning',
      location: 'Field A-2',
      lastUpdate: '1 min ago',
      threshold: { min: 200, max: 1000 }
    },
    {
      id: 'wind-001',
      name: 'Wind Speed',
      type: 'wind',
      value: 12.5,
      unit: 'km/h',
      status: 'online',
      location: 'Field B-1',
      lastUpdate: '30 sec ago',
      threshold: { min: 0, max: 50 }
    },
    {
      id: 'pressure-001',
      name: 'Barometric Pressure',
      type: 'pressure',
      value: 1013.2,
      unit: 'hPa',
      status: 'offline',
      location: 'Field B-2',
      lastUpdate: '15 min ago',
      threshold: { min: 950, max: 1050 }
    }
  ]);

  const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus[]>([
    {
      id: 'irr-001',
      name: 'Irrigation Pump A',
      type: 'irrigation',
      status: 'active',
      battery: 85,
      signal: 92,
      lastSeen: '1 min ago',
      location: 'Field A-1'
    },
    {
      id: 'spr-001',
      name: 'Sprinkler System B',
      type: 'sprinkler',
      status: 'inactive',
      battery: 45,
      signal: 78,
      lastSeen: '5 min ago',
      location: 'Field A-2'
    },
    {
      id: 'cam-001',
      name: 'Field Camera 1',
      type: 'camera',
      status: 'active',
      battery: 92,
      signal: 95,
      lastSeen: '30 sec ago',
      location: 'Field A-1'
    },
    {
      id: 'gw-001',
      name: 'Gateway Hub',
      type: 'gateway',
      status: 'active',
      signal: 98,
      lastSeen: '10 sec ago',
      location: 'Control Center'
    },
    {
      id: 'irr-002',
      name: 'Irrigation Pump B',
      type: 'irrigation',
      status: 'maintenance',
      battery: 23,
      signal: 65,
      lastSeen: '2 hours ago',
      location: 'Field B-1'
    }
  ]);

  const [cropHealth, setCropHealth] = useState<CropHealthData[]>([
    {
      field: 'Field A-1',
      crop: 'Wheat',
      health: 95,
      stress: 12,
      growth: 78,
      lastScan: '10 min ago',
      alerts: []
    },
    {
      field: 'Field A-2',
      crop: 'Corn',
      health: 78,
      stress: 28,
      growth: 65,
      lastScan: '15 min ago',
      alerts: ['Water stress detected', 'Nutrient deficiency']
    },
    {
      field: 'Field B-1',
      crop: 'Soybeans',
      health: 88,
      stress: 18,
      growth: 72,
      lastScan: '8 min ago',
      alerts: ['Minor pest activity']
    },
    {
      field: 'Field B-2',
      crop: 'Rice',
      health: 92,
      stress: 8,
      growth: 85,
      lastScan: '12 min ago',
      alerts: []
    }
  ]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSensorData(prev => prev.map(sensor => ({
        ...sensor,
        value: sensor.value + (Math.random() - 0.5) * 2,
        lastUpdate: 'Just now'
      })));

      setLastRefresh(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'humidity': return <Droplets className="w-4 h-4" />;
      case 'soil_moisture': return <Gauge className="w-4 h-4" />;
      case 'light': return <Sun className="w-4 h-4" />;
      case 'wind': return <Wind className="w-4 h-4" />;
      case 'pressure': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'offline':
      case 'inactive':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryColor = (battery: number) => {
    if (battery >= 80) return 'text-green-600';
    if (battery >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalColor = (signal: number) => {
    if (signal >= 90) return 'text-green-600';
    if (signal >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const refreshData = () => {
    setLastRefresh(new Date());
    // Simulate data refresh
    setSensorData(prev => prev.map(sensor => ({
      ...sensor,
      lastUpdate: 'Just now'
    })));
  };

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Monitoring</h2>
          <p className="text-gray-600 dark:text-gray-400">Real-time farm data and equipment status</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Online Sensors</p>
                <p className="text-2xl font-bold text-green-600">{sensorData.filter(s => s.status === 'online').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{sensorData.filter(s => s.status === 'warning').length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Equipment</p>
                <p className="text-2xl font-bold text-blue-600">{equipmentStatus.filter(e => e.status === 'active').length}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Update</p>
                <p className="text-sm font-bold text-purple-600">{lastRefresh.toLocaleTimeString()}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Data */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 opacity-5 rounded-bl-full" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Sensor Data
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensorData.map((sensor) => (
              <div key={sensor.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getSensorIcon(sensor.type)}
                    <h3 className="font-semibold text-gray-900 dark:text-white">{sensor.name}</h3>
                  </div>
                  <Badge className={getStatusColor(sensor.status)}>
                    {sensor.status === 'online' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                    {sensor.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {sensor.value.toFixed(1)}{sensor.unit}
                    </span>
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{sensor.location}</p>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Range: {sensor.threshold.min}-{sensor.threshold.max}{sensor.unit}</span>
                    <span>{sensor.lastUpdate}</span>
                  </div>
                  <Progress 
                    value={((sensor.value - sensor.threshold.min) / (sensor.threshold.max - sensor.threshold.min)) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Status */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-5 rounded-bl-full" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Equipment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipmentStatus.map((equipment) => (
              <div key={equipment.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{equipment.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{equipment.type}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(equipment.status)}>
                    {equipment.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="font-medium">{equipment.location}</span>
                  </div>
                  {equipment.battery && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Battery:</span>
                      <span className={`font-medium ${getBatteryColor(equipment.battery)}`}>
                        {equipment.battery}%
                      </span>
                    </div>
                  )}
                  {equipment.signal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Signal:</span>
                      <span className={`font-medium ${getSignalColor(equipment.signal)}`}>
                        {equipment.signal}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Last seen: {equipment.lastSeen}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crop Health Monitoring */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-5 rounded-bl-full" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Crop Health Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cropHealth.map((crop) => (
              <div key={crop.field} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{crop.field}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{crop.crop}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getHealthColor(crop.health)}`}>{crop.health}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Health Score</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Growth Stage</span>
                      <span className="font-medium">{crop.growth}%</span>
                    </div>
                    <Progress value={crop.growth} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Stress Level</span>
                      <span className="font-medium">{crop.stress}%</span>
                    </div>
                    <Progress value={crop.stress} className="h-2" />
                  </div>
                  
                  {crop.alerts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-600 mb-2">Alerts:</p>
                      <div className="space-y-1">
                        {crop.alerts.map((alert, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            {alert}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Last scan: {crop.lastScan}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 