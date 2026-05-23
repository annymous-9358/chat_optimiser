import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Task = { text: string; hours: string };

function fmtTaskLine(t: Task, isToday = false): string {
  const hrs = parseFloat(t.hours);
  const hrsLabel = hrs > 0 ? (isToday ? ` (${hrs}h est.)` : ` (${hrs}h)`) : '';
  return `- ${t.text}${hrsLabel}`;
}

const FORMAT_PROMPTS: Record<string, string> = {
  standard: `You are formatting a daily standup (DSM) for a professional tech team.

TWO jobs:
1. REPHRASE raw task notes into clean professional language using strong action verbs (Implemented, Resolved, Reviewed, Deployed, Fixed, Completed, etc.)
2. FORMAT as a standard DSM — preserve every time allocation exactly as given

Rules:
- One bullet per task, starting with a capital action verb
- Past tense for Yesterday, present/future for Today
- Keep time allocations exactly as provided — show in parentheses at end of each bullet
- Rephrase messy notes but NEVER change or invent hours

Output (plain text, no markdown asterisks):

📅 {date}{project}

✅ Yesterday
• {rephrased task} ({Xh})
• {rephrased task} ({Xh})

🎯 Today
• {rephrased task} ({Xh est.})

🚧 Blockers
{rephrased blockers or "None"}

⏱ Total Logged: {sum of yesterday hours}h`,

  detailed: `You are writing a detailed DSM entry for a company portal.

TWO jobs:
1. REPHRASE raw notes into formal full sentences with context
2. FORMAT in a portal-ready style — preserve time allocations exactly

Rules:
- Full sentences, explain what and why when possible
- Include time in brackets: [2h] or [1.5h est.]
- Professional style for HR/management portals

Output (plain text):

DATE: {date}
PROJECT/TEAM: {project}

YESTERDAY — COMPLETED:
- {detailed rephrased task} [{Xh}]

TODAY — PLANNED:
- {detailed rephrased task} [{Xh} est.]

BLOCKERS / DEPENDENCIES:
{rephrased blockers or "No blockers at this time."}

TOTAL HOURS LOGGED: {sum of yesterday hours}h`,

  concise: `You write ultra-brief standups for Slack or short portal fields.

TWO jobs:
1. REPHRASE to concise professional keywords
2. FORMAT minimally — include hours in brackets

Output:

📅 {date}{project}
✅ {task [Xh]}, {task [Xh]}
🎯 {task [Xh est.]}, {task [Xh est.]}
🚧 {blockers or "None"}
⏱ Total: {sum of yesterday hours}h`,
};

export async function POST(request: NextRequest) {
  try {
    const { yesterdayTasks, todayTasks, blockers, project, dateLabel, format = 'standard' } = await request.json();

    const yTasks = (yesterdayTasks as Task[]).filter((t) => t.text?.trim());
    const tTasks = (todayTasks as Task[]).filter((t) => t.text?.trim());

    if (!yTasks.length && !tTasks.length) {
      return Response.json({ error: 'Add at least one task' }, { status: 400 });
    }

    const systemPrompt = FORMAT_PROMPTS[format] ?? FORMAT_PROMPTS.standard;

    const userPrompt = `Rephrase and format my standup for ${dateLabel}${project ? ` — ${project}` : ''}:

Yesterday completed (with actual hours):
${yTasks.map((t) => fmtTaskLine(t)).join('\n') || '- Nothing to report'}

Today planning (with estimated hours):
${tTasks.map((t) => fmtTaskLine(t, true)).join('\n') || '- Nothing to report'}

Blockers: ${blockers?.trim() || 'None'}`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 700,
      temperature: 0.4,
    });

    const formatted = response.choices[0]?.message?.content?.trim() ?? '';
    if (!formatted) throw new Error('Empty response');

    return Response.json({ formatted });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
