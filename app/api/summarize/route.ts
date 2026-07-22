import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONObject } from '../_utils';

const LENGTH_GUIDANCE: Record<string, string> = {
  Short: 'Very condensed — 2-3 sentences (or 2-3 bullets) total. Only the absolute essentials.',
  Medium: 'A short paragraph (or 4-5 bullets). Covers the main ideas without extra detail.',
  Detailed: 'A fuller multi-paragraph summary (or 6-8 bullets). Preserve important nuance, context, and supporting detail.',
};

const FORMAT_GUIDANCE: Record<string, string> = {
  Bullets: 'Write the summary as concise bullet points.',
  Paragraph: 'Write the summary as flowing prose paragraph(s) — no bullet points.',
};

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { text, length, format } = await request.json();

    if (!text?.trim()) return Response.json({ error: 'Text is required' }, { status: 400 });

    const lengthKey = LENGTH_GUIDANCE[length] ? length : 'Medium';
    const formatKey = FORMAT_GUIDANCE[format] ? format : 'Bullets';

    const systemPrompt = `You are an expert summarizer. The user will paste some text — it could be an article, an email thread, a meeting transcript, a long message, a document excerpt, or anything else. Your job is to produce a faithful, accurate summary.

Rules:
• Never hallucinate or add facts, numbers, names, or claims that are not present in the source text.
• Stay neutral and preserve the original meaning and intent — don't editorialise.
• Length: ${LENGTH_GUIDANCE[lengthKey]}
• Format: ${FORMAT_GUIDANCE[formatKey]}
• If format is Bullets, the "summary" field must be a single string with each bullet point on its own line, separated by "\\n" (no leading dashes or bullet characters, just the plain text of each point, one per line).
• If format is Paragraph, the "summary" field must be a single string of flowing prose (no line breaks needed).
• Also extract 3-5 standalone key points/takeaways as a separate array, regardless of format.
• Also write a single one-sentence TL;DR that captures the core message.
• Optionally include a short "wordCountReduction" string like "Reduced from ~450 to ~60 words" if you can estimate it meaningfully — otherwise return an empty string for it.

Return ONLY valid JSON, no markdown, no explanation outside the JSON:
{
  "tldr": "<one sentence>",
  "summary": "<the main summary as a single string, per the format rules above>",
  "keyPoints": ["<point 1>", "<point 2>", "<point 3>"],
  "wordCountReduction": "<short string, or empty string if not meaningful>"
}`;

    const userPrompt = `Summarize the following text.

Length: ${lengthKey}
Format: ${formatKey}

Text:
"""
${text.trim()}
"""`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1600,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';
    const result = parseJSONObject(raw);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
