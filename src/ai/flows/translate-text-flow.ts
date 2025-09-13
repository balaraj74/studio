
'use server';

/**
 * @fileOverview An AI flow to translate text to a target language.
 *
 * - translateText - A function that handles the translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe("The target language for translation, e.g., 'Kannada', 'Hindi'."),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async ({ text, targetLanguage }) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `Translate the following text into ${targetLanguage}. IMPORTANT: Respond with only the translated text, nothing else.

      Text to translate:
      """
      ${text}
      """
      `,
      output: {
        schema: TranslateTextOutputSchema,
      },
    });
    if (!output) {
      throw new Error('AI failed to generate a translation.');
    }
    return output;
  }
);
