'use client';

import { useState } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  RefreshCw,
  MapPin,
  Search,
  Navigation,
  Star,
  X
} from 'lucide-react';

interface WeatherWidgetProps {
  className?: string;
  showLocation?: boolean;
  compact?: boolean;
}

export function WeatherWidget({ className = '', showLocation = true, compact = false }: WeatherWidgetProps) {
  const [customLocation, setCustomLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Pune');
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const { weather, loading, error, refetch } = useWeather(selectedLocation);

  // Recommended locations for farmers
  const recommendedLocations = [
    { name: 'Pune', country: 'IN', type: 'Agricultural Hub' },
    { name: 'Nashik', country: 'IN', type: 'Wine Region' },
    { name: 'Aurangabad', country: 'IN', type: 'Cotton Belt' },
    { name: 'Solapur', country: 'IN', type: 'Sugarcane Region' },
    { name: 'Kolhapur', country: 'IN', type: 'Dairy Farming' },
    { name: 'Ahmednagar', country: 'IN', type: 'Onion Hub' },
    { name: 'Sangli', country: 'IN', type: 'Turmeric Center' },
    { name: 'Satara', country: 'IN', type: 'Strawberry Region' }
  ];

  const getWeatherIcon = (iconCode: string, description: string) => {
    const code = iconCode?.substring(0, 2);
    
    switch (code) {
      case '01': return <Sun className="w-5 h-5 text-yellow-500" />;
      case '02': 
      case '03': 
      case '04': return <Cloud className="w-5 h-5 text-gray-500" />;
      case '09': 
      case '10': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case '11': return <Zap className="w-5 h-5 text-purple-500" />;
      case '13': return <CloudSnow className="w-5 h-5 text-blue-300" />;
      default: return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    if (uvIndex <= 7) return { level: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    return { level: 'Extreme', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' };
  };

  const handleLocationSearch = () => {
    if (customLocation.trim()) {
      setSelectedLocation(customLocation.trim());
      setCustomLocation('');
      setShowLocationSearch(false);
    }
  };

  const handleRecommendedLocation = (location: string) => {
    setSelectedLocation(location);
    setShowLocationSearch(false);
  };

  const handleCurrentLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      // For demo purposes, we'll use coordinates to set a location name
      // In a real app, you'd reverse geocode these coordinates
      setSelectedLocation(`${position.coords.latitude.toFixed(2)},${position.coords.longitude.toFixed(2)}`);
      setShowLocationSearch(false);
    } catch (error) {
      console.error('Failed to get current location:', error);
      alert('Unable to access your location. Please enter manually or choose from recommendations.');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg ${className}`}>
        <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-300 animate-spin" />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Loading weather...</span>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className={`flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg ${className}`}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refetch}
          className="text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-semibold"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  if (!weather) return null;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg ${className}`}>
        {getWeatherIcon(weather.icon, weather.description)}
        <span className="text-sm font-bold text-gray-900 dark:text-white">{weather.temperature}°C</span>
        {showLocation && (
          <>
            <div className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full" />
            <button 
              onClick={() => setShowLocationSearch(!showLocationSearch)}
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <MapPin className="w-3 h-3" />
              {weather.location}
            </button>
          </>
        )}
        
        {showLocationSearch && (
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 min-w-80">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter city name..."
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                  className="flex-1"
                />
                <Button onClick={handleLocationSearch} size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleCurrentLocation}
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Use Current Location
              </Button>
              
              <div className="border-t dark:border-gray-700 pt-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Recommended for Agriculture:</p>
                <div className="grid grid-cols-2 gap-1">
                  {recommendedLocations.slice(0, 4).map((loc) => (
                    <Button
                      key={loc.name}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRecommendedLocation(loc.name)}
                      className="text-xs justify-start h-auto p-2"
                    >
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      {loc.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const uvInfo = getUVLevel(weather.uvIndex);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.icon, weather.description)}
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">{weather.temperature}°C</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{weather.description}</div>
          </div>
        </div>
        
        {showLocation && (
          <div className="text-right relative">
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <button 
                onClick={() => setShowLocationSearch(!showLocationSearch)}
                className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <MapPin className="w-3 h-3" />
                {weather.location}, {weather.country}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refetch}
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-0 h-auto"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Update
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLocationSearch(!showLocationSearch)}
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-0 h-auto"
              >
                <Search className="w-3 h-3 mr-1" />
                Change
              </Button>
            </div>
            
            {showLocationSearch && (
              <Card className="absolute top-full right-0 mt-2 w-96 z-50 shadow-lg border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white">Change Location</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowLocationSearch(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter city name..."
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                          className="flex-1"
                        />
                        <Button onClick={handleLocationSearch} size="sm">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={handleCurrentLocation}
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Use Current Location
                      </Button>
                      
                      <div className="border-t dark:border-gray-700 pt-3">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Recommended Agricultural Regions:</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {recommendedLocations.map((loc) => (
                            <Button
                              key={loc.name}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRecommendedLocation(loc.name)}
                              className="w-full justify-between h-auto p-2"
                            >
                              <div className="flex items-center gap-2">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-sm font-semibold">{loc.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs font-medium">
                                {loc.type}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Thermometer className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Temperature</p>
            <p className="font-black text-gray-900 dark:text-white">{weather.temperature}°C</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Droplets className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Humidity</p>
            <p className="font-black text-gray-900 dark:text-white">{weather.humidity}%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Wind className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Wind Speed</p>
            <p className="font-black text-gray-900 dark:text-white">{weather.windSpeed} km/h</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Sun className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">UV Index</p>
            <div className="flex items-center gap-2">
              <p className="font-black text-gray-900 dark:text-white">{weather.uvIndex}</p>
              <Badge className={`text-xs font-bold ${uvInfo.color}`}>
                {uvInfo.level}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}