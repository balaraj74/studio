'use server';

/**
 * @fileOverview An AI agent that answers questions about market prices.
 *
 * - marketPriceSearch - A function that handles the market price query.
 * - MarketPriceSearchInput - The input type for the marketPriceSearch function.
 * - MarketPriceSearchOutput - The return type for the marketPriceSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketPriceSearchInputSchema = z.object({
  question: z.string().describe("The user's question about crop prices."),
});
export type MarketPriceSearchInput = z.infer<typeof MarketPriceSearchInputSchema>;

const MarketPriceSearchOutputSchema = z.object({
  answer: z.string().describe("The AI-generated answer to the user's question. If you provide prices, provide them in a list or table format for clarity."),
});
export type MarketPriceSearchOutput = z.infer<typeof MarketPriceSearchOutputSchema>;

export async function marketPriceSearch(input: MarketPriceSearchInput): Promise<MarketPriceSearchOutput> {
  return marketPriceSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketPriceSearchPrompt',
  input: {schema: MarketPriceSearchInputSchema},
  output: {schema: MarketPriceSearchOutputSchema},
  prompt: `You are an expert agricultural market analyst. Your task is to answer the user's question about crop prices based on your knowledge.
  
  Provide a concise, helpful answer in plain language. If you can provide a table of prices, that would be ideal.
  If you do not have real-time data, state that clearly but provide the most recent information you have access to.

  User's Question: {{{question}}}`,
});

const marketPriceSearchFlow = ai.defineFlow(
  {
    name: 'marketPriceSearchFlow',
    inputSchema: MarketPriceSearchInputSchema,
    outputSchema: MarketPriceSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
