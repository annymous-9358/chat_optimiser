'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory } from '../context/HistoryContext';

const TONES = [
  { id: 'professional_formal',        label: 'Pro Formal',       emoji: '🏢', desc: 'Executive emails' },
  { id: 'professional_conversational', label: 'Pro Casual',       emoji: '💼', desc: 'Friendly colleague' },
  { id: 'professional_group',          label: 'Team / Group',     emoji: '👥', desc: 'Slack / announcements' },
  { id: 'love_romantic',              label: 'Love Chat',         emoji: '❤️', desc: 'Romantic & tender' },
  { id: 'friend_chat',                label: 'Friend Chat',       emoji: '🤙', desc: 'Close friends' },
  { id: 'casual',                     label: 'Casual',            emoji: '💬', desc: 'Easy-going' },
  { id: 'empathetic',                 label: 'Empathetic',        emoji: '🤗', desc: 'Warm & supportive' },
  { id: 'witty_humorous',             label: 'Witty / Funny',     emoji: '😄', desc: 'Light-hearted' },
  { id: 'assertive',                  label: 'Assertive',         emoji: '💪', desc: 'Direct & bold' },
  { id: 'apologetic',                 label: 'Apologetic',        emoji: '🙏', desc: 'Sincere apology' },
];

const APPROACH_LABELS = ['Direct', 'Natural', 'Creative'];
const APPROACH_COLORS = [
  'bg-blue-50 text-blue-600 border-blue-200',
  'bg-emerald-50 text-emerald-600 border-emerald-200',
  'bg-violet-50 text-violet-600 border-violet-200',
];

type Session = { id: string; message: string; tone: string; suggestions: string[] };
type Props = {
  loadSession?: Session | null;
  onSessionLoaded?: () => void;
};

export default function RephraseTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
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
    setError('');
    setLoading(true);
    setShowResults(false);
    setSuggestions([]);
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
        type: 'rephrase',
        emoji: t?.emoji ?? '💬',
        label: t?.label ?? tone,
        preview: message.slice(0, 60),
        data: { message, tone, toneName: t?.label ?? tone, toneEmoji: t?.emoji ?? '💬', suggestions: data.suggestions },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [message, tone, saveEntry]);

  const handleCopy = useCallback((text: string, i: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Message</label>
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleRephrase(); }}
            placeholder="Paste or type your message here…"
            rows={4}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition pr-8"
          />
          {message && (
            <button
              onClick={() => { setMessage(''); setSuggestions([]); setShowResults(false); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition text-xl leading-none"
            >×</button>
          )}
        </div>
        <div className={`flex justify-between items-center mt-1.5 text-xs ${message.length > 900 ? 'text-orange-500 font-semibold' : 'text-slate-400'}`}>
          <span className="text-slate-400">⌘ + Enter to rephrase</span>
          <span>{message.length} / 1000</span>
        </div>
      </div>

      {/* Tone selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Tone</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all duration-150 ${
                tone === t.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105'
                  : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-violet-50 hover:scale-[1.03]'
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className={`text-[11px] font-semibold leading-tight ${tone === t.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                {t.label}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2 fade-in-up">
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleRephrase}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Rephrasing…
          </span>
        ) : '✨ Rephrase Message'}
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
        <div className="space-y-3 fade-in-up">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Suggestions</h2>
            <span className="text-xs text-slate-400">— hover to copy</span>
          </div>
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 group hover:border-indigo-200 hover:shadow-md transition-all duration-200 fade-in-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${APPROACH_COLORS[i]}`}>
                  {APPROACH_LABELS[i]}
                </span>
              </div>
              <p className="flex-1 text-slate-700 leading-relaxed">{s}</p>
              <button
                onClick={() => handleCopy(s, i)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                  copied === i
                    ? 'bg-green-50 border-green-300 text-green-600 opacity-100'
                    : 'opacity-0 group-hover:opacity-100 border-indigo-200 text-indigo-500 hover:bg-indigo-50'
                }`}
              >
                {copied === i ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
