import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { parseJSONObject } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { description, platform, specialization, behavior } = await request.json();

    if (!description?.trim()) return Response.json({ error: 'Description is required' }, { status: 400 });

    const platformGuides: Record<string, string> = {
      'Claude Code': 'Generate a SKILL.md frontmatter + body for a Claude Code skill agent. Format: YAML frontmatter with name, description, version fields, then markdown body with ## Trigger, ## Behavior, ## Output sections.',
      'Cursor': 'Generate a .cursorrules file content. Use plain text rules, one per line, starting with "Always", "Never", "When", etc. Also include a brief system prompt section.',
      'GitHub Copilot': 'Generate a .github/copilot-instructions.md content. Include context about the project, coding standards, and specific instructions for the AI.',
      'VS Code': 'Generate a VS Code chat participant configuration with a name, description, and detailed system prompt for the @agent mention.',
      'General / API': 'Generate a universal agent definition with a system prompt, capabilities list, and usage examples that works across any LLM API.',
    };

    const system = `You are an expert AI agent architect. You design precise, effective agent definitions that make AI assistants dramatically more useful for specific tasks.

Return ONLY valid JSON — no markdown fences, no text outside the JSON:
{
  "definition": "<the complete agent/skill file content, properly formatted for the target platform>",
  "filename": "<suggested filename, e.g. SKILL.md or .cursorrules>",
  "usage": "<1-2 sentences on how to install/use this agent>",
  "capabilities": ["<capability 1>", "<capability 2>", "<capability 3>", "<capability 4>"]
}`;

    const user = `Create a complete agent definition for the following:

Description: "${description.trim()}"
Target platform: ${platform || 'Claude Code'}
Specialization area: ${specialization || 'General coding assistant'}
Behavior style: ${behavior || 'Proactive — suggests improvements without being asked'}

Platform format guide:
${platformGuides[platform] || platformGuides['General / API']}

Requirements:
- Be very specific about what triggers the agent and what it should do
- Include concrete examples of inputs/outputs where helpful
- Make the agent's personality and communication style explicit
- Add guardrails (what it should NOT do)
- The definition should be immediately copy-paste usable`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 2000,
      temperature: 0.65,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const result = parseJSONObject(text);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
