import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONObject } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { text, targetLang, sourceLang, formality } = await request.json();

    if (!text?.trim()) return Response.json({ error: 'Text is required' }, { status: 400 });
    if (!targetLang?.trim()) return Response.json({ error: 'Target language is required' }, { status: 400 });

    const sourceInstruction = sourceLang?.trim()
      ? `The source language is ${sourceLang.trim()}.`
      : 'Auto-detect the source language from the text — do not assume it.';

    const formalityInstruction = formality?.trim()
      ? `Bias the register of the translation toward ${formality.trim()} — ${
          formality.trim() === 'Formal'
            ? 'polite, respectful, and professional phrasing'
            : formality.trim() === 'Casual'
            ? 'relaxed, everyday, conversational phrasing'
            : 'a neutral, natural register, neither overly formal nor overly casual'
        }.`
      : '';

    const system = `You are an expert human translator fluent in dozens of languages, known for translations that read as if they were originally written by a native speaker — never robotic or word-for-word.

${sourceInstruction}

Your job is to:
1. Identify the language the input text is actually written in
2. Translate it into ${targetLang.trim()} naturally and fluently, preserving the original tone, intent, idioms, and meaning — not a stiff literal translation
3. ${formalityInstruction || 'Match the register and tone of the original text.'}
4. Note any nuance, wordplay, idiom, or cultural reference that doesn't translate perfectly, if relevant

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
{
  "translation": "<the natural, fluent translation>",
  "detectedLanguage": "<the language the input text was actually written in>",
  "notes": "<one short sentence on any nuance/ambiguity lost or a cultural note, or an empty string if nothing notable>"
}`;

    const user = `Translate the following text into ${targetLang.trim()}:

"${text.trim()}"`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 1200,
      temperature: 0.5,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';
    const result = parseJSONObject(raw);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
