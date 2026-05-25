import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONArray } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { body, tone, purpose } = await request.json();

    if (!body?.trim()) return Response.json({ error: 'Email body is required' }, { status: 400 });

    const toneGuide: Record<string, string> = {
      professional: 'formal and business-appropriate',
      casual:       'relaxed and friendly',
      urgent:       'conveys urgency without being alarmist',
      curious:      'piques curiosity, makes the reader want to open it',
      friendly:     'warm and approachable',
    };

    const selectedTone = toneGuide[tone] ?? toneGuide.professional;
    const purposeLine  = purpose?.trim() ? `Email purpose: ${purpose.trim()}` : '';

    const systemPrompt = `You write compelling email subject lines that get emails opened.

Rules:
• Be specific — generic subjects get ignored
• Max 60 characters (ideal 40–50)
• No spam trigger words (FREE, URGENT!!!, Click here)
• Each of the 5 must use a completely different angle/strategy:
  1. Direct + clear (what the email is about)
  2. Question (makes reader curious)
  3. Benefit-focused (what's in it for them)
  4. Personable / conversational
  5. Intriguing / open loop (hints at something without giving it away)
• Tone: ${selectedTone}
• No clickbait — every subject must be honest about the email content

Return ONLY a JSON array of 5 strings: ["subject 1", "subject 2", "subject 3", "subject 4", "subject 5"]
No markdown, no explanation, no labels.`;

    const userPrompt = `Write 5 subject lines for this email:

${purposeLine}

Email body:
${body.trim().slice(0, 2000)}

Return ["subject 1", "subject 2", "subject 3", "subject 4", "subject 5"]`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 400,
      temperature: 0.85,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const subjects = parseJSONArray(text);

    return Response.json({ subjects: subjects.slice(0, 5) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
