// This file initializes the Google AI SDK and provides utility functions.
// It's a server-side module, not a Server Action entry point itself.
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialisierung mit Umgebungsvariable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Modelle direkt exportieren (keine Genkit-Models nötig)
export const geminiPro = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.9,
    topP: 1,
  },
});

// Hilfsfunktion für Texterstellung
export async function generateText(prompt: string): Promise<string> {
  try {
    const result = await geminiPro.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI-Fehler:', error);
    throw new Error('Generierung fehlgeschlagen');
  }
}
