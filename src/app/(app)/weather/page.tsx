'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getWeatherInfo } from '@/ai/flows/weather-search';
import { Bot, CloudSun, Loader2, LocateFixed, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


export default function WeatherPage() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('idle'); // idle, locating, fetching, done, error
  const { toast } = useToast();

  const handleGetWeatherForLocation = async () => {
    setStatus('locating');
    setError(null);
    setResponse('');

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
                setResponse(result.response);
                setStatus('done');
            } catch (err) {
                console.error('AI weather error:', err);
                setError('Could not get a response from the AI assistant. Please try again.');
                setStatus('error');
                toast({
                    variant: 'destructive',
                    title: 'AI Weather Failed',
                    description: 'There was a problem contacting the AI assistant.',
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
            return 'Getting your location... Please grant permission if prompted.';
        case 'fetching':
            return 'Got your location! Gemini is checking the skies...';
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
          <h1 className="text-3xl font-bold font-headline">AI Weather Assistant</h1>
          <p className="text-muted-foreground">
            Get a conversational weather forecast from Gemini for your current location.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Local Weather</CardTitle>
          <CardDescription>
            Use your current location to get the latest weather forecast.
          </CardDescription>
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
                  Fetching...
                </>
              ) : (
                <>
                  <LocateFixed className="mr-2 h-5 w-5" />
                  Use My Location
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground h-5">
                {status !== 'idle' && status !== 'done' && !error && getStatusMessage()}
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
      
      {(isLoading || response) && !error && (
        <Card>
            <CardHeader>
                <CardTitle>Forecast for Your Current Location</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full space-y-4">
                {isLoading && !response && (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                        <Bot className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm">{getStatusMessage()}</p>
                    </div>
                )}
                {response && (
                    <div className="flex items-start gap-3 text-sm animate-in fade-in-50">
                        <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-foreground whitespace-pre-wrap prose prose-sm max-w-none">{response}</div>
                    </div>
                )}
                </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}