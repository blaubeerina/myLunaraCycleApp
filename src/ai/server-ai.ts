
'use server';
import { aiClient } from '@/lib/google-ai-core';

export async function generateText(prompt: string): Promise<string> {
  // aiClient.generateText already has try/catch, so we can directly return its promise
  return aiClient.generateText(prompt);
}
