'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Play, 
  Pause, 
  RotateCw, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';

export function LiveMonitoring() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(0);

  const cameras = [
    { id: 1, name: 'Field A-1', status: 'online', disease: null, confidence: 0 },
    { id: 2, name: 'Field A-2', status: 'online', disease: 'Leaf Blight', confidence: 0.89 },
    { id: 3, name: 'Field B-1', status: 'online', disease: null, confidence: 0 },
    { id: 4, name: 'Field B-2', status: 'offline', disease: null, confidence: 0 },
    { id: 5, name: 'Greenhouse 1', status: 'online', disease: 'Powdery Mildew', confidence: 0.76 },
    { id: 6, name: 'Greenhouse 2', status: 'online', disease: null, confidence: 0 },
  ];

  const getCameraStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getDiseaseStatusColor = (disease: string | null) => {
    return disease ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Live Monitoring</h2>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {cameras[selectedCamera].name}
                <Badge className={getCameraStatusColor(cameras[selectedCamera].status)}>
                  {cameras[selectedCamera].status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&cs=tinysrgb&w=800&h=450"
                  alt="Live camera feed"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {isPlaying ? 'LIVE' : 'PAUSED'}
                </div>
                {cameras[selectedCamera].disease && (
                  <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-semibold">Disease Detected: {cameras[selectedCamera].disease}</span>
                    </div>
                    <p className="text-sm mt-1">
                      Confidence: {Math.round(cameras[selectedCamera].confidence * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Camera List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cameras.map((camera, index) => (
                  <div 
                    key={camera.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCamera === index ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCamera(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{camera.name}</span>
                      <Badge className={getCameraStatusColor(camera.status)}>
                        {camera.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {camera.disease ? (
                        <Badge className="bg-red-100 text-red-800">
                          {camera.disease}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          Healthy
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">4 Healthy Fields</span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">2 Issues Detected</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Run Full Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}