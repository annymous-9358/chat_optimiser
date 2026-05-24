import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONArray } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { occasion, recipient, relationship, context, length, tone, customOccasion } = await request.json();

    const effectiveOccasion = occasion === 'Custom' ? customOccasion : occasion;
    if (!effectiveOccasion?.trim()) {
      return Response.json({ error: 'Occasion is required' }, { status: 400 });
    }

    const lengthGuide: Record<string, string> = {
      short:   '2–4 sentences. Punchy and impactful. No filler.',
      message: '2–3 short paragraphs. Warm and personal, easy to read.',
      letter:  '4–6 paragraphs. Thoughtful and complete — could be read aloud as a speech, or sent as a formal letter.',
    };

    const toneGuide: Record<string, string> = {
      warm:         'warm, genuine, and emotionally present — the kind of thing a caring person would actually say',
      professional: 'respectful, composed, and appropriate for a work setting — sincere but measured',
      casual:       "relaxed and natural — how you'd speak to someone you're comfortable with, no performance",
      heartfelt:    'deeply personal and sincere — speaks to the heart without being clichéd',
      humorous:     'light-hearted and witty — earns a smile without undermining the occasion',
    };

    const recipientLine  = recipient?.trim()    ? `Recipient: ${recipient.trim()}` : '';
    const relLine        = relationship?.trim() ? `Relationship: ${relationship.trim()}` : '';
    const contextLine    = context?.trim()      ? `Key things to include / personal context: ${context.trim()}` : '';
    const lengthDesc     = lengthGuide[length]  ?? lengthGuide.message;
    const toneDesc       = toneGuide[tone]      ?? toneGuide.warm;

    const systemPrompt = `You write meaningful, human occasion messages — the kind that actually land.

Rules:
• Sound like a real person, not a corporate email or greeting card
• NEVER use: "wishing you all the best", "on this special occasion", "may your day be filled with", "I am reaching out", "heartfelt congratulations", "warmest regards" (as the opener)
• Each of the 3 versions must feel genuinely different — different structure, different emotional angle
• ${lengthDesc}
• Tone: ${toneDesc}
• If personal context is given, weave it naturally into the message
• Use contractions naturally
• No hollow closings — end on something real

Return ONLY a JSON array of 3 strings: ["message 1", "message 2", "message 3"]
No markdown, no code block, no labels, no explanation.`;

    const userPrompt = `Write 3 versions of an occasion message.

Occasion: ${effectiveOccasion}
${recipientLine}
${relLine}
${contextLine}

Return ["version 1", "version 2", "version 3"]`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.88,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const messages = parseJSONArray(text);

    return Response.json({ messages: messages.slice(0, 3) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
