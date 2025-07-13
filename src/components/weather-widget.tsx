
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getWeatherInfo, type GetWeatherInfoOutput } from '@/ai/flows/weather-search';
import { WeatherIcon } from '@/components/weather-icon';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { RealTimeClock } from './real-time-clock';

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
        { timeout: 10000 }
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
            <CardContent className="p-4">
                <p className="font-semibold">Weather Unavailable</p>
                <p className="text-sm text-destructive-foreground/80">{error || 'Could not load weather data.'}</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full bg-secondary/30 hover:bg-secondary/50 transition-colors">
        <Link href="/weather" className="block h-full">
            <CardContent className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <WeatherIcon code={weatherData.current.weatherCode} className="h-16 w-16 text-accent" />
                    <div>
                        <p className="text-5xl font-bold">{weatherData.current.temperature}°</p>
                        <p className="font-medium">{WeatherIcon.getDescription(weatherData.current.weatherCode)}</p>
                    </div>
                </div>
                 <div className="text-right">
                    <RealTimeClock />
                    <p className="opacity-90 mt-1">{weatherData.location.name}</p>
                </div>
            </CardContent>
        </Link>
    </Card>
  );
}
