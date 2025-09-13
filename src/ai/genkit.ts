import {config} from 'dotenv';
config();

import {genkit} from 'genkit';
import {googleAI} from '@genkitorg/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  enableTracingAndMetrics: true,
});
