import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is missing on the server.' },
        { status: 500 }
      );
    }

    const systemPrompt = {
      role: 'system',
      content: 'You are Nora, a caring, helpful, and friendly AI platform guide for the Echo digital sanctuary app. Your main goal is to teach users how they can use the Echo platform to find someone, make friends, chat in real-time, customize AI companions, and synchronise their moods. Keep your answers extremely concise (1-2 sentences), conversational, warm, and natural. Since the user will hear your response spoken aloud, avoid bullet points, markdown formatting, or emojis in your text.'
    };

    const formattedMessages = [systemPrompt, ...messages];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it:free',
        messages: formattedMessages.map((m: any) => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status} - ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ text: assistantMessage });
  } catch (error: any) {
    console.error('Assistant route handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
