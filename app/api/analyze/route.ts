import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message?.trim()) return Response.json({ error: 'Message is required' }, { status: 400 });

    const systemPrompt = `You analyze the tone and communication style of messages. Be honest and specific.

Return ONLY valid JSON in this exact shape:
{
  "primary": "one-word tone label (e.g. Casual, Assertive, Warm, Formal, Empathetic)",
  "scores": {
    "professional": 0-100,
    "casual": 0-100,
    "emotional": 0-100,
    "assertive": 0-100,
    "empathetic": 0-100,
    "formal": 0-100
  },
  "verdict": "2-3 sentences honestly describing the tone and how it might land",
  "tips": ["concrete tip 1", "concrete tip 2", "concrete tip 3"],
  "tags": ["tag1", "tag2", "tag3"]
}

Scores can overlap (a message can be both casual and emotional). Be accurate, not flattering.`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this message:\n\n"${message.trim()}"` },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse response');

    const analysis = JSON.parse(jsonMatch[0]);
    return Response.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
