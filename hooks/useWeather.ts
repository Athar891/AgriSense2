'use client';

import { useState, useEffect } from 'react';
import { weatherService, WeatherData } from '@/lib/weather';

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeather(location?: string): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      let weatherData: WeatherData;

      // Check if location is coordinates (lat,lon format)
      if (location && location.includes(',')) {
        const [lat, lon] = location.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lon)) {
          weatherData = await weatherService.getCurrentWeather(lat, lon);
        } else {
          throw new Error('Invalid coordinates format');
        }
      } else if (location) {
        // Use provided city name
        weatherData = await weatherService.getWeatherByCity(location);
      } else {
        // Try to get user's current location first
        try {
          const position = await weatherService.getCurrentPosition();
          weatherData = await weatherService.getCurrentWeather(
            position.coords.latitude,
            position.coords.longitude
          );
        } catch (locationError) {
          console.warn('Location access failed, using fallback:', locationError);
          // Use fallback data for demo
          weatherData = weatherService.getFallbackWeather();
        }
      }
      
      setWeather(weatherData);
    } catch (weatherError) {
      console.error('Weather fetch failed:', weatherError);
      setError('Failed to load weather data');
      // Use fallback data even on error
      setWeather(weatherService.getFallbackWeather());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  return {
    weather,
    loading,
    error,
    refetch: fetchWeather
  };
}