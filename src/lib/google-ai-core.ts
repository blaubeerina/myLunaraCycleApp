
import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!GOOGLE_AI_API_KEY) {
  // Log a warning in the server console during development/build if the key is missing
  console.warn("GOOGLE_AI_API_KEY is not set in environment variables. AI features will not work.");
  // For client-side, you might throw an error or handle it gracefully depending on usage.
  // Since this is core logic that might be imported by server-side code primarily,
  // a server-side warning is appropriate. If directly used by client in some way, ensure this doesn't break client.
}

// Initialize GenAI with a check for the API key
const genAI = GOOGLE_AI_API_KEY ? new GoogleGenerativeAI(GOOGLE_AI_API_KEY) : null;

export const aiClient = {
  getModel: () => {
    if (!genAI) {
      throw new Error("Google AI SDK not initialized. Check GOOGLE_AI_API_KEY.");
    }
    return genAI.getGenerativeModel({ model: 'gemini-pro' });
  },
  
  async generateText(prompt: string): Promise<string> {
    if (!genAI) {
      console.error("Google AI SDK not initialized. Cannot generate text.");
      // Fallback or re-throw, depending on desired behavior
      // For this app, a user-facing fallback is better than crashing.
      return "AI text generation is currently unavailable.";
    }
    try {
      const result = await this.getModel().generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Core Error generating text:', error);
      // Consider a more user-friendly error or a specific fallback
      return "An error occurred while generating the affirmation.";
    }
  }
};
