
'use server';

import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { geminiPro } from '@genkit-ai/googleai/models';

// Initialize Genkit with Google AI
export const ai = configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY, // Set in .env or .env.local
    })
  ],
  logLevel: 'debug'
});

// Export the model for direct use
export const textModel = geminiPro;
