'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { HistoryEntry } from '../context/HistoryContext';

export type TabProps = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void };

interface ToolEntry {
  type: string; // matches HistoryEntry['type']
  Component: ComponentType<TabProps>;
}

// Keyed by the public URL slug (/app/[slug]) — same slug used on /tools/[slug].
// Each component is lazily loaded so visiting one tool doesn't pull in the other 15.
export const TOOL_COMPONENTS: Record<string, ToolEntry> = {
  'rephrase':        { type: 'rephrase',       Component: dynamic(() => import('../components/RephraseTab')) },
  'quick-reply':     { type: 'quickreply',     Component: dynamic(() => import('../components/QuickReplyTab')) },
  'tone-checker':    { type: 'analyzer',       Component: dynamic(() => import('../components/ToneAnalyzerTab')) },
  'polish':          { type: 'polish',         Component: dynamic(() => import('../components/PolishTab')) },
  'standup':         { type: 'standup',        Component: dynamic(() => import('../components/StandupTab')) },
  'chat-insights':   { type: 'chatanalyzer',   Component: dynamic(() => import('../components/ChatAnalyzerTab')) },
  'occasions':       { type: 'occasionmessage',Component: dynamic(() => import('../components/OccasionMessageTab')) },
  'gift-message':    { type: 'giftmessage',    Component: dynamic(() => import('../components/GiftMessageTab')) },
  'email-subject':   { type: 'emailsubject',   Component: dynamic(() => import('../components/EmailSubjectTab')) },
  'email-writer':    { type: 'emailwriter',    Component: dynamic(() => import('../components/EmailWriterTab')) },
  'prompt-boost':    { type: 'promptenhancer', Component: dynamic(() => import('../components/PromptEnhancerTab')) },
  'agent-builder':   { type: 'agentgenerator', Component: dynamic(() => import('../components/AgentGeneratorTab')) },
  'word-finder':     { type: 'wordsuggest',    Component: dynamic(() => import('../components/WordSuggestTab')) },
  'translate':       { type: 'translate',      Component: dynamic(() => import('../components/TranslateTab')) },
  'summarize':       { type: 'summarize',      Component: dynamic(() => import('../components/SummarizeTab')) },
  'meeting-minutes': { type: 'meetingminutes', Component: dynamic(() => import('../components/MeetingMinutesTab')) },
};

export const DEFAULT_TOOL_SLUG = 'rephrase';
