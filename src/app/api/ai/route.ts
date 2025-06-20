
import { generateText } from '@/ai/server-ai';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string.' }, { status: 400 });
    }

    const resultText = await generateText(prompt);
    return NextResponse.json({ text: resultText });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Failed to process AI request.' }, { status: 500 });
  }
}
