import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONArray } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { recipient, occasion, relationship, personalNote, style } = await request.json();

    if (!occasion?.trim()) {
      return Response.json({ error: 'Occasion is required' }, { status: 400 });
    }

    const styleDescriptions: Record<string, string> = {
      heartfelt:   'warm, sincere, and emotionally genuine — says something that really means something',
      witty:       'clever and light-hearted — a little humour that fits the relationship perfectly',
      short:       'concise and impactful — every word earns its place, no fluff',
      poetic:      'lyrical and beautiful — slightly elevated language, imagery that resonates',
    };

    const styleDesc = styleDescriptions[style] ?? 'warm and genuine';
    const recipientLine = recipient?.trim() ? `The recipient's name is ${recipient.trim()}.` : 'No specific recipient name needed.';
    const relationshipLine = relationship?.trim() ? `My relationship with them: ${relationship.trim()}.` : '';
    const noteLine = personalNote?.trim() ? `Personal note / what I want to express: ${personalNote.trim()}` : '';

    const systemPrompt = `You are an expert at writing heartfelt, human gift card messages.

Rules:
• Write like a real, caring person — NOT a greeting card company
• Never use these clichés: "wishing you all the best", "may your day be filled with", "on your special day", "heartfelt congratulations", "warmest wishes"
• Each of the 3 versions must feel meaningfully different — different angle, different tone, different structure
• Match the requested style precisely
• Keep gift messages to 2-5 sentences maximum (unless the style is poetic, which can be slightly longer)
• Sound personal, not generic

Return ONLY a JSON array of 3 strings: ["message 1", "message 2", "message 3"]
No markdown, no code block, no explanation — just the array.`;

    const userPrompt = `Write 3 gift card / tag messages.

${recipientLine}
Occasion: ${occasion.trim()}
${relationshipLine}
Style: ${styleDesc}
${noteLine}

Return ["message 1", "message 2", "message 3"]`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.9,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const messages = parseJSONArray(text);

    return Response.json({ messages: messages.slice(0, 3) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
