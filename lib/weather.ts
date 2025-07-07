const WEATHER_API_KEY = '0b50cb3664b44ed7819180033250607';
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  description: string;
  icon: string;
  location: string;
  country: string;
  feelsLike: number;
  pressure: number;
  visibility: number;
  lastUpdated: string;
}

export interface ForecastData {
  date: string;
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  chanceOfRain: number;
  chanceOfSnow: number;
}

export interface WeatherAlert {
  headline: string;
  severity: string;
  areas: string;
  event: string;
  effective: string;
  expires: string;
  description: string;
  instruction: string;
}

export interface LocationSearchResult {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

export interface WeatherError {
  message: string;
  code?: string;
}

class WeatherService {
  async getCurrentWeather(query: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&aqi=yes`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch weather data');
      }

      const data = await response.json();
      const current = data.current;
      const location = data.location;

      return {
        temperature: Math.round(current.temp_c),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_kph),
        uvIndex: current.uv,
        description: current.condition.text,
        icon: current.condition.icon,
        location: location.name,
        country: location.country,
        feelsLike: Math.round(current.feelslike_c),
        pressure: current.pressure_mb,
        visibility: current.vis_km,
        lastUpdated: current.last_updated
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherForecast(query: string, days: number = 7): Promise<ForecastData[]> {
    try {
      const response = await fetch(
        `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&days=${days}&aqi=yes&alerts=yes`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch forecast data');
      }

      const data = await response.json();
      const forecast = data.forecast.forecastday;

      return forecast.map((day: any) => ({
        date: day.date,
        maxTemp: Math.round(day.day.maxtemp_c),
        minTemp: Math.round(day.day.mintemp_c),
        avgTemp: Math.round(day.day.avgtemp_c),
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        humidity: day.day.avghumidity,
        windSpeed: Math.round(day.day.maxwind_kph),
        uvIndex: day.day.uv,
        chanceOfRain: day.day.daily_chance_of_rain,
        chanceOfSnow: day.day.daily_chance_of_snow
      }));
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch forecast data');
    }
  }

  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    try {
      const response = await fetch(
        `${WEATHER_API_BASE}/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to search locations');
      }

      const data = await response.json();
      return data.map((location: any, index: number) => ({
        id: index,
        name: location.name,
        region: location.region,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
        url: location.url
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      throw new Error('Failed to search locations');
    }
  }

  async getWeatherAlerts(query: string): Promise<WeatherAlert[]> {
    try {
      const response = await fetch(
        `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&days=1&alerts=yes`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch weather alerts');
      }

      const data = await response.json();
      
      if (!data.alerts || !data.alerts.alert) {
        return [];
      }

      return data.alerts.alert.map((alert: any) => ({
        headline: alert.headline,
        severity: alert.severity,
        areas: alert.areas,
        event: alert.event,
        effective: alert.effective,
        expires: alert.expires,
        description: alert.desc,
        instruction: alert.instruction
      }));
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }

  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  getRecommendedLocations(): Array<{ name: string; country: string; type: string; description: string }> {
    return [
      { name: 'Mumbai', country: 'India', type: 'Metropolitan', description: 'Financial capital of India' },
      { name: 'Delhi', country: 'India', type: 'Capital', description: 'National capital territory' },
      { name: 'Bangalore', country: 'India', type: 'Tech Hub', description: 'Silicon Valley of India' },
      { name: 'Chennai', country: 'India', type: 'Coastal', description: 'Gateway to South India' },
      { name: 'Kolkata', country: 'India', type: 'Cultural', description: 'City of Joy' },
      { name: 'Hyderabad', country: 'India', type: 'IT Hub', description: 'Pearl City' },
      { name: 'Pune', country: 'India', type: 'Educational', description: 'Oxford of the East' },
      { name: 'Ahmedabad', country: 'India', type: 'Industrial', description: 'Manchester of India' }
    ];
  }

  getFallbackWeather(): WeatherData {
    return {
      temperature: 25,
      humidity: 65,
      windSpeed: 12,
      uvIndex: 5,
      description: 'Partly cloudy',
      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      location: 'Mumbai',
      country: 'India',
      feelsLike: 27,
      pressure: 1013,
      visibility: 10,
      lastUpdated: new Date().toISOString()
    };
  }

  getFallbackForecast(): ForecastData[] {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      return {
        date: date.toISOString().split('T')[0],
        maxTemp: 28 + Math.floor(Math.random() * 5),
        minTemp: 20 + Math.floor(Math.random() * 5),
        avgTemp: 24 + Math.floor(Math.random() * 3),
        condition: 'Partly cloudy',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
        humidity: 60 + Math.floor(Math.random() * 20),
        windSpeed: 10 + Math.floor(Math.random() * 10),
        uvIndex: 3 + Math.floor(Math.random() * 7),
        chanceOfRain: Math.floor(Math.random() * 30),
        chanceOfSnow: 0
      };
    });
  }
}

export const weatherService = new WeatherService();