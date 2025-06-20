
// This file provides client-safe ways to interact with AI functionalities.

// Option 1: Using an API route for client components that cannot use server actions directly.
export const ai = {
  generate: async (prompt: string): Promise<{ text?: string; error?: string }> => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
        return { error: errorData.error || `API Error: ${response.status}` };
      }
      const data = await response.json();
      return { text: data.text };
    } catch (error) {
      console.error('Client AI fetch error:', error);
      return { error: 'Failed to connect to AI service.' };
    }
  }
};

// Option 2: Re-exporting server actions for use in Server Components or other server-side logic.
// This makes it convenient if you want a single import point for AI utilities.
export { generateText } from './server-ai';
