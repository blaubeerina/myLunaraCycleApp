
import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with Google AI
export const ai = configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    })
  ],
  // logLevel: 'debug', // Removed as per Genkit 1.x guidance
});

// Export the model identifier string for direct use
export const textModel = 'googleai/gemini-pro';
