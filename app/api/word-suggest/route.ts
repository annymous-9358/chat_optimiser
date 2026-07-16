import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONObject } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { description, category, outputLang } = await request.json();

    if (!description?.trim()) return Response.json({ error: 'Description is required' }, { status: 400 });

    const langInstruction = outputLang === 'Hindi'
      ? 'Suggest words/phrases primarily in Hindi (Devanagari script). Include the romanised transliteration.'
      : outputLang === 'Both'
      ? 'Suggest a mix of English and Hindi words/phrases. For Hindi words, include the Devanagari script AND romanised transliteration.'
      : 'Suggest words/phrases in English.';

    const system = `You are an expert linguist, lexicographer, and polyglot who specialises in helping people find the exact word or phrase they are looking for. You understand English, Hindi, Hinglish, and many other languages.

The user will describe a concept, feeling, scene, person, or moment — possibly in English, Hindi, Hinglish, or a mix. Your job is to:
1. Understand what they are describing (regardless of the input language)
2. ${langInstruction}
3. Suggest 4–6 words or phrases that best capture their description
4. For each word, provide meaning, an example sentence, and a nuance note

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
{
  "interpretation": "<one sentence: your understanding of what the user is describing, in English>",
  "words": [
    {
      "word": "<the word or phrase>",
      "pronunciation": "<phonetic guide, optional>",
      "language": "<English | Hindi | Sanskrit | Urdu | Japanese | etc.>",
      "meaning": "<clear, concise definition>",
      "example": "<example sentence using the word naturally>",
      "nuance": "<when to use it, what makes it special, subtle differences from similar words>"
    }
  ]
}`;

    const user = `Help me find the right word.

Description: "${description.trim()}"
${category ? `Category hint: ${category}` : ''}
Output language preference: ${outputLang}

Understand my description and suggest the most fitting words.`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 1600,
      temperature: 0.6,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const result = parseJSONObject(text);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
