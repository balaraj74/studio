'use client';

import { useState, type FormEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { searchSchemes, type SearchSchemesOutput } from '@/ai/flows/schemes-search';
import { Bot, Loader2, Search, Wand2, ScrollText, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SchemesPageClient() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchSchemesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const searchResult = await searchSchemes({ query });
      setResult(searchResult);
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Search Failed',
        description: 'Could not get a response from the AI assistant. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <ScrollText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Government Scheme Finder</h1>
          <p className="text-muted-foreground">
            Ask Gemini to find central and state government schemes for you.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Schemes</CardTitle>
          <CardDescription>
            Enter a crop, state, or topic to find relevant schemes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'subsidy for drip irrigation in Maharashtra' or 'PM-KISAN'"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !query.trim()} aria-label="Find Schemes">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <Bot className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">AgriSence AI is searching for schemes...</p>
                </div>
            </CardContent>
        </Card>
      )}

      {result === null && !isLoading && (
        <Card className="flex items-center justify-center h-64">
            <div className="text-center p-8">
                <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Find Government Schemes</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Enter a query above to find relevant schemes for you.
                </p>
            </div>
        </Card>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in-50">
            <div className="flex items-start gap-3 text-sm">
                <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground bg-muted p-3 rounded-lg">{result.message}</p>
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.schemes.length > 0 ? (
            result.schemes.map((scheme, index) => (
                <Card key={index} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                        <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>
                    <span>{scheme.name}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div>
                        <h4 className="font-semibold mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">{scheme.description}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-1">Eligibility</h4>
                        <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    {scheme.link && scheme.link !== '#' ? (
                        <Button asChild className="w-full" variant="outline">
                        <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                            Learn More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        </Button>
                    ) : (
                        <p className="text-xs text-muted-foreground w-full text-center">No official link available</p>
                    )}
                </CardFooter>
                </Card>
            ))
            ) : (
            <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground font-semibold">
                The AI couldn't find any specific schemes for your query.
                </p>
                <p className="text-sm text-muted-foreground mt-1">Try being more specific or general in your search.</p>
            </div>
            )}
        </div>
        </div>
      )}
    </div>
  );
}
