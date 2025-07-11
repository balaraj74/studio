'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getWeatherInfo, type GetWeatherInfoOutput } from '@/ai/flows/weather-search';
import { Bot, CloudSun, Loader2, LocateFixed, AlertCircle, Wind, Droplets, ThermometerSun, ThermometerSnowflake } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WeatherIcon } from '@/components/weather-icon';

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<GetWeatherInfoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('idle'); // idle, locating, fetching, done, error
  const { toast } = useToast();

  const handleGetWeatherForLocation = async () => {
    setStatus('locating');
    setError(null);
    setWeatherData(null);

    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        setStatus('error');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            setStatus('fetching');
            setIsLoading(true);
            try {
                const result = await getWeatherInfo({ lat: latitude, lon: longitude });
                setWeatherData(result);
                setStatus('done');
            } catch (err) {
                console.error('AI weather error:', err);
                setError('Could not get a response from the weather service. Please try again.');
                setStatus('error');
                toast({
                    variant: 'destructive',
                    title: 'Weather Service Failed',
                    description: 'There was a problem contacting the weather service.',
                });
            } finally {
                setIsLoading(false);
            }
        },
        () => {
            setError("Permission to access location was denied. Please enable location services in your browser settings.");
            setStatus('error');
        }
    );
  };

  const getStatusMessage = () => {
    switch (status) {
        case 'locating':
            return 'Getting your location...';
        case 'fetching':
            return 'Checking the skies...';
        default:
            return 'Click the button to get the weather for your current location.';
    }
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
            Get the latest weather forecast for your current location.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Local Weather</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4">
            <Button 
                size="lg" 
                onClick={handleGetWeatherForLocation} 
                disabled={isLoading}
                className="font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {getStatusMessage()}
                </>
              ) : (
                <>
                  <LocateFixed className="mr-2 h-5 w-5" />
                  Use My Location
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground h-5">
                {status === 'idle' && getStatusMessage()}
            </p>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {weatherData && (
        <div className="space-y-6 animate-in fade-in-50">
            <Card>
                <CardHeader>
                    <CardTitle>Current Weather in {weatherData.location.name}</CardTitle>
                    <CardDescription>
                        {weatherData.summary}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <WeatherIcon code={weatherData.current.weatherCode} className="h-24 w-24 text-yellow-400" />
                        <div>
                            <p className="text-7xl font-bold">{weatherData.current.temperature}°C</p>
                            <p className="text-muted-foreground font-medium mt-1">{WeatherIcon.getDescription(weatherData.current.weatherCode)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Droplets className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">Humidity</p>
                                <p className="text-muted-foreground">{weatherData.current.humidity}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wind className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">Wind Speed</p>
                                <p className="text-muted-foreground">{weatherData.current.windSpeed} km/h</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>5-Day Forecast</CardTitle>
                    <CardDescription>A look at the weather for the upcoming week.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {weatherData.daily.map((day, index) => (
                            <Card key={index} className="flex flex-col items-center p-4 text-center">
                                <p className="font-semibold text-lg">{day.date}</p>
                                <WeatherIcon code={day.weatherCode} className="h-16 w-16 text-yellow-400 my-2" />
                                <p className="text-sm text-muted-foreground mb-2">{WeatherIcon.getDescription(day.weatherCode)}</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <ThermometerSun className="h-4 w-4 text-red-500"/> {day.maxTemp}°
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <ThermometerSnowflake className="h-4 w-4 text-blue-500"/> {day.minTemp}°
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
