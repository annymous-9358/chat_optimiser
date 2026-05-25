import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONObject } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const {
      purpose,
      recipientName,
      recipientRole,
      senderName,
      keyPoints,
      tone,
      length,
    } = await request.json();

    if (!purpose?.trim()) {
      return Response.json({ error: 'Email purpose is required' }, { status: 400 });
    }

    const toneGuide: Record<string, string> = {
      professional: 'formal, polished, business-appropriate — respectful and precise',
      friendly:     'warm and approachable — professional but human, like a colleague you genuinely like',
      casual:       'relaxed and conversational — reads like a real person, no stiffness',
      persuasive:   'compelling and confident — builds a case, addresses objections, motivates action',
      urgent:       'clear urgency without panic — direct, concise, makes the ask obvious',
      empathetic:   'warm and understanding — acknowledges the reader\'s perspective, genuinely caring',
      assertive:    'direct and confident — clear expectations, no hedging',
      apologetic:   'sincere and accountable — owns the situation without over-explaining',
    };

    const lengthGuide: Record<string, string> = {
      brief:    '2-3 short paragraphs. Every word earns its place. No filler.',
      standard: '3-4 paragraphs. Clear opening, body, and close.',
      detailed: '5-6 paragraphs. Thorough explanation with context, reasoning, and a strong close.',
    };

    const recipientLine = [recipientName?.trim(), recipientRole?.trim()].filter(Boolean).join(', ');
    const senderLine    = senderName?.trim() ? `Sender: ${senderName.trim()}` : '';
    const pointsLine    = keyPoints?.trim()  ? `Key points to include:\n${keyPoints.trim()}` : '';

    const systemPrompt = `You write professional, human emails that get results.

Rules:
• Sound like a real, intelligent person — NOT a corporate template
• NEVER use: "I hope this email finds you well", "I am reaching out", "as per", "kindly", "please don't hesitate", "going forward", "touch base", "synergy"
• Use contractions naturally (I'm, I'd, I've, we'll)
• Subject line: max 60 chars, specific, no spam words
• Opening: get to the point within the first sentence — no hollow warm-up
• Closing: real and purposeful — clear next step or call to action
• Tone: ${toneGuide[tone] ?? toneGuide.professional}
• Length: ${lengthGuide[length] ?? lengthGuide.standard}
• If a sender name is given, sign off with it

Return ONLY valid JSON in this exact shape — no markdown, no code block:
{
  "subject": "the email subject line",
  "body": "the full email body (use \\n for line breaks between paragraphs)"
}`;

    const userPrompt = `Write a complete email.

Purpose: ${purpose.trim()}
${recipientLine ? `To: ${recipientLine}` : ''}
${senderLine}
${pointsLine}

Return {"subject": "...", "body": "..."}`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.75,
    });

    const text   = response.choices[0]?.message?.content?.trim() ?? '';
    const result = parseJSONObject(text) as { subject?: string; body?: string };

    if (!result.subject || !result.body) {
      throw new Error('Could not parse email from response');
    }

    return Response.json({ subject: result.subject, body: result.body });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
