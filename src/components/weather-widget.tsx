
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { getWeatherInfo, type GetWeatherInfoOutput } from '@/ai/flows/weather-search';
import { WeatherIcon } from '@/components/weather-icon';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<GetWeatherInfoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <Skeleton className="h-[90px] w-full rounded-2xl" />
    );
  }

  if (error || !weatherData) {
    return (
       <Card className="bg-destructive/20 border-destructive rounded-2xl">
            <CardContent className="p-4">
                <p className="font-semibold">Weather Unavailable</p>
                <p className="text-sm text-destructive-foreground/80">{error || 'Could not load weather data.'}</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full bg-secondary rounded-2xl">
        <Link href="/weather" className="block h-full">
            <CardContent className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <WeatherIcon code={weatherData.current.weatherCode} className="h-10 w-10 text-primary flex-shrink-0" />
                    <div className="overflow-hidden">
                        <p className="font-medium text-muted-foreground truncate">{weatherData.location.name}</p>
                        <p className="text-2xl font-bold">{weatherData.current.temperature}°C</p>
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-x-2 text-center text-xs flex-shrink-0 pr-1">
                    <div>
                      <p className="font-bold">{weatherData.current.humidity}%</p>
                      <p className="text-muted-foreground">Humidity</p>
                    </div>
                     <div>
                      <p className="font-bold">{weatherData.current.windSpeed} km/h</p>
                      <p className="text-muted-foreground">Wind</p>
                    </div>
                    <div>
                      <p className="font-bold">{weatherData.daily[0].maxTemp}°C</p>
                      <p className="text-muted-foreground">Max</p>
                    </div>
                 </div>
            </CardContent>
        </Link>
    </Card>
  );
}
