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
import { Loader2, Wind, Droplets, CloudSun, AlertCircle } from 'lucide-react';
import { WeatherIcon } from '@/components/weather-icon';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<GetWeatherInfoOutput | null>(
    null
  );
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
            toast({
              variant: 'destructive',
              title: 'Weather Service Failed',
              description: 'Please try again later.',
            });
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          setError('Location access denied.');
          setIsLoading(false);
        }
      );
    };

    fetchWeather();
  }, [toast]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span>Weather Unavailable</span>
                </CardTitle>
                <CardDescription>{error || 'Could not load weather information.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/weather" className="text-sm text-primary hover:underline">
                    Try reloading on the Weather page
                </Link>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <Link href="/weather">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <CloudSun className="h-5 w-5 text-primary"/>
            <span>Weather in {weatherData.location.name}</span>
          </CardTitle>
          <CardDescription>{weatherData.summary}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <WeatherIcon
              code={weatherData.current.weatherCode}
              className="h-16 w-16 text-yellow-400"
            />
            <div>
              <p className="text-4xl font-bold">
                {weatherData.current.temperature}°C
              </p>
              <p className="text-muted-foreground font-medium">
                {WeatherIcon.getDescription(weatherData.current.weatherCode)}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col gap-2 text-sm">
             <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary"/>
                <span>Humidity: {weatherData.current.humidity}%</span>
             </div>
             <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-primary"/>
                <span>Wind: {weatherData.current.windSpeed} km/h</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
