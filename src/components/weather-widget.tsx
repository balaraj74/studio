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
import { WeatherIcon } from '@/components/weather-icon';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const getTimeBasedGradient = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) { // Morning
    return 'bg-gradient-to-br from-amber-400/80 via-orange-500/80 to-yellow-500/80 text-white';
  }
  if (hour >= 12 && hour < 17) { // Daytime
    return 'bg-gradient-to-br from-sky-400/80 to-blue-600/80 text-white';
  }
  if (hour >= 17 && hour < 20) { // Evening
    return 'bg-gradient-to-br from-purple-500/80 via-pink-500/80 to-red-500/80 text-white';
  }
  // Night
  return 'bg-gradient-to-br from-indigo-800/80 to-slate-900/80 text-white';
};

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<GetWeatherInfoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [gradientClass, setGradientClass] = useState('');
  
  useEffect(() => {
    setGradientClass(getTimeBasedGradient());
  }, []);

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
        <Skeleton className="h-[120px] w-full" />
    );
  }

  if (error || !weatherData) {
    return (
       <Card className="bg-destructive/20 border-destructive">
            <CardHeader>
                <CardTitle>Weather Unavailable</CardTitle>
                <CardDescription className="text-destructive-foreground/80">{error || 'Could not load weather data.'}</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <Card className={cn("w-full transition-colors duration-1000", gradientClass)}>
        <Link href="/weather" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{weatherData.location.name}</CardTitle>
                    <p className="text-5xl font-bold pt-2">{weatherData.current.temperature}°C</p>
                    <CardDescription className="text-white/90 font-medium">{weatherData.summary}</CardDescription>
                </div>
                <WeatherIcon code={weatherData.current.weatherCode} className="h-24 w-24" />
            </CardHeader>
        </Link>
    </Card>
  );
}
