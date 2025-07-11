'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { marketPriceSearch } from '@/ai/flows/market-price-search';
import { Bot, LineChart, Loader2, Search, Wand2, ArrowRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function MarketPageClient() {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const handleAiSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiLoading) return;

    setIsAiLoading(true);
    setAiAnswer('');

    try {
      const result = await marketPriceSearch({ question: aiQuestion });
      setAiAnswer(result.answer);
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Search Failed',
        description: 'Could not get a response from the AI assistant. Please try again.',
      });
      setAiAnswer("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const sampleQuestions = [
    "What is the current price of wheat in Punjab?",
    "Show me a table of maize prices in Karnataka and Maharashtra.",
    "Which cotton variety has the highest price right now?",
  ];

  const handleSampleQuestion = (question: string) => {
    setAiQuestion(question);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <LineChart className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Market Price Assistant</h1>
          <p className="text-muted-foreground">Ask Gemini about the latest crop prices.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Ask a Question
          </CardTitle>
          <CardDescription>
            Ask about crop prices in plain language. The AI will provide the latest information it has access to.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAiSearch} className="flex flex-col gap-4">
            <Textarea
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="e.g., What's the highest price for wheat?"
              disabled={isAiLoading}
              className="min-h-[80px]"
            />
            <Button type="submit" disabled={isAiLoading || !aiQuestion.trim()} className="self-end">
              {isAiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Ask AI
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
            <div className="w-full">
                <p className="text-sm font-medium text-muted-foreground mb-2">Or try a sample question:</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    {sampleQuestions.map(q => (
                        <Button key={q} variant="outline" size="sm" onClick={() => handleSampleQuestion(q)} className="text-left justify-start">
                           <ArrowRight className="mr-2 h-4 w-4" /> {q}
                        </Button>
                    ))}
                </div>
            </div>
        </CardFooter>
      </Card>

      {(isAiLoading || aiAnswer) && (
        <Card>
            <CardHeader>
                <CardTitle>AI Response</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full space-y-4">
                {isAiLoading && !aiAnswer && (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                    <Bot className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">AgriSence AI is thinking...</p>
                    </div>
                )}
                {aiAnswer && (
                    <div className="flex items-start gap-3 text-sm animate-in fade-in-50">
                    <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-foreground whitespace-pre-wrap prose prose-sm max-w-none">{aiAnswer}</div>
                    </div>
                )}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
