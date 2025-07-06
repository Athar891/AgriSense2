import { fetchWeatherApi } from 'openmeteo';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  description: string;
  icon: string;
  location: string;
  country: string;
}

export interface WeatherError {
  message: string;
  code?: string;
}

class WeatherService {
  private readonly GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  private readonly WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const params = {
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'wind_speed_10m',
          'weather_code'
        ],
        hourly: ['uv_index'],
        timezone: 'auto'
      };

      const responses = await fetchWeatherApi(this.WEATHER_URL, params);
      const response = responses[0];

      const current = response.current()!;
      const hourly = response.hourly()!;

      // Get current values
      const temperature = Math.round(current.variables(0)!.value());
      const humidity = Math.round(current.variables(1)!.value());
      const windSpeed = Math.round(current.variables(2)!.value() * 3.6); // Convert m/s to km/h
      const weatherCode = current.variables(3)!.value();

      // Get UV index from hourly data (current hour)
      const uvValues = hourly.variables(0)!.valuesArray()!;
      const uvIndex = Math.round(uvValues[0] || 0);

      // Get location name from coordinates
      const locationData = await this.getLocationName(lat, lon);

      return {
        temperature,
        humidity,
        windSpeed,
        uvIndex,
        description: this.getWeatherDescription(weatherCode),
        icon: this.getWeatherIcon(weatherCode),
        location: locationData.name,
        country: locationData.country
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      // First, get coordinates for the city
      const locationResponse = await fetch(
        `${this.GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      if (!locationResponse.ok) {
        throw new Error('Failed to find location');
      }

      const locationData = await locationResponse.json();
      
      if (!locationData.results || locationData.results.length === 0) {
        throw new Error('Location not found');
      }

      const location = locationData.results[0];
      const lat = location.latitude;
      const lon = location.longitude;

      // Now get weather data for these coordinates
      const params = {
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'wind_speed_10m',
          'weather_code'
        ],
        hourly: ['uv_index'],
        timezone: 'auto'
      };

      const responses = await fetchWeatherApi(this.WEATHER_URL, params);
      const response = responses[0];

      const current = response.current()!;
      const hourly = response.hourly()!;

      // Get current values
      const temperature = Math.round(current.variables(0)!.value());
      const humidity = Math.round(current.variables(1)!.value());
      const windSpeed = Math.round(current.variables(2)!.value() * 3.6); // Convert m/s to km/h
      const weatherCode = current.variables(3)!.value();

      // Get UV index from hourly data (current hour)
      const uvValues = hourly.variables(0)!.valuesArray()!;
      const uvIndex = Math.round(uvValues[0] || 0);

      return {
        temperature,
        humidity,
        windSpeed,
        uvIndex,
        description: this.getWeatherDescription(weatherCode),
        icon: this.getWeatherIcon(weatherCode),
        location: location.name,
        country: location.country_code?.toUpperCase() || location.country || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  private async getLocationName(lat: number, lon: number): Promise<{ name: string; country: string }> {
    try {
      // Use reverse geocoding to get location name
      const response = await fetch(
        `${this.GEOCODING_URL}?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const location = data.results[0];
          return {
            name: location.name,
            country: location.country_code?.toUpperCase() || location.country || 'Unknown'
          };
        }
      }
    } catch (error) {
      console.warn('Failed to get location name:', error);
    }

    // Fallback
    return { name: 'Unknown Location', country: 'Unknown' };
  }

  private getWeatherDescription(weatherCode: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: 'clear sky',
      1: 'mainly clear',
      2: 'partly cloudy',
      3: 'overcast',
      45: 'fog',
      48: 'depositing rime fog',
      51: 'light drizzle',
      53: 'moderate drizzle',
      55: 'dense drizzle',
      56: 'light freezing drizzle',
      57: 'dense freezing drizzle',
      61: 'slight rain',
      63: 'moderate rain',
      65: 'heavy rain',
      66: 'light freezing rain',
      67: 'heavy freezing rain',
      71: 'slight snow fall',
      73: 'moderate snow fall',
      75: 'heavy snow fall',
      77: 'snow grains',
      80: 'slight rain showers',
      81: 'moderate rain showers',
      82: 'violent rain showers',
      85: 'slight snow showers',
      86: 'heavy snow showers',
      95: 'thunderstorm',
      96: 'thunderstorm with slight hail',
      99: 'thunderstorm with heavy hail'
    };

    return weatherCodes[weatherCode] || 'unknown weather';
  }

  private getWeatherIcon(weatherCode: number): string {
    // Map weather codes to OpenWeatherMap-style icon codes for consistency
    if (weatherCode === 0) return '01d'; // clear sky
    if (weatherCode === 1) return '02d'; // mainly clear
    if (weatherCode === 2) return '03d'; // partly cloudy
    if (weatherCode === 3) return '04d'; // overcast
    if (weatherCode === 45 || weatherCode === 48) return '50d'; // fog
    if ([51, 53, 55, 56, 57].includes(weatherCode)) return '09d'; // drizzle
    if ([61, 63, 65, 66, 67].includes(weatherCode)) return '10d'; // rain
    if ([71, 73, 75, 77].includes(weatherCode)) return '13d'; // snow
    if ([80, 81, 82].includes(weatherCode)) return '09d'; // rain showers
    if ([85, 86].includes(weatherCode)) return '13d'; // snow showers
    if ([95, 96, 99].includes(weatherCode)) return '11d'; // thunderstorm
    
    return '01d'; // default to clear sky
  }

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location access denied by user'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information unavailable'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out'));
              break;
            default:
              reject(new Error('An unknown error occurred'));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Get popular agricultural cities for recommendations
  getRecommendedLocations(): Array<{ name: string; country: string; type: string; description: string }> {
    return [
      { name: 'Pune', country: 'IN', type: 'Agricultural Hub', description: 'Major agricultural research center' },
      { name: 'Nashik', country: 'IN', type: 'Wine Region', description: 'Famous for grapes and wine production' },
      { name: 'Aurangabad', country: 'IN', type: 'Cotton Belt', description: 'Major cotton growing region' },
      { name: 'Solapur', country: 'IN', type: 'Sugarcane Region', description: 'Leading sugarcane producer' },
      { name: 'Kolhapur', country: 'IN', type: 'Dairy Farming', description: 'Known for dairy and livestock' },
      { name: 'Ahmednagar', country: 'IN', type: 'Onion Hub', description: 'Major onion trading center' },
      { name: 'Sangli', country: 'IN', type: 'Turmeric Center', description: 'Leading turmeric market' },
      { name: 'Satara', country: 'IN', type: 'Strawberry Region', description: 'Famous for strawberry cultivation' },
      { name: 'Jalgaon', country: 'IN', type: 'Banana Belt', description: 'Major banana growing region' },
      { name: 'Latur', country: 'IN', type: 'Pulses Hub', description: 'Important for pulse crops' }
    ];
  }

  // Fallback weather data for demo purposes
  getFallbackWeather(): WeatherData {
    return {
      temperature: 28,
      humidity: 65,
      windSpeed: 12,
      uvIndex: 6,
      description: 'partly cloudy',
      icon: '02d',
      location: 'Pune',
      country: 'IN'
    };
  }
}

export const weatherService = new WeatherService();