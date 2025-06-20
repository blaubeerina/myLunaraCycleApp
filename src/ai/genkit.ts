
'use server';
import { genkit } from 'genkit';
import { googleAI, geminiPro } from '@google-ai/genkit'; // Using Google AI plugin for Genkit 1.x

// Initialize Genkit with the defined configuration
export const ai = genkit({
  plugins: [
    googleAI(), // The API key will be automatically sourced from GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variables
  ],
  // For Genkit 1.x, logLevel and enableExperimentalTelemetry are typically configured
  // via environment variables (e.g., GENKIT_LOG_LEVEL) or dedicated telemetry plugins.
});

// You can also define models to be used globally or by specific flows
// geminiPro from @google-ai/genkit is a string model ID e.g. "gemini-pro"
export const defaultModel = gem