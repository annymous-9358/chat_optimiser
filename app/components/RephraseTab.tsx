'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory } from '../context/HistoryContext';

const TONES = [
  { id: 'professional_formal',         label: 'Pro Formal',    emoji: '🏢', desc: 'Executive emails' },
  { id: 'professional_conversational',  label: 'Pro Casual',   emoji: '💼', desc: 'Friendly colleague' },
  { id: 'professional_group',           label: 'Team/Group',   emoji: '👥', desc: 'Slack announcements' },
  { id: 'love_romantic',               label: 'Romantic',      emoji: '❤️', desc: 'Romantic & tender' },
  { id: 'friend_chat',                 label: 'Friend',        emoji: '🤙', desc: 'Close friends' },
  { id: 'casual',                      label: 'Casual',        emoji: '💬', desc: 'Easy-going' },
  { id: 'empathetic',                  label: 'Empathetic',    emoji: '🤗', desc: 'Warm & supportive' },
  { id: 'witty_humorous',              label: 'Witty',         emoji: '😄', desc: 'Light-hearted' },
  { id: 'assertive',                   label: 'Assertive',     emoji: '💪', desc: 'Direct & bold' },
  { id: 'apologetic',                  label: 'Apologetic',    emoji: '🙏', desc: 'Sincere apology' },
];

const APPROACH_LABELS = ['Direct', 'Natural', 'Creative'];

type Session = { id: string; message: string; tone: string; suggestions: string[] };
type Props = {
  loadSession?: Session | null;
  onSessionLoaded?: () => void;
};

export default function RephraseTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [message,     setMessage]     = useState('');
  const [tone,        setTone]        = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [copied,      setCopied]      = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (loadSession) {
      setMessage(loadSession.message);
      setTone(loadSession.tone);
      setSuggestions(loadSession.suggestions);
      setShowResults(true);
      onSessionLoaded?.();
    }
  }, [loadSession, onSessionLoaded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleRephrase();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleRephrase = useCallback(async () => {
    if (!message.trim()) { setError('Please enter a message.'); return; }
    if (!tone) { setError('Please select a tone.'); return; }
    setError(''); setLoading(true); setShowResults(false); setSuggestions([]);
    try {
      const res = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSuggestions(data.suggestions);
      setShowResults(true);
      const t = TONES.find((x) => x.id === tone);
      saveEntry({
        type: 'rephrase', emoji: t?.emoji ?? '💬', label: t?.label ?? tone,
        preview: message.slice(0, 60),
        data: { message, tone, toneName: t?.label ?? tone, toneEmoji: t?.emoji ?? '💬', suggestions: data.suggestions },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [message, tone, saveEntry]);

  const handleCopy = useCallback((text: string, i: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-2">Your message</label>
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleRephrase(); }}
            placeholder="Paste or type the message you want to rephrase…"
            rows={4}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all pr-8"
          />
          {message && (
            <button
              onClick={() => { setMessage(''); setSuggestions([]); setShowResults(false); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition"
              aria-label="Clear message"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className={`flex justify-between items-center mt-1.5 text-xs ${message.length > 900 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
          <span>⌘+Enter to rephrase</span>
          <span>{message.length} / 1000</span>
        </div>
      </div>

      {/* Tone selector */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-3">Select tone</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-center transition-all duration-150 ${
                tone === t.id
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              <span className="text-[11px] font-medium leading-tight">{t.label}</span>
              <span className="text-[9px] text-slate-400 leading-tight">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleRephrase}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Rephrasing…
          </span>
        ) : 'Rephrase message'}
      </button>

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-20 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {/* Results */}
      {showResults && suggestions.length > 0 && (
        <div className="space-y-2.5 fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-700">Suggestions</h2>
            <span className="text-xs text-slate-400">Hover to copy</span>
          </div>
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/70 p-4 flex items-start gap-3 group result-card transition-all duration-200 fade-in-up"
              style={{ animationDelay: `${i * 0.06}s`, boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-[9px] font-medium text-slate-400">{APPROACH_LABELS[i]}</span>
              </div>
              <p className="flex-1 text-sm text-slate-700 leading-relaxed">{s}</p>
              <button
                onClick={() => handleCopy(s, i)}
                className={`flex-shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-all duration-150 ${
                  copied === i
                    ? 'bg-green-50 border-green-200 text-green-700 opacity-100'
                    : 'opacity-0 group-hover:opacity-100 border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {copied === i ? 'Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
