"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  AlertTriangle,
} from "lucide-react";

type WeatherData = {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  forecast: {
    day: string;
    temp: number;
    icon: string;
  }[];
};

const weatherIcons: { [key: string]: React.ReactNode } = {
  "01d": <Sun className="h-6 w-6 text-yellow-500" />,
  "02d": <CloudSun className="h-6 w-6 text-yellow-600" />,
  "03d": <Cloud className="h-6 w-6 text-gray-500" />,
  "04d": <Cloud className="h-6 w-6 text-gray-600" />,
  "09d": <CloudRain className="h-6 w-6 text-blue-500" />,
  "10d": <CloudRain className="h-6 w-6 text-blue-600" />,
  "11d": <CloudSnow className="h-6 w-6 text-indigo-500" />,
  "13d": <CloudSnow className="h-6 w-6 text-blue-300" />,
  "50d": <Cloud className="h-6 w-6 text-gray-400" />,
};
const CloudSun = ({className}: {className?: string}) => <div className={className}><Cloud/><Sun className="absolute top-0 right-0"/></div>

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMockWeatherData = async (
    lat: number,
    lon: number
  ): Promise<WeatherData> => {
    // This is a mock function. In a real app, you would fetch from an API
    // like OpenWeatherMap using the lat/lon and an API key.
    console.log(`Fetching mock weather for ${lat}, ${lon}`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();

    return {
      city: "Bengaluru, IN",
      temperature: 28,
      description: "Partly cloudy",
      icon: "02d",
      humidity: 65,
      windSpeed: 12,
      forecast: [
        { day: days[(today + 1) % 7], temp: 29, icon: "01d" },
        { day: days[(today + 2) % 7], temp: 30, icon: "02d" },
        { day: days[(today + 3) % 7], temp: 27, icon: "10d" },
        { day: days[(today + 4) % 7], temp: 26, icon: "09d" },
        { day: days[(today + 5) % 7], temp: 28, icon: "03d" },
      ],
    };
  };

  const fetchWeather = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await getMockWeatherData(
            position.coords.latitude,
            position.coords.longitude
          );
          setWeather(data);
        } catch (apiError) {
          setError("Failed to fetch weather data. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location. Please enable location services.");
        setLoading(false);
        // As a fallback, load with default location
        getMockWeatherData(12.97, 77.59).then(setWeather);
      }
    );
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <Card>
          <CardHeader>
             <Skeleton className="h-8 w-1/2" />
             <Skeleton className="h-5 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !weather) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold font-headline">Weather Forecast</h1>
                <p className="text-muted-foreground">Local weather conditions and forecast.</p>
            </div>
            <Card className="text-center p-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-medium">Error</h3>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <Button onClick={fetchWeather} className="mt-4">
                    Try Again
                </Button>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Weather Forecast</h1>
        <p className="text-muted-foreground">
          Real-time local weather conditions to help you plan your day.
        </p>
      </div>

      {weather && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span>Weather in {weather.city}</span>
            </CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-lg bg-muted p-6">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{weatherIcons[weather.icon]}</div>
                <div>
                  <p className="text-6xl font-bold">{weather.temperature}°C</p>
                  <p className="text-muted-foreground capitalize">
                    {weather.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <span>Humidity: {weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <span>Wind: {weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {weather.forecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 rounded-lg border p-4"
                  >
                    <p className="font-medium">{day.day}</p>
                    <div className="text-4xl">{weatherIcons[day.icon]}</div>
                    <p className="text-lg font-semibold">{day.temp}°C</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
