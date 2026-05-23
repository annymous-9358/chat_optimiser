import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { receivedMessage, relationship, context } = await request.json();

    if (!receivedMessage?.trim()) return Response.json({ error: 'Message is required' }, { status: 400 });
    if (!relationship) return Response.json({ error: 'Relationship is required' }, { status: 400 });

    const systemPrompt = `You write smart, natural reply suggestions. Sound like a real human — not a bot.

AVOID: "I hope this finds you well", "reaching out", "going forward", "as per", "kindly", "please don't hesitate".
USE: Contractions, natural phrasing, varied length.

Generate 3 replies, each taking a genuinely different angle:
1. Positive / enthusiastic / accepting
2. Neutral / measured / acknowledging
3. Declining / redirecting / setting a boundary (politely but clearly)

Keep replies concise and real. Return ONLY a JSON array: ["reply1", "reply2", "reply3"]`;

    const userPrompt = `I got this from my ${relationship}:
"${receivedMessage.trim()}"
${context?.trim() ? `\nExtra context: ${context.trim()}` : ''}

Write 3 different replies I could send back.`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.85,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (!arrayMatch) throw new Error('Could not parse response');

    const replies: string[] = JSON.parse(arrayMatch[0]);
    if (!Array.isArray(replies) || replies.length === 0) throw new Error('Invalid replies');

    return Response.json({ replies: replies.slice(0, 3) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
