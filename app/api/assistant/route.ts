import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';

const TOOL_KNOWLEDGE = `
You have direct access to all 16 Convey tools. Here's what each does:

REWRITE & TONE:
- rephrase: Rewrites a message in 3 different ways for a chosen tone (professional, casual, romantic, witty, assertive, apologetic, etc.)
- tone-checker: Analyzes text and scores it across 6 tone dimensions (professional, casual, emotional, assertive, empathetic, formal) with a verdict and improvement tips
- polish: One-click transforms: shorten, expand, fix grammar, make punchier, add/strip emojis

REPLIES & CONVERSATIONS:
- quick-reply: Takes a received message + relationship context and generates 3 reply options (agreeable, neutral, declining)
- chat-insights: Analyzes WhatsApp/Instagram chat exports for sentiment, dynamics, communication patterns; or drafts a reply

EMAIL:
- email-subject: Takes an email body and generates 5 subject line options across different angles (direct, question, benefit, conversational, intriguing)
- email-writer: Generates a complete email (subject + body) from a short description, with tone and length control

OCCASIONS & GIFTS:
- occasions: Generates occasion messages for birthdays, farewells, promotions, condolences, etc.
- gift-message: Writes gift card notes tailored to recipient, occasion, relationship, and style (heartfelt, witty, short, poetic)

WORK & PRODUCTIVITY:
- standup: Formats daily standup updates from a task list; tracks hours and exports timesheets
- summarize: Summarizes long text (articles, emails, transcripts) with TL;DR and key points
- meeting-minutes: Turns raw meeting notes into structured minutes with decisions and action items

AI & PROMPTS:
- prompt-boost: Rewrites rough AI prompts into optimized ones for Claude, ChatGPT, Gemini, Cursor, etc.
- agent-builder: Generates complete AI agent definition files from plain descriptions
- word-finder: Finds the exact word for a feeling or concept (supports English, Hindi, Hinglish)

LANGUAGE:
- translate: Translates text into 14+ languages naturally, preserving tone, with optional formality control
`.trim();

const SYSTEM_PROMPT = `You are Convey's AI assistant — a smart, context-aware helper embedded in the Convey writing tools platform.

${TOOL_KNOWLEDGE}

YOUR BEHAVIOR:
1. Understand what the user actually needs, not just what they literally say
2. If the task maps to one of the 16 tools above, ACTUALLY SOLVE IT DIRECTLY in your response — give them the real output, not just describe the tool
3. Keep responses focused and practical. Do the work. Don't waffle
4. If a file was uploaded, use its content as the working material
5. After solving a task directly, you MAY suggest the relevant tool at the very end if it would help them do more — but only if relevant

TOOL SUGGESTION FORMAT (use only when relevant, as the last line):
[SUGGEST_TOOL:slug|Tool Name]

Example: [SUGGEST_TOOL:rephrase|Rephrase]

IMPORTANT:
- Never make up tool capabilities that don't exist
- Never route to a tool if you can just solve it here
- Be direct, useful, human — not vague or corporate
- If the user uploads a document, read it carefully and work with its content
- Match the language/tone context the user is in`;

export async function POST(req: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { messages, fileContent } = await req.json() as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      fileContent?: string;
    };

    if (!messages?.length) {
      return Response.json({ error: 'Messages are required' }, { status: 400 });
    }

    // If there's a file, prepend its content to the last user message
    const processedMessages = fileContent
      ? messages.map((m, i) =>
          i === messages.length - 1 && m.role === 'user'
            ? { ...m, content: `[Uploaded file content]\n${fileContent}\n\n[User's request]\n${m.content}` }
            : m
        )
      : messages;

    const stream = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...processedMessages,
      ],
      max_tokens: 2048,
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
