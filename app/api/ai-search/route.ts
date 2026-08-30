import { NextRequest, NextResponse } from 'next/server';
import { handleAiSearch, ChatMessage } from '@/lib/aiSearch';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = body.messages as ChatMessage[];

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          reply: 'Please provide at least one message describing what you lost.',
          action: 'no_input_understood',
        },
        { status: 400 }
      );
    }

    const response = await handleAiSearch(messages);
    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Error in /api/ai-search:', err);
    return NextResponse.json({
      reply: 'Having trouble right now — try again in a moment.',
      action: 'no_input_understood',
    });
  }
}
