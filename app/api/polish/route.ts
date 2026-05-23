import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ACTIONS: Record<string, string> = {
  shorten: 'Make this message shorter and more concise. Keep the key point only. Cut filler but keep it natural — not choppy.',
  expand: 'Expand this message with more context, warmth, or detail. Keep the original tone, just flesh it out.',
  fix: 'Fix all grammar, spelling, and punctuation. Preserve the original wording and tone as much as possible.',
  punchy: 'Rewrite this to be punchier and more impactful. Shorter sentences, stronger verbs, zero filler.',
  emojis: "Add relevant emojis to make this more expressive. Place them naturally — don't overdo it.",
  strip: 'Remove every emoji from this message. Keep all other text exactly the same.',
};

export async function POST(request: NextRequest) {
  try {
    const { message, action } = await request.json();
    if (!message?.trim()) return Response.json({ error: 'Message is required' }, { status: 400 });
    if (!action || !ACTIONS[action]) return Response.json({ error: 'Invalid action' }, { status: 400 });

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You transform messages as instructed. Return ONLY the transformed message — no explanation, no quotes, no markdown.',
        },
        {
          role: 'user',
          content: `${ACTIONS[action]}\n\nMessage:\n${message.trim()}`,
        },
      ],
      max_tokens: 800,
      temperature: 0.6,
    });

    const result = response.choices[0]?.message?.content?.trim() ?? '';
    if (!result) throw new Error('Empty response');

    return Response.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
