'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { marketPriceSearch, type MarketPriceSearchOutput } from '@/ai/flows/market-price-search';
import { predictMarketPrice, type PredictMarketPriceOutput, type DailyForecast } from '@/ai/flows/price-prediction-flow';
import { Bot, LineChart, Loader2, Search, TrendingUp, TrendingDown, Minus, AreaChart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';


type Price = MarketPriceSearchOutput['prices'][0];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
        <div className="p-2 bg-background/80 border rounded-md shadow-lg backdrop-blur-sm">
            <p className="font-bold">{format(parseISO(label), 'MMM d')}</p>
            <p style={{ color: payload[0].stroke }}>
                Price: ₹{payload[0].value.toFixed(2)}
            </p>
        </div>
        );
    }
    return null;
};


function PriceForecastCard() {
    const { toast } = useToast();
    const [isPredicting, setIsPredicting] = useState(false);
    const [prediction, setPrediction] = useState<PredictMarketPriceOutput | null>(null);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedMarket, setSelectedMarket] = useState('');

    const crops = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Maize', 'Turmeric', 'Chana'];
    const markets = ['Nagpur Mandi', 'Indore Mandi', 'Davangere APMC', 'Kurnool Market', 'Rajkot Market'];

    const handlePredict = async () => {
        if (!selectedCrop || !selectedMarket) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select both a crop and a market.'
            });
            return;
        }
        setIsPredicting(true);
        setPrediction(null);
        try {
            const result = await predictMarketPrice({ cropName: selectedCrop, marketName: selectedMarket });
            setPrediction(result);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Prediction Failed',
                description: 'Could not generate a forecast at this time.'
            });
        } finally {
            setIsPredicting(false);
        }
    };

    const chartData = prediction?.forecast.map(f => ({
        date: f.date,
        price: f.predictedPrice
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>7-Day Price Forecast</CardTitle>
                <CardDescription>Predict next week's mandi prices for a selected crop and market.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                        <SelectTrigger><SelectValue placeholder="Select Crop" /></SelectTrigger>
                        <SelectContent>{crops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                        <SelectTrigger><SelectValue placeholder="Select Market" /></SelectTrigger>
                        <SelectContent>{markets.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                     <Button onClick={handlePredict} disabled={isPredicting}>
                        {isPredicting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AreaChart className="mr-2 h-4 w-4" />}
                        {isPredicting ? 'Forecasting...' : 'Forecast Prices'}
                    </Button>
                </div>
                 {prediction && (
                    <div className="space-y-4 animate-in fade-in-50">
                        <p className="text-sm text-muted-foreground">{prediction.summary}</p>
                        <div className="h-[250px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                                <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={(str) => format(parseISO(str), 'MMM d')} />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} name="Price" />
                                </RechartsLineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                 )}
            </CardContent>
            {prediction && (
                <CardFooter>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Predicted Price (per Quintal)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prediction.forecast.map((f: DailyForecast) => (
                                <TableRow key={f.date}>
                                    <TableCell>{format(parseISO(f.date), 'EEEE, MMM d')}</TableCell>
                                    <TableCell className="text-right font-mono">₹{f.predictedPrice.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardFooter>
            )}
        </Card>
    );
}


export default function MarketPageClient() {
  const [question, setQuestion] = useState('');
  const [searchResult, setSearchResult] = useState<MarketPriceSearchOutput | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialPrices = async () => {
      setIsInitialLoading(true);
      try {
        const result = await marketPriceSearch({ question: '' });
        setSearchResult(result);
      } catch (error) {
        console.error('Initial price fetch error:', error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Prices',
          description: 'Could not load the initial market prices. Please try again later.',
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialPrices();
  }, [toast]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isSearching) return;

    setIsSearching(true);
    setSearchResult(null); // Clear previous results

    try {
      const result = await marketPriceSearch({ question });
      setSearchResult(result);
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Search Failed',
        description: 'Could not get a response from the AI assistant. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const Trend = ({ value }: { value: number }) => {
    let Icon = Minus;
    let color = 'text-muted-foreground';
    if (value > 0) {
      Icon = TrendingUp;
      color = 'text-green-600';
    } else if (value < 0) {
      Icon = TrendingDown;
      color = 'text-red-600';
    }

    return (
      <div className={cn('flex items-center gap-1 font-semibold', color)}>
        <Icon className="h-4 w-4" />
        <span>{Math.abs(value)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <LineChart className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Market Prices</h1>
          <p className="text-muted-foreground">View latest crop prices and ask the AI for specific details.</p>
        </div>
      </div>

      <PriceForecastCard />

      <Card>
        <CardHeader>
          <CardTitle>Ask AI Price Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., 'What is the price of Basmati rice in Haryana?'"
              disabled={isSearching}
            />
            <Button type="submit" size="icon" disabled={isSearching || !question.trim()} aria-label="Search">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isSearching && (
        <div className="flex items-center gap-2 text-muted-foreground animate-pulse p-4">
          <Bot className="h-5 w-5" />
          <p>AI is searching for an answer...</p>
        </div>
      )}
      
      {searchResult?.answer && (
         <Card>
            <CardHeader>
                <CardTitle>AI Response</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="flex items-start gap-3 text-sm animate-in fade-in-50">
                    <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-foreground whitespace-pre-wrap prose prose-sm max-w-none">{searchResult.answer}</div>
                </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Today's Market Overview</CardTitle>
          {isInitialLoading ? (
            <Skeleton className="h-5 w-3/4 mt-1.5" />
          ) : (
            <CardDescription>{searchResult?.summary || 'Price data for major crops across India.'}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isInitialLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-[80px] float-right" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-[50px] float-right" /></TableCell>
                    </TableRow>
                  ))
                ) : searchResult?.prices && searchResult.prices.length > 0 ? (
                  searchResult.prices.map((price: Price, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{price.cropName}</TableCell>
                      <TableCell className="text-muted-foreground">{price.market}</TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{price.price.toLocaleString()}<span className="text-xs text-muted-foreground"> {price.unit}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Trend value={price.trend} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No price information available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
