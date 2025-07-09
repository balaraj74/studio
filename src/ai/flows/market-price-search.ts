'use server';

/**
 * @fileOverview An AI agent that answers questions about market prices based on provided data.
 *
 * - marketPriceSearch - A function that handles the market price query.
 * - MarketPriceSearchInput - The input type for the marketPriceSearch function.
 * - MarketPriceSearchOutput - The return type for the marketPriceSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketPriceSchemaForZod = z.object({
    crop: z.string(),
    region: z.string(),
    price: z.number(),
    change: z.number(),
});

const MarketPriceSearchInputSchema = z.object({
  question: z.string().describe('The user\'s question about crop prices.'),
  prices: z.array(MarketPriceSchemaForZod).describe('The list of current market prices.'),
});
export type MarketPriceSearchInput = z.infer<typeof MarketPriceSearchInputSchema>;

const MarketPriceSearchOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type MarketPriceSearchOutput = z.infer<typeof MarketPriceSearchOutputSchema>;

export async function marketPriceSearch(input: MarketPriceSearchInput): Promise<MarketPriceSearchOutput> {
  return marketPriceSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketPriceSearchPrompt',
  input: {schema: MarketPriceSearchInputSchema},
  output: {schema: MarketPriceSearchOutputSchema},
  prompt: `You are an expert agricultural market analyst. Your task is to answer the user's question about crop prices based *only* on the provided market data.
  
  Do not use any external knowledge or make up information. If the answer cannot be found in the provided data, state that clearly.
  
  Provide a concise, helpful answer in plain language.

  Market Data (JSON format):
  {{{json prices}}}

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
