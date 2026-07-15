import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONObject } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { prompt, purpose, platform, style } = await request.json();

    if (!prompt?.trim()) return Response.json({ error: 'Prompt is required' }, { status: 400 });

    const system = `You are a world-class prompt engineer. Your job is to take a rough user prompt and rewrite it to get dramatically better results from an AI. You understand what each model/platform responds best to.

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
{
  "enhanced": "<the fully rewritten, optimised prompt>",
  "explanation": "<2-3 sentences on what you changed and why>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

    const user = `Rewrite this prompt to be maximally effective.

Original prompt: "${prompt.trim()}"
Purpose: ${purpose || 'General'}
Target platform / model: ${platform || 'General LLM'}
Desired output style: ${style || 'Detailed and structured'}

Rules:
- Keep the intent 100% faithful to the original
- Add role/context framing if it helps
- Be explicit about format, length, and constraints the user probably wants
- Remove vagueness and ambiguity
- For coding platforms (Cursor, Copilot) use technical precision; for Claude use nuanced reasoning framing
- The enhanced prompt should feel like it was written by someone who does this professionally`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const result = parseJSONObject(text);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
