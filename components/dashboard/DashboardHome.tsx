'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from './WeatherWidget';
import { 
  Camera, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Sun
} from 'lucide-react';

interface DashboardHomeProps {
  userRole: 'farmer' | 'seller' | 'admin';
}

export function DashboardHome({ userRole }: DashboardHomeProps) {
  const farmStats = [
    { title: 'Active Cameras', value: '12', icon: Camera, color: 'text-blue-600' },
    { title: 'Healthy Crops', value: '89%', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Alerts', value: '3', icon: AlertTriangle, color: 'text-yellow-600' },
    { title: 'Growth Rate', value: '+15%', icon: TrendingUp, color: 'text-purple-600' },
  ];

  const recentAlerts = [
    { type: 'warning', message: 'Leaf blight detected in Field A-2', time: '2 hours ago' },
    { type: 'info', message: 'Irrigation scheduled for tomorrow', time: '4 hours ago' },
    { type: 'success', message: 'Harvest completed in Field B-1', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {farmStats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeatherWidget showLocation={true} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === 'warning' ? 'bg-yellow-500' :
                    alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-green-600 hover:bg-green-700 h-12">
              <Camera className="w-4 h-4 mr-2" />
              View Live Feed
            </Button>
            <Button variant="outline" className="h-12">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Run Diagnosis
            </Button>
            <Button variant="outline" className="h-12">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}