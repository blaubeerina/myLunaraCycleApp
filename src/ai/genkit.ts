// This file re-exports AI model and utility functions
// It should not have 'use server;' if it exports non-async functions/objects.
export { geminiPro, generateText } from '@/lib/google-ai';
