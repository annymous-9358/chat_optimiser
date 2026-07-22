export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolMeta {
  slug: string;
  tab: string;
  label: string;
  tagline: string;
  metaDescription: string;
  description: string;
  icon: string;
  keywords: string[];
  bullets: string[];
  faq: ToolFaq[];
}

export const TOOLS: ToolMeta[] = [
  {
    slug: "rephrase",
    tab: "rephrase",
    label: "Rephrase",
    tagline: "Say it in the right tone, every time",
    metaDescription: "Convey's Rephrase tool rewrites any message into 3 tone-matched versions — professional, casual, romantic, and more — so you always sound right.",
    description: "Rephrase takes any message you paste in and rewrites it three different ways in a tone you pick — from Pro Formal to Romantic to Assertive. Each version takes a genuinely different approach (Direct, Natural, Creative), so you can pick the one that fits the moment instead of staring at a blank reply box.",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    keywords: ["rephrase message tool", "AI tone rewriter", "change tone of text online", "sound more professional AI", "rewrite text in different tone", "AI message rephraser", "how to sound less blunt in texts"],
    bullets: [
      "Pick from 10 tones: professional, casual, romantic, witty, assertive, and more",
      "Get 3 distinct rewrites per message — Direct, Natural, Creative",
      "Avoids stiff AI-sounding phrases, keeps it human",
      "Copy any version instantly with one click",
    ],
    faq: [
      { q: "How many tone options does Rephrase support?", a: "Ten, ranging from Pro Formal and Team/Group to Friend, Romantic, Witty, and Apologetic." },
      { q: "Why do I get three different rewrites?", a: "Each request returns a Direct, Natural, and Creative take on the same message so you can choose the phrasing that feels most like you." },
      { q: "Is there a character limit?", a: "Yes, messages up to 1,000 characters can be rephrased at once." },
    ],
  },
  {
    slug: "quick-reply",
    tab: "quickreply",
    label: "Quick Reply",
    tagline: "Never stare at a blank reply box again",
    metaDescription: "Convey's Quick Reply generates three ready-to-send responses — agreeable, neutral, or declining — for any text, email, or DM you've received.",
    description: "Quick Reply takes a message someone sent you, along with who sent it and any extra context, and generates three complete reply options: one that agrees, one that's neutral, and one that politely declines. Pick the angle that fits and copy it straight into your chat.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    keywords: ["quick reply generator", "AI text reply generator", "how to reply to a message", "auto reply suggestions AI", "reply to boss email AI", "polite way to say no generator", "smart reply tool"],
    bullets: [
      "Generates 3 replies per message: agreeable, neutral, declining",
      "Tailors tone to your relationship — boss, friend, partner, client, family",
      "Optional context field for deadlines or prior conversation history",
      "One-click copy for any of the three replies",
    ],
    faq: [
      { q: "What relationships can I choose from?", a: "Boss, Colleague, Friend, Partner, Family, or Client — the reply's tone adapts to who you're responding to." },
      { q: "Can I add extra context, like a deadline?", a: "Yes, there's an optional context field where you can add details like an existing deadline or that you've already said no once." },
      { q: "Does it help me decline something politely?", a: "Yes, one of the three generated replies is always a declining/boundary-setting option alongside an agreeable and a neutral one." },
    ],
  },
  {
    slug: "tone-checker",
    tab: "analyzer",
    label: "Tone Check",
    tagline: "Know how your message actually lands",
    metaDescription: "Convey's Tone Checker analyzes any message and scores it across professional, casual, emotional, assertive, empathetic, and formal tone dimensions.",
    description: "Tone Checker analyzes a message you paste in and breaks down exactly how it reads — a primary tone label, a percentage score across six dimensions, a plain-language verdict on how it might land, and concrete tips to improve it.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    keywords: ["tone checker online", "check tone of email", "analyze message tone AI", "does my text sound rude checker", "email tone analyzer", "how does my message sound", "AI tone detector"],
    bullets: [
      "Scores messages across 6 tone dimensions with percentages",
      "Gives a primary tone label plus descriptive tags",
      "Writes a 2-3 sentence verdict on how the message will land",
      "Offers concrete tips to adjust the tone before you send",
    ],
    faq: [
      { q: "What tone dimensions does it measure?", a: "Professional, Casual, Emotional, Assertive, Empathetic, and Formal, each scored 0-100 and shown as a breakdown." },
      { q: "Will it tell me if my message sounds rude or cold?", a: "Yes, the verdict honestly describes how the message might come across, and the tips suggest specific ways to soften or sharpen it." },
      { q: "Does it just give a score, or actual advice?", a: "Both — you get score bars for a quick read plus written tips explaining what to change." },
    ],
  },
  {
    slug: "polish",
    tab: "polish",
    label: "Polish",
    tagline: "One click to shorten, fix, or sharpen any message",
    metaDescription: "Convey's Polish tool transforms any message in one click — shorten it, expand it, fix grammar, make it punchier, or add or strip emojis.",
    description: "Polish is a one-click message editor: paste in a message, then choose a transform — Shorten, Expand, Fix Grammar, Make Punchier, Add Emojis, or Strip Emojis — and get back a cleaned-up version instantly. Chain transforms by feeding the result back in as new input.",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    keywords: ["fix grammar online free", "shorten text AI", "make text punchier", "AI text editor", "remove emojis from text tool", "expand short message AI", "grammar and clarity checker"],
    bullets: [
      "6 one-click transforms: shorten, expand, fix grammar, punchier, add/strip emojis",
      "Preserves your original tone while fixing wording or length",
      "Chain transforms by reusing the result as new input",
      "Copy the polished result with one click",
    ],
    faq: [
      { q: "What transforms can Polish apply?", a: "Shorten, Expand, Fix Grammar, Make Punchier, Add Emojis, and Strip Emojis, each triggered with a single click." },
      { q: "Does Polish change the tone of my message?", a: "No, it preserves your original tone and wording as much as possible while applying the chosen transform." },
      { q: "Can I apply more than one transform to the same message?", a: "Yes, you can send the result back in as the new input and run another transform on it." },
    ],
  },
  {
    slug: "standup",
    tab: "standup",
    label: "Standup",
    tagline: "Turn yesterday's tasks into today's standup update",
    metaDescription: "Convey turns your task list into a formatted daily standup update in seconds, then tracks hours and exports a timesheet as CSV or PDF.",
    description: "Standup helps you log what you completed and what you're planning, then instantly formats it into a clean standup update in three styles: bullet-point standard, full-sentence detailed, or Slack-ready concise. Built for developers, PMs, and remote teams who also need to track hours for timesheets.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    keywords: ["daily standup generator", "standup update template", "DSM format generator", "AI standup writer", "work timesheet generator", "standup to timesheet", "daily scrum update tool"],
    bullets: [
      "Generates a formatted standup from yesterday/today task lists",
      "Three format styles: standard, detailed, or concise",
      "Tracks hours logged and estimated per task",
      "Exports timesheet as CSV, monthly upload CSV, or printable PDF",
    ],
    faq: [
      { q: "Does it track my work hours automatically?", a: "You enter estimated hours per task and Convey totals them for you across yesterday's and today's work." },
      { q: "Can I export my standups for payroll or HR?", a: "Yes, the Timesheet view exports a standard CSV, a monthly-upload CSV, or a printable PDF for a chosen date range." },
      { q: "Can I mark holidays or leave days?", a: "Yes, each day in the timesheet range can be tagged as workday, holiday, or leave, and weekends are detected automatically." },
    ],
  },
  {
    slug: "chat-insights",
    tab: "chatanalyzer",
    label: "Chat Insights",
    tagline: "Understand your chat dynamics, or write the next message",
    metaDescription: "Convey analyzes pasted WhatsApp or Instagram chat exports for sentiment and communication patterns, or drafts a contextual reply in your chosen tone.",
    description: "Chat Insights reads a pasted or uploaded chat export and either breaks down the conversation's sentiment, dynamics, and communication styles, or drafts a new message based on that context.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    keywords: ["chat analyzer", "whatsapp chat analysis", "conversation sentiment analysis", "analyze text messages", "AI chat insights", "what to reply to a text", "relationship chat analyzer"],
    bullets: [
      "Analyzes sentiment, dynamics, and communication style from a chat",
      "Surfaces strengths and potential red flags in the conversation",
      "Suggests a next message idea based on the analysis",
      "Generates a reply in your chosen tone from chat context",
    ],
    faq: [
      { q: "What chat formats does it support?", a: "You can paste or upload a .txt export, such as a WhatsApp chat exported without media." },
      { q: "Does it just summarize the chat or can it write replies too?", a: "Both — Analyze mode breaks down sentiment and dynamics, while Generate mode drafts a message in a tone you pick, based on the same chat context." },
      { q: "What tones can I choose for a generated reply?", a: "Warm, casual, playful, professional, apologetic, or assertive." },
    ],
  },
  {
    slug: "occasions",
    tab: "occasionmessage",
    label: "Occasions",
    tagline: "The right words for any occasion, in seconds",
    metaDescription: "Convey generates warm, professional, or heartfelt occasion messages for birthdays, farewells, promotions, condolences, and more, in your chosen tone and length.",
    description: "Occasions generates ready-to-send messages for workplace and personal milestones, from farewells and promotions to birthdays and condolences. Pick an occasion, add optional context about the recipient, choose a tone and length, and get multiple message versions to copy and send.",
    icon: "M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z",
    keywords: ["occasion message generator", "farewell message generator", "work anniversary message", "congratulations message ideas", "condolence message examples", "retirement message generator", "AI greeting message writer"],
    bullets: [
      "14 preset occasions from farewell to retirement, plus custom",
      "Choose tone: warm, professional, casual, heartfelt, or humorous",
      "Pick length: quick note, message, or full letter/speech",
      "Generates multiple message versions to pick from",
    ],
    faq: [
      { q: "What occasions can I write messages for?", a: "Farewell, welcome, congratulations, appreciation, apology, birthday, work anniversary, retirement, promotion, get well, motivation, holiday wishes, condolence, or any custom occasion you describe." },
      { q: "Can I add personal details about the recipient?", a: "Yes, you can add optional context, such as how long they've been with the company or what they're known for, to make the message specific." },
      { q: "How long can the message be?", a: "Choose between a quick 2-4 sentence note, a 2-3 paragraph message, or a longer 4-6 paragraph letter or speech." },
    ],
  },
  {
    slug: "gift-message",
    tab: "giftmessage",
    label: "Gift Message",
    tagline: "Never stare at a blank gift card again",
    metaDescription: "Convey writes heartfelt, witty, short, or poetic gift card messages for any occasion and relationship, tailored with your own personal note.",
    description: "Gift Message writes the note that goes with a gift, tailored to the recipient, occasion, and your relationship to them. Choose a style like heartfelt, witty, short, or poetic, add a personal detail you want mentioned, and get several ready-to-use versions to copy onto a card.",
    icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
    keywords: ["gift card message generator", "what to write in a birthday card", "gift note ideas", "AI gift message writer", "wedding card message generator", "thank you gift message", "short gift card sayings"],
    bullets: [
      "12 preset occasions like birthday, wedding, or new baby, plus custom",
      "Relationship chips for partner, parent, friend, colleague, and more",
      "Four styles: heartfelt, witty, short, or poetic",
      "Add a personal note to weave into the message",
    ],
    faq: [
      { q: "What occasions does it cover?", a: "Birthday, anniversary, wedding, Christmas, New Year, graduation, thank you, congratulations, get well soon, new baby, farewell, or a custom occasion you type in." },
      { q: "Can I make the message funny instead of sentimental?", a: "Yes, pick the Witty style, or choose Short for something concise and punchy, or Poetic for something more lyrical." },
      { q: "Does it personalize the message to the recipient?", a: "Yes, you can specify the recipient's name, your relationship to them, and an optional personal note the message should reference." },
    ],
  },
  {
    slug: "email-subject",
    tab: "emailsubject",
    label: "Email Subject",
    tagline: "Five subject lines, five different angles, one click",
    metaDescription: "Convey's Email Subject tool turns any email body into five distinct subject line options — direct, question, benefit, conversational, and intriguing.",
    description: "Paste in the body of an email you've already written and Convey generates five subject line options, each built around a different persuasive angle. Pick a tone and an optional purpose to steer the results.",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    keywords: ["email subject line generator", "AI subject line generator", "best subject line for email", "subject line ideas", "email opener generator", "increase email open rate", "subject line tester"],
    bullets: [
      "Generates 5 subject lines from one email body",
      "Each line uses a different angle: direct, question, benefit, conversational, intriguing",
      "Choose from 5 tones: professional, casual, urgent, curious, friendly",
      "Shows character count so lines stay inbox-friendly",
    ],
    faq: [
      { q: "Do I need to write the subject line myself first?", a: "No — paste the finished email body and Convey writes the subject lines for you." },
      { q: "How many subject line options do I get?", a: "Five, each written from a different strategic angle so you can pick what fits best." },
      { q: "Can I control the tone of the subject lines?", a: "Yes, choose from professional, casual, urgent, curious, or friendly before generating." },
    ],
  },
  {
    slug: "email-writer",
    tab: "emailwriter",
    label: "Email Writer",
    tagline: "Describe your email, get subject and body written for you",
    metaDescription: "Convey's Email Writer generates a complete email with subject line and body from a short description, with control over tone, length, and recipient details.",
    description: "Describe what your email needs to say and Convey writes the full thing — a subject line plus a body in your chosen tone and length. Optionally add recipient name and role, your own name, and key points to include.",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    keywords: ["AI email writer", "write email for me", "email generator", "professional email writer AI", "follow up email generator", "email draft generator", "business email writer"],
    bullets: [
      "Writes a full subject line and email body from one description",
      "8 tone options from professional to apologetic to assertive",
      "3 length presets: brief, standard, or detailed",
      "Optional recipient name, role, and key points for a personalized draft",
    ],
    faq: [
      { q: "What do I need to provide to generate an email?", a: "Just a short description of what the email is about — everything else, like recipient details, is optional." },
      { q: "Can I control how long the email is?", a: "Yes, choose brief (2-3 paragraphs), standard (3-4), or detailed (5-6)." },
      { q: "Can I copy the whole email at once?", a: "Yes, there's a one-click option to copy the subject and body together." },
    ],
  },
  {
    slug: "prompt-boost",
    tab: "promptenhancer",
    label: "Prompt Boost",
    tagline: "Turn a rough prompt into one that actually works",
    metaDescription: "Convey's Prompt Boost rewrites rough AI prompts into optimized ones, tailored to your target platform and style, with an explanation of every change made.",
    description: "Write a quick, rough prompt the way you'd normally type it, then let Convey rewrite it into a sharper version tuned for your target AI platform — Claude, ChatGPT, Gemini, Cursor, GitHub Copilot, or a general LLM. Every enhanced prompt comes with an explanation of what changed and why.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    keywords: ["prompt enhancer", "AI prompt generator", "improve my prompt", "prompt optimizer", "ChatGPT prompt generator", "Claude prompt writer", "prompt engineering tool"],
    bullets: [
      "Rewrites rough prompts into optimized, structured ones",
      "Tunes output for Claude, ChatGPT, Gemini, Cursor, Copilot, or general LLMs",
      "Choose purpose (coding, writing, research...) and style (concise, step-by-step, chain-of-thought)",
      "Explains exactly what changed and why, plus pro tips",
    ],
    faq: [
      { q: "Do I need to know prompt engineering to use this?", a: "No — just type your prompt roughly as you normally would and Convey handles the structuring." },
      { q: "Does it work differently for different AI tools?", a: "Yes, you can pick a target platform like Claude, ChatGPT, Gemini, Cursor, or Copilot and the prompt is tailored accordingly." },
      { q: "Will it explain what it changed?", a: "Yes, every result includes a breakdown of what changed and why, along with pro tips." },
    ],
  },
  {
    slug: "agent-builder",
    tab: "agentgenerator",
    label: "Agent Builder",
    tagline: "Describe an AI agent, get a ready-to-use definition file",
    metaDescription: "Convey's Agent Builder turns a plain-language description into a complete AI agent definition file for Claude Code, Cursor, Copilot, or any LLM API.",
    description: "Describe what you want an AI agent to do and Convey generates a complete, ready-to-use agent definition — including a filename, a list of capabilities, and usage instructions. Built for developers who want a working subagent or custom instruction file without writing one from scratch.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    keywords: ["AI agent generator", "Claude Code subagent generator", "custom AI agent builder", "Cursor agent config generator", "AI agent definition file", "build a coding agent", "agent prompt generator"],
    bullets: [
      "Generates a full agent definition file from a plain description",
      "Targets Claude Code, Cursor, GitHub Copilot, VS Code, or general LLM APIs",
      "Choose specialization: code review, debugging, testing, refactoring, and more",
      "Includes capabilities list, filename, and usage instructions",
    ],
    faq: [
      { q: "What platforms does the generated agent work with?", a: "You can target Claude Code, Cursor, GitHub Copilot, VS Code, or a general LLM API." },
      { q: "What do I get back?", a: "A complete agent definition file with a suggested filename, a capabilities list, and instructions on how to use it." },
      { q: "Can I specialize the agent for a specific task?", a: "Yes, pick a specialization like code review, debugging, documentation, testing, or security audit." },
    ],
  },
  {
    slug: "word-finder",
    tab: "wordsuggest",
    label: "Word Finder",
    tagline: "Describe the feeling. Get the exact word.",
    metaDescription: "Convey's Word Finder helps you find the exact word for a feeling, moment, or idea you can't quite name, in English, Hindi, or Hinglish.",
    description: "Can't remember the perfect word for a feeling, a person, or a moment? Describe it in your own words — in English, Hindi, or Hinglish — and Convey suggests words that match, each with pronunciation, meaning, an example sentence, and a note on nuance.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7",
    keywords: ["word finder", "find the right word", "tip of the tongue word finder", "word for a feeling", "Hindi word finder", "describe a feeling find a word", "vocabulary finder AI"],
    bullets: [
      "Finds words from a plain-language description of a feeling or moment",
      "Works in English, Hindi, or Hinglish input and output",
      "Each word includes pronunciation, meaning, example, and nuance",
      "Optional category filter: emotion, person, place, concept, and more",
    ],
    faq: [
      { q: "Can I describe what I mean in Hinglish?", a: "Yes, you can describe the feeling or idea in English, Hindi, or Hinglish and choose your preferred output language." },
      { q: "What information do I get for each word?", a: "Each suggested word comes with its pronunciation, meaning, an example sentence, and a note on its nuance." },
      { q: "What if I don't know the exact category?", a: "Category selection is optional — you can just describe what you're trying to say and Convey figures out the best matches." },
    ],
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
