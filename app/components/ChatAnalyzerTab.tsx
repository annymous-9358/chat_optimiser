'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';
import VoiceInput  from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

// ── Types ─────────────────────────────────────────────────────────────────────
type Mode = 'analyze' | 'generate';

type Analysis = {
  summary: string;
  sentiment: string;
  sentimentScore: number;
  dynamics: string[];
  communicationStyle: { user: string; other: string };
  redFlags?: string[];
  strengths: string[];
  suggestions: string[];
  nextMessageIdea: string;
};

const GENERATE_TONES = [
  { id: 'warm',         label: 'Warm',         emoji: '🤗' },
  { id: 'casual',       label: 'Casual',       emoji: '💬' },
  { id: 'playful',      label: 'Playful',      emoji: '😄' },
  { id: 'professional', label: 'Professional', emoji: '💼' },
  { id: 'apologetic',   label: 'Apologetic',   emoji: '🙏' },
  { id: 'assertive',    label: 'Assertive',    emoji: '💪' },
];

const SENTIMENT_COLOR: Record<string, string> = {
  Positive:  'bg-green-50 text-green-700 border-green-200',
  Neutral:   'bg-slate-100 text-slate-600 border-slate-200',
  Mixed:     'bg-amber-50 text-amber-700 border-amber-200',
  Tense:     'bg-orange-50 text-orange-700 border-orange-200',
  Cold:      'bg-blue-50 text-blue-700 border-blue-200',
};

function sentimentBar(score: number) {
  // 0 = very negative, 100 = very positive
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? 'bg-green-400' : pct >= 45 ? 'bg-amber-400' : 'bg-red-400';
  return { pct, color };
}

// ── Component ─────────────────────────────────────────────────────────────────
type Props = {
  loadSession?: HistoryEntry | null;
  onSessionLoaded?: () => void;
};

export default function ChatAnalyzerTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();

  const [chatText,     setChatText]     = useState('');
  const [mode,         setMode]         = useState<Mode>('analyze');
  const [otherPerson,  setOtherPerson]  = useState('');
  const [purpose,      setPurpose]      = useState('');
  const [genTone,      setGenTone]      = useState('warm');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [analysis,     setAnalysis]     = useState<Analysis | null>(null);
  const [messages,     setMessages]     = useState<string[]>([]);
  const [copied,       setCopied]       = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data as Record<string, unknown>;
    const savedMode = (d.mode as Mode) ?? 'analyze';
    setMode(savedMode);
    setOtherPerson((d.otherPerson as string) ?? '');
    if (savedMode === 'generate') {
      setPurpose((d.purpose as string) ?? '');
      setGenTone((d.tone as string) ?? 'warm');
      setMessages((d.messages as string[]) ?? []);
      setAnalysis(null);
    } else {
      setAnalysis((d.analysis as Analysis) ?? null);
      setMessages([]);
    }
    onSessionLoaded?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSession]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setChatText(text ?? '');
      setAnalysis(null);
      setMessages([]);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, []);

  const handleRun = useCallback(async () => {
    if (!chatText.trim()) { setError('Please paste or upload a chat export first.'); return; }
    if (mode === 'generate' && !purpose.trim()) { setError('Please describe what you want to say.'); return; }
    setError(''); setLoading(true); setAnalysis(null); setMessages([]);

    try {
      const body: Record<string, string> = { chatText, mode };
      if (mode === 'generate') { body.purpose = purpose; body.tone = genTone; body.otherPerson = otherPerson; }

      const res  = await fetch('/api/chat-analyzer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      if (mode === 'analyze') {
        setAnalysis(data.analysis);
        saveEntry({
          type:    'chatanalyzer',
          emoji:   '🔬',
          label:   `Chat analysis${otherPerson ? ` · ${otherPerson}` : ''}`,
          preview: data.analysis?.summary?.slice(0, 80) ?? 'Chat analysis',
          data:    { mode: 'analyze', otherPerson, analysis: data.analysis },
        });
      } else {
        setMessages(data.messages ?? []);
        const toneLabel = GENERATE_TONES.find(t => t.id === genTone)?.label ?? genTone;
        saveEntry({
          type:    'chatanalyzer',
          emoji:   '💌',
          label:   `Message from context${otherPerson ? ` · ${otherPerson}` : ''}`,
          preview: purpose.slice(0, 60),
          data:    { mode: 'generate', otherPerson, purpose, tone: genTone, toneLabel, messages: data.messages },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [chatText, mode, purpose, genTone, otherPerson, saveEntry]);

  const handleCopy = useCallback((text: string, i: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const charCount = chatText.length;

  return (
    <div className="space-y-4">

      {/* Mode selector */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <p className="text-xs font-medium text-slate-500 mb-3">What do you want to do?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setMode('analyze'); setMessages([]); }}
            className={`flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-all ${
              mode === 'analyze'
                ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-base">🔬</span>
            <span className={`text-sm font-medium ${mode === 'analyze' ? 'text-indigo-700' : 'text-slate-700'}`}>
              Analyse the chat
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">Understand dynamics, patterns & tone</span>
          </button>

          <button
            onClick={() => { setMode('generate'); setAnalysis(null); }}
            className={`flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-all ${
              mode === 'generate'
                ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-base">💌</span>
            <span className={`text-sm font-medium ${mode === 'generate' ? 'text-indigo-700' : 'text-slate-700'}`}>
              Generate a message
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">Craft a reply based on your chat context</span>
          </button>
        </div>
      </div>

      {/* Chat paste + upload */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-500">Paste your chat export</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload .txt
            </button>
            <input ref={fileInputRef} type="file" accept=".txt,.log" className="hidden" onChange={handleFileUpload} />
            {chatText && (
              <button
                onClick={() => { setChatText(''); setAnalysis(null); setMessages([]); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <textarea
          value={chatText}
          onChange={e => { setChatText(e.target.value); setAnalysis(null); setMessages([]); }}
          placeholder={`Paste your WhatsApp or Instagram chat export here…\n\nWhatsApp: Open chat → ⋮ → More → Export chat → Without media\nInstagram: DM → ⓘ → Export chat`}
          rows={6}
          className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all font-mono text-xs leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-slate-400">Export without media — only the text is needed</span>
          <span className={`text-[11px] ${charCount > 8000 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
            {charCount > 0 ? `${(charCount / 1000).toFixed(1)}k chars` : ''}
          </span>
        </div>
      </div>

      {/* Optional: who are you talking to */}
      <div className="bg-white rounded-2xl border border-slate-200/70 px-5 py-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          Their name <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={otherPerson}
          onChange={e => setOtherPerson(e.target.value)}
          placeholder="e.g. Priya, Alex…"
          className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
        />
      </div>

      {/* Generate-only fields */}
      {mode === 'generate' && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-500">
                What do you want to say? <span className="text-red-400">*</span>
              </label>
              <VoiceInput onResult={(t) => setPurpose((p) => p ? p + ' ' + t : t)} disabled={loading} />
            </div>
            <textarea
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="e.g. I want to apologise for missing their call yesterday and suggest catching up this weekend…"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <label className="block text-xs font-medium text-slate-500 mb-3">Tone</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {GENERATE_TONES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setGenTone(t.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-center transition-all ${
                    genTone === t.id
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-[11px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">{error}</div>
      )}

      <button
        onClick={handleRun}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {mode === 'analyze' ? 'Analysing…' : 'Generating…'}
          </span>
        ) : mode === 'analyze' ? 'Analyse chat' : 'Generate message'}
      </button>

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="skeleton h-16 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {/* ── Analysis results ── */}
      {!loading && analysis && (
        <div className="space-y-4 fade-in-up">
          {/* Summary + sentiment */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Overview</h3>
              <span className={`text-[11px] font-medium border px-2 py-0.5 rounded-full flex-shrink-0 ${SENTIMENT_COLOR[analysis.sentiment] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {analysis.sentiment}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{analysis.summary}</p>

            {/* Sentiment bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">Negative</span>
                <span className="text-[11px] text-slate-400">Positive</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full grow-bar ${sentimentBar(analysis.sentimentScore).color}`}
                  style={{ width: `${sentimentBar(analysis.sentimentScore).pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Communication styles */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Communication styles</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-medium text-slate-400 mb-1">You</p>
                <p className="text-sm text-slate-600 leading-relaxed">{analysis.communicationStyle?.user}</p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <p className="text-[11px] font-medium text-slate-400 mb-1">{otherPerson || 'Them'}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{analysis.communicationStyle?.other}</p>
              </div>
            </div>
          </div>

          {/* Dynamics */}
          {(analysis.dynamics?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Dynamics observed</h3>
              <ul className="space-y-2">
                {analysis.dynamics.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths + red flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(analysis.strengths?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-base">✅</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(analysis.redFlags?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-red-100 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-base">⚠️</span> Watch out
                </h3>
                <ul className="space-y-2">
                  {analysis.redFlags!.map((f, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {(analysis.suggestions?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Suggestions</h3>
              <ul className="space-y-2.5">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next message idea */}
          {analysis.nextMessageIdea && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-indigo-500 mb-1.5">💡 You could send…</p>
                  <p className="text-sm text-indigo-800 leading-relaxed">{analysis.nextMessageIdea}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <SpeakButton text={analysis.nextMessageIdea} />
                  <ShareButton text={analysis.nextMessageIdea} />
                </div>
                <button
                  onClick={() => handleCopy(analysis.nextMessageIdea, 99)}
                  className="flex-shrink-0 text-indigo-400 hover:text-indigo-700 transition"
                  aria-label="Copy suggestion"
                >
                  {copied === 99 ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Generated messages ── */}
      {!loading && messages.length > 0 && (
        <div className="space-y-3 fade-in-up">
          <p className="text-xs font-medium text-slate-500 px-1">Choose a version</p>
          {messages.map((msg, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">{msg}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <SpeakButton text={msg} />
                  <ShareButton text={msg} />
                  <button
                    onClick={() => handleCopy(msg, i)}
                    className="flex-shrink-0 text-slate-400 hover:text-indigo-600 transition"
                    aria-label="Copy message"
                  >
                    {copied === i ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
