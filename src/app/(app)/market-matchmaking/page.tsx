
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { findBestBuyers, FindBestBuyersInputSchema, type FindBestBuyersInput, type FindBestBuyersOutput } from '@/ai/flows/market-matchmaking-flow';
import { Loader2, Handshake, Bot, Star, MapPin, Truck, IndianRupee } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const ResultCard = ({ match }: { match: FindBestBuyersOutput['matches'][0] }) => {
    const rating = Math.round(match.rating * 2) / 2; // Round to nearest 0.5
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{match.buyerName}</span>
                    <div className="flex items-center gap-1 text-sm bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md">
                        <Star className="h-4 w-4" />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                </CardTitle>
                <CardDescription>{match.buyerType} from {match.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-around items-center text-center p-3 bg-muted rounded-lg">
                    <div>
                        <Label>Offer Price</Label>
                        <p className="text-xl font-bold flex items-center justify-center"><IndianRupee className="h-5 w-5 mr-1" />{match.offerPrice} / {match.offerUnit}</p>
                    </div>
                    <div>
                        <Label>Logistics</Label>
                        <p className="text-xl font-bold flex items-center justify-center gap-2">{match.pickupOrDelivery === 'Pickup' ? <Truck className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}{match.pickupOrDelivery}</p>
                    </div>
                </div>
                <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertDescription>{match.summary}</AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                <Button className="w-full">Contact Buyer</Button>
            </CardFooter>
        </Card>
    );
};


export default function MarketMatchmakingPage() {
  const [result, setResult] = useState<FindBestBuyersOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FindBestBuyersInput>({
    resolver: zodResolver(FindBestBuyersInputSchema),
    defaultValues: {
      cropType: '',
      quantity: 100,
      unit: 'kg',
      location: '',
      sellByDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = async (data: FindBestBuyersInput) => {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await findBestBuyers(data);
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'The AI could not find buyers. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Handshake className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Market Matchmaking</h1>
          <p className="text-muted-foreground">Find the best buyers for your harvest.</p>
        </div>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Enter Your Crop Details</CardTitle>
              <CardDescription>
                Provide details about your produce to let the AI find suitable buyers.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Tomatoes' or 'Basmati Rice'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-3 gap-2">
                 <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                           <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="quintal">quintal</SelectItem>
                                <SelectItem value="tonne">tonne</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>
               <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location (District, State)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Nashik, Maharashtra'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="sellByDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Preferred Sell By Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                {isLoading ? 'Finding Buyers...' : 'Find Best Buyers'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in-50">
           <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>AI Analysis Complete</AlertTitle>
                <AlertDescription>{result.overallSummary}</AlertDescription>
            </Alert>
            <div className="grid lg:grid-cols-3 gap-6">
                {result.matches.length > 0 ? (
                    result.matches.map((match, index) => (
                        <ResultCard key={index} match={match} />
                    ))
                ) : (
                    <div className="lg:col-span-3 text-center py-12 bg-card rounded-lg border">
                        <p className="text-muted-foreground font-semibold">
                        No suitable buyers found at this moment.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your quantity or location.</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
