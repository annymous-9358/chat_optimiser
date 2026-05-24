import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONArray, parseJSONObject } from '../_utils';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Trim chat to a reasonable window — keep the most recent messages
function trimChat(text: string, maxChars = 6000): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  // Take the last maxChars characters (most recent context)
  return '…[earlier messages trimmed]\n' + trimmed.slice(-maxChars);
}

// ── POST /api/chat-analyzer ───────────────────────────────────────────────────
// mode = 'analyze'  → deep relationship/tone analysis
// mode = 'generate' → craft a reply/message based on chat context
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatText, mode, purpose, tone, otherPerson } = body;

    if (!chatText?.trim()) {
      return Response.json({ error: 'Chat text is required' }, { status: 400 });
    }
    if (mode !== 'analyze' && mode !== 'generate') {
      return Response.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const chat = trimChat(chatText);

    if (mode === 'analyze') {
      const systemPrompt = `You are an expert in interpersonal communication and relationship dynamics.
Analyse the provided chat export and return a JSON object with this exact shape:

{
  "summary": "2-3 sentence overview of the overall conversation dynamic",
  "sentiment": "Positive | Neutral | Mixed | Tense | Cold",
  "sentimentScore": 0-100,
  "dynamics": ["short insight 1", "short insight 2", "short insight 3"],
  "communicationStyle": {
    "user": "how the user communicates (1-2 sentences)",
    "other": "how the other person communicates (1-2 sentences)"
  },
  "redFlags": ["any concerning patterns — omit key if none"],
  "strengths": ["positive communication patterns observed"],
  "suggestions": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "nextMessageIdea": "one natural opening line they could send next"
}

Be specific and observational — ground every point in the actual chat content. Do not be generic.
Return ONLY valid JSON. No markdown, no extra text.`;

      const userPrompt = `Analyse this chat export:\n\n${chat}`;

      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1200,
        temperature: 0.5,
      });

      const text = response.choices[0]?.message?.content?.trim() ?? '';
      const analysis = parseJSONObject(text);
      return Response.json({ analysis });
    }

    // mode === 'generate'
    if (!purpose?.trim()) {
      return Response.json({ error: 'Purpose is required for message generation' }, { status: 400 });
    }

    const toneDesc: Record<string, string> = {
      warm:         'warm, genuine and caring — feels personal',
      casual:       'relaxed and natural — like you actually text each other',
      professional: 'clear and respectful — measured and composed',
      playful:      'light-hearted and fun — a bit of humour or charm',
      apologetic:   'sincere and genuine — taking responsibility without over-explaining',
      assertive:    'direct and confident — clear about what you want or feel',
    };

    const systemPrompt = `You are an expert at crafting natural, human messages based on existing conversation context.
Using the chat history provided, write 3 different versions of a message.

Rules:
• Sound like the person already in this conversation — match their vocabulary, energy, and style
• Never use corporate/AI phrases ("I hope this finds you well", "reaching out", "as per", etc.)
• Use contractions naturally
• Make each version feel genuinely different — different structure, different angle
• Keep messages the right length for the context (not too long or too short)

Return ONLY a JSON array of 3 strings: ["message 1", "message 2", "message 3"]
No markdown, no explanation, nothing else.`;

    const selectedTone = toneDesc[tone] ?? 'natural and authentic';
    const otherPersonNote = otherPerson?.trim() ? `The other person's name is ${otherPerson.trim()}.` : '';

    const userPrompt = `Chat history for context:\n${chat}\n\n${otherPersonNote}\n\nWhat I want to say / purpose: ${purpose.trim()}\nTone: ${selectedTone}\n\nWrite 3 versions of the message I should send next.`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 800,
      temperature: 0.85,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const messages = parseJSONArray(text);

    return Response.json({ messages: messages.slice(0, 3) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
