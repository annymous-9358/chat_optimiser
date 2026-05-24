import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONArray } from '../_utils';

const TONE_DESCRIPTIONS: Record<string, string> = {
  professional_formal: 'formal, polished business — structured and respectful, for executive emails or official correspondence',
  professional_conversational: 'professional but warm — approachable and real, like a colleague you actually like',
  professional_group: 'clear, inclusive team communication — no jargon, suitable for Slack or group announcements',
  love_romantic: 'romantic and tender — heartfelt and genuine, without being cheesy',
  friend_chat: 'how you actually text a close friend — real, casual, natural slang is totally fine',
  casual: 'relaxed and easy-going — like texting a peer, zero fluff or formality',
  empathetic: 'warm and emotionally intelligent — genuinely supportive, validates feelings',
  witty_humorous: 'light-hearted and clever — a bit of wit that makes them smile, not cringe',
  assertive: 'direct and confident — straight to the point, no hedging or filler',
  apologetic: 'sincere and real — takes responsibility without over-apologising or grovelling',
};

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { message, tone } = await request.json();

    if (!message?.trim()) return Response.json({ error: 'Message is required' }, { status: 400 });
    if (!tone || !TONE_DESCRIPTIONS[tone]) return Response.json({ error: 'Invalid tone' }, { status: 400 });

    const systemPrompt = `You're helping a real person rephrase their message. Write like a human, not a corporate bot.

NEVER use these AI/corporate phrases:
• "I hope this finds you well" / "I hope you're doing well"
• "I wanted to reach out" / "reaching out to you"
• "As per our conversation" / "as per your request"
• "Please don't hesitate to" / "feel free to reach out"
• "Going forward" / "moving forward" / "at this point in time"
• "I am writing to inform you" / "I am reaching out"
• "Kindly" / "please be advised" / "please note that"
• Hollow sign-offs like "Warm regards" in casual messages

DO:
• Use contractions naturally (I'm, you're, it's, we'll, I'd)
• Vary sentence length — mix short punchy lines with longer ones
• Make each of the 3 versions feel genuinely different in structure and approach
• Sound like something a smart, real person would actually send
• Nail the exact tone requested

Return ONLY a JSON array of 3 strings. No markdown, no explanation, nothing else.`;

    const userPrompt = `Rephrase this 3 different ways with a ${TONE_DESCRIPTIONS[tone]} tone:

"${message.trim()}"

Format: ["version 1", "version 2", "version 3"]`;

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
    const suggestions = parseJSONArray(text);

    return Response.json({ suggestions: suggestions.slice(0, 3) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
