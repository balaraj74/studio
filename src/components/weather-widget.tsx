'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getWeatherInfo, type GetWeatherInfoOutput } from '@/ai/flows/weather-search';
import { Wind, Droplets, AlertCircle } from 'lucide-react';
import { WeatherIcon } from '@/components/weather-icon';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<GetWeatherInfoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWeather = () => {
      setIsLoading(true);
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const result = await getWeatherInfo({ lat: latitude, lon: longitude });
            setWeatherData(result);
          } catch (err) {
            console.error('AI weather error:', err);
            setError('Could not fetch weather data.');
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          setError('Location access denied.');
          setIsLoading(false);
        },
        { timeout: 5000 }
      );
    };

    fetchWeather();
  }, []);

  if (isLoading) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card/80">
                <CardHeader>
                    <Skeleton className="h-5 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                </CardHeader>
            </Card>
            <Card className="bg-card/80">
                 <CardHeader>
                    <Skeleton className="h-5 w-16 mb-2" />
                    <Skeleton className="h-8 w-20" />
                </CardHeader>
            </Card>
        </div>
    );
  }

  if (error || !weatherData) {
    return (
       <div className="grid grid-cols-2 gap-4">
        <Card className="bg-destructive/20 border-destructive">
            <CardHeader>
                <CardTitle className="text-base">Weather</CardTitle>
                <CardDescription className="text-xs">{error || 'Unavailable'}</CardDescription>
            </CardHeader>
        </Card>
         <Card className="bg-card/80">
            <CardHeader>
                 <CardTitle className="text-base">Tasks</CardTitle>
                 <CardDescription className="text-xs">0 pending</CardDescription>
            </CardHeader>
        </Card>
       </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card/80 hover:bg-secondary/60 transition-colors">
            <Link href="/weather" className="block h-full">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Weather</CardTitle>
                        <WeatherIcon code={weatherData.current.weatherCode} className="h-6 w-6 text-amber-400" />
                    </div>
                     <p className="text-3xl font-bold pt-2">{weatherData.current.temperature}°C</p>
                    <CardDescription className="text-xs">{weatherData.location.name}</CardDescription>
                </CardHeader>
            </Link>
        </Card>
         <Card className="bg-card/80 hover:bg-secondary/60 transition-colors">
            <Link href="/records" className="block h-full">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Tasks</CardTitle>
                    </div>
                     <p className="text-3xl font-bold pt-2">12</p>
                    <CardDescription className="text-xs">Season 2024</CardDescription>
                </CardHeader>
            </Link>
        </Card>
    </div>
  );
}
