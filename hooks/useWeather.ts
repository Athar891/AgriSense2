'use client';

import { useState, useEffect } from 'react';
import { weatherService, WeatherData, ForecastData, WeatherAlert, LocationSearchResult } from '@/lib/weather';

interface UseWeatherReturn {
  weather: WeatherData | null;
  forecast: ForecastData[];
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseWeatherSearchReturn {
  searchResults: LocationSearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
}

export function useWeather(location?: string): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = location;

      // If no location provided, try to get user's current location
      if (!query) {
        try {
          const position = await weatherService.getCurrentPosition();
          query = `${position.coords.latitude},${position.coords.longitude}`;
        } catch (locationError) {
          console.warn('Location access failed, using fallback:', locationError);
          query = 'Mumbai'; // Fallback location
        }
      }

      // Fetch current weather, forecast, and alerts in parallel
      const [weatherData, forecastData, alertsData] = await Promise.all([
        weatherService.getCurrentWeather(query),
        weatherService.getWeatherForecast(query, 7),
        weatherService.getWeatherAlerts(query)
      ]);
      
      setWeather(weatherData);
      setForecast(forecastData);
      setAlerts(alertsData);
    } catch (weatherError) {
      console.error('Weather fetch failed:', weatherError);
      setError('Failed to load weather data');
      // Use fallback data even on error
      setWeather(weatherService.getFallbackWeather());
      setForecast(weatherService.getFallbackForecast());
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  return {
    weather,
    forecast,
    alerts,
    loading,
    error,
    refetch: fetchWeather
  };
}

export function useWeatherSearch(): UseWeatherSearchReturn {
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await weatherService.searchLocations(query);
      setSearchResults(results);
    } catch (searchError) {
      console.error('Location search failed:', searchError);
      setError('Failed to search locations');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResults,
    loading,
    error,
    search
  };
}