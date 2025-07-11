'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye,
  MapPin,
  Search,
  X,
  AlertTriangle,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Navigation,
  Gauge
} from 'lucide-react';
import { useWeather, useWeatherSearch } from '@/hooks/useWeather';
import { WeatherAlert } from '@/lib/weather';

interface WeatherWidgetProps {
  compact?: boolean;
  showLocation?: boolean;
  className?: string;
}

export function WeatherWidget({ compact = false, showLocation = true, className = '' }: WeatherWidgetProps) {
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { weather, forecast, alerts, loading, error, refetch } = useWeather(currentLocation);
  const { searchResults, loading: searchLoading, search } = useWeatherSearch();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        search(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, search]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location: string) => {
    setCurrentLocation(location);
    setShowSearch(false);
    setSearchQuery('');
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) return <Sun className="w-6 h-6" />;
    if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) return <Cloud className="w-6 h-6" />;
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return <CloudRain className="w-6 h-6" />;
    if (conditionLower.includes('snow')) return <CloudSnow className="w-6 h-6" />;
    return <Cloud className="w-6 h-6" />;
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'bg-red-500';
      case 'severe': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'minor': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : weather ? (
          <>
            {getWeatherIcon(weather.description)}
            <div className="text-sm">
              <div className="font-semibold">{weather.temperature}°C</div>
              {showLocation && (
                <div className="text-xs text-gray-500">{weather.location}</div>
              )}
            </div>
            {alerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
              </Badge>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">Weather unavailable</div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Weather
            </CardTitle>
            <div className="flex items-center gap-2">
              {alerts.length > 0 && (
                <div className="relative flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlerts(!showAlerts)}
                    className="relative flex items-center justify-center"
                  >
                    <span className="relative">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 bg-red-500 text-white text-xs font-bold shadow">
                    {alerts.length}
                      </span>
                    </span>
                </Button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForecast(!showForecast)}
              >
                <Calendar className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Location Search */}
          {showSearch && (
            <div ref={searchRef} className="relative">
              <Input
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(false)}
                className="absolute right-1 top-1 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
              
              {searchLoading && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border rounded-md p-2 z-10">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border rounded-md max-h-48 overflow-y-auto z-10">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleLocationSelect(result.name)}
                      className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">
                          {result.region && `${result.region}, `}{result.country}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current Weather */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              {error}
            </div>
          ) : weather ? (
            <div className="space-y-4">
              {/* Main Weather Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">
                    {getWeatherIcon(weather.description)}
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{weather.temperature}°C</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Feels like {weather.feelsLike}°C
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{weather.location}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {weather.country}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-medium capitalize">{weather.description}</div>
                <div className="text-sm text-gray-500">
                  Last updated: {formatTime(weather.lastUpdated)}
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Humidity: {weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Wind: {weather.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Visibility: {weather.visibility} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Pressure: {weather.pressure} mb</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Weather Alerts */}
          {showAlerts && alerts.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Weather Alerts ({alerts.length})
              </h4>
              {alerts.map((alert, index) => (
                <div key={index} className="p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getAlertSeverityColor(alert.severity)} text-white`}>
                          {alert.severity}
                        </Badge>
                        <span className="font-medium text-sm">{alert.headline}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {alert.description}
                      </p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Areas: {alert.areas}</div>
                        <div>Effective: {formatTime(alert.effective)}</div>
                        <div>Expires: {formatTime(alert.expires)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weather Forecast */}
          {showForecast && forecast.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                7-Day Forecast
              </h4>
              <div className="space-y-2">
                {forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center text-sm font-medium">
                        {formatDate(day.date)}
                      </div>
                      <div className="w-8">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="text-sm capitalize">{day.condition}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-red-500 font-medium">{day.maxTemp}°</span>
                        <span className="text-blue-500">{day.minTemp}°</span>
                      </div>
                      <div className="text-gray-500">{day.chanceOfRain}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}