import {config} from 'dotenv';
config();

import {genkit} from 'genkit';
import {googleAI} from '@gen-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
