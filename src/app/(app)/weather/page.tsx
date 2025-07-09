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
  Droplets,
  Wind,
  MapPin,
  AlertTriangle,
  CloudSun,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  "01d": <Sun className="h-full w-full text-yellow-500" />,
  "02d": <CloudSun className="h-full w-full text-yellow-500" />,
  "03d": <Cloud className="h-full w-full text-gray-500" />,
  "04d": <Cloud className="h-full w-full text-gray-600" />,
  "09d": <CloudRain className="h-full w-full text-blue-500" />,
  "10d": <CloudRain className="h-full w-full text-blue-600" />,
  "11d": <CloudSnow className="h-full w-full text-indigo-500" />,
  "13d": <CloudSnow className="h-full w-full text-blue-300" />,
  "50d": <Cloud className="h-full w-full text-gray-400" />,
  "unknown": <Sun className="h-full w-full text-yellow-500" />,
};

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMockWeatherData = async (
    lat: number,
    lon: number
  ): Promise<WeatherData> => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); 

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
      getMockWeatherData(12.97, 77.59).then(setWeather).finally(() => setLoading(false));
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
        getMockWeatherData(12.97, 77.59).then(setWeather).finally(() => setLoading(false));
      }
    );
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <Card>
          <CardHeader>
             <Skeleton className="h-8 w-1/2" />
             <Skeleton className="h-5 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <CloudSun className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Weather Forecast</h1>
          <p className="text-muted-foreground">
            Real-time local weather to help you plan your day.
          </p>
        </div>
      </div>
      
      {error && (
        <Card className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <div className="flex-1">
                    <CardTitle className="text-destructive">Location Error</CardTitle>
                    <CardDescription className="text-destructive/80">{error} Showing default location.</CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      {weather && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span>Weather in {weather.city}</span>
            </CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-lg bg-muted p-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20">{weatherIcons[weather.icon] || weatherIcons['unknown']}</div>
                <div>
                  <p className="text-6xl font-bold">{weather.temperature}°C</p>
                  <p className="text-muted-foreground capitalize text-lg">
                    {weather.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <span>Humidity</span>
                  <span className="text-right flex-1">{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <span>Wind</span>
                  <span className="text-right flex-1">{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {weather.forecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted transition-colors"
                  >
                    <p className="font-bold text-lg">{day.day}</p>
                    <div className="h-10 w-10">{weatherIcons[day.icon] || weatherIcons['unknown']}</div>
                    <p className="text-xl font-semibold">{day.temp}°C</p>
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
