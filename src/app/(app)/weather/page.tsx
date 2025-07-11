'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getWeatherInfo } from '@/ai/flows/weather-search';
import { Bot, CloudSun, Loader2, Search } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function WeatherPage() {
  const [location, setLocation] = useState('Bengaluru, India');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetWeather = async (e: FormEvent) => {
    e.preventDefault();
    if (!location.trim() || isLoading) return;

    setIsLoading(true);
    setResponse('');

    try {
      const result = await getWeatherInfo({ location });
      setResponse(result.response);
    } catch (error) {
      console.error('AI weather error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Weather Failed',
        description: 'Could not get a response from the AI assistant. Please try again.',
      });
      setResponse('Sorry, I was unable to fetch the weather for that location. Please ensure you provided a valid city name and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <CloudSun className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Weather Assistant</h1>
          <p className="text-muted-foreground">
            Get a conversational weather forecast from Gemini.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Weather</CardTitle>
          <CardDescription>Enter a city name to get the latest weather forecast.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGetWeather} className="flex gap-2">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Mumbai, India"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !location.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Get Weather
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {(isLoading || response) && (
        <Card>
            <CardHeader>
                <CardTitle>Forecast for {location}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full space-y-4">
                {isLoading && !response && (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                        <Bot className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm">Gemini is checking the skies...</p>
                    </div>
                )}
                {response && (
                    <div className="flex items-start gap-3 text-sm animate-in fade-in-50">
                        <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-foreground whitespace-pre-wrap">{response}</p>
                    </div>
                )}
                </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
