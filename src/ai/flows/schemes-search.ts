'use server';

/**
 * @fileOverview An AI agent that finds relevant government schemes for farmers.
 *
 * - searchSchemes - A function that handles the scheme search query.
 * - SearchSchemesInput - The input type for the searchSchemes function.
 * - SearchSchemesOutput - The return type for the searchSchemes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchSchemesInputSchema = z.object({
  query: z.string().describe("The user's query about government schemes, which could include crop, state, or other keywords."),
});
export type SearchSchemesInput = z.infer<typeof SearchSchemesInputSchema>;

const SchemeSchema = z.object({
  name: z.string().describe("The official name of the scheme."),
  description: z.string().describe("A brief summary of the scheme's purpose and benefits."),
  eligibility: z.string().describe("Who is eligible for this scheme."),
  link: z.string().describe("An official URL for more information, if available. Should be a valid URL, or '#' if not found."),
});

const SearchSchemesOutputSchema = z.object({
  schemes: z.array(SchemeSchema).describe("A list of relevant government schemes found."),
  message: z.string().describe("A friendly introductory message to present to the user before listing the schemes."),
});
export type SearchSchemesOutput = z.infer<typeof SearchSchemesOutputSchema>;

export async function searchSchemes(input: SearchSchemesInput): Promise<SearchSchemesOutput> {
  return searchSchemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchSchemesPrompt',
  input: { schema: SearchSchemesInputSchema },
  output: { schema: SearchSchemesOutputSchema },
  prompt: `You are an expert on agricultural policies and government schemes for farmers in India.
  
  Your task is to find and summarize relevant government schemes based on the user's query.
  
  Analyze the user's query: "{{{query}}}"
  
  Find the most relevant central or state-level schemes. For each scheme, provide its name, a brief description, key eligibility criteria, and a link if you can find one. If a link is not available, return '#' as the link value.
  
  Present the information clearly. Start with a friendly message to the user summarizing what you found.`,
});

const searchSchemesFlow = ai.defineFlow(
  {
    name: 'searchSchemesFlow',
    inputSchema: SearchSchemesInputSchema,
    outputSchema: SearchSchemesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
