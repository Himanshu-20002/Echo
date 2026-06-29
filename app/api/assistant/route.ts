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

    const models = [
      'google/gemma-4-31b-it:free',
      'google/gemma-2-9b-it:free',
      'qwen/qwen-2.5-7b-instruct:free',
      'meta-llama/llama-3-8b-instruct:free'
    ];

    let response: Response | null = null;
    let lastErrorMsg = '';
    let responseStatus = 500;

    const parseOpenRouterError = (status: number, errText: string): string => {
      try {
        const parsed = JSON.parse(errText);
        const apiError = parsed?.error || parsed;
        let detail = '';
        if (apiError?.metadata?.raw) {
          detail = apiError.metadata.raw;
          try {
            const rawJson = JSON.parse(detail);
            if (rawJson?.error?.message) {
              detail = rawJson.error.message;
            }
          } catch (_) {}
        } else if (apiError?.message) {
          detail = apiError.message;
        }
        
        if (detail) {
          return detail;
        }
      } catch (_) {}
      return `API error (${status}): ${errText.slice(0, 200)}`;
    };

    for (const model of models) {
      try {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: formattedMessages.map((m: any) => ({ role: m.role, content: m.content })),
            temperature: 0.7,
            max_tokens: 250, // Increased limit as requested
          }),
        });

        responseStatus = response.status;

        if (response.ok) {
          break;
        }

        const errText = await response.text();
        lastErrorMsg = parseOpenRouterError(response.status, errText);
        console.warn(`Model ${model} failed with status ${response.status}: ${lastErrorMsg}. Trying fallback...`);
      } catch (err: any) {
        lastErrorMsg = err.message || 'Fetch failed';
        console.warn(`Model ${model} request threw error: ${lastErrorMsg}. Trying fallback...`);
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: lastErrorMsg || 'All OpenRouter models failed.' },
        { status: responseStatus }
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
