import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONObject } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { notes, meetingType } = await request.json();

    if (!notes?.trim()) return Response.json({ error: 'Notes are required' }, { status: 400 });

    const system = `You are an expert executive assistant who turns raw, messy meeting notes into clean, professional meeting minutes. You are precise and never invent facts, decisions, or action items that aren't actually present in the notes.

Rules:
- Only include what was actually discussed — never fabricate topics, decisions, or action items not present in the notes
- Extract clear action items. For each, infer an owner and a due date/timeframe ONLY if it's inferable from the notes — if no owner or date is mentioned for an item, leave that field as an empty string rather than guessing
- Extract key decisions made, kept separate from general discussion points
- Write a short, professional overall summary paragraph
- Clean up typos, filler, and stream-of-consciousness phrasing into clear, professional language, but don't change the meaning

Return ONLY valid JSON — no markdown fences, no text outside the JSON:
{
  "summary": "<2-3 sentence overview of the meeting>",
  "discussionPoints": ["<topic discussed>", "..."],
  "decisions": ["<decision made>", "..."],
  "actionItems": [
    { "task": "<what needs to be done>", "owner": "<name or empty string>", "due": "<timeframe/date or empty string>" }
  ]
}`;

    const user = `Meeting type: ${meetingType || 'General'}

Raw meeting notes:
"""
${notes.trim()}
"""

Produce clean, structured meeting minutes from these notes, formatted appropriately for a "${meetingType || 'General'}" meeting.`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 2000,
      temperature: 0.4,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const result = parseJSONObject(text);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
