'use client';

import { useState, useCallback } from 'react';
import { useHistory } from '../context/HistoryContext';
import VoiceInput  from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

const RELATIONSHIPS = [
  { id: 'boss',      label: 'Boss',      emoji: '👔' },
  { id: 'colleague', label: 'Colleague', emoji: '🤝' },
  { id: 'friend',    label: 'Friend',    emoji: '😄' },
  { id: 'partner',   label: 'Partner',   emoji: '❤️' },
  { id: 'family',    label: 'Family',    emoji: '👨‍👩‍👧' },
  { id: 'client',    label: 'Client',    emoji: '💼' },
];

const APPROACH_META = [
  { label: 'Agreeable',  color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { label: 'Neutral',    color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { label: 'Declining',  color: 'text-slate-600 bg-slate-100 border-slate-200' },
];

export default function QuickReplyTab() {
  const { saveEntry } = useHistory();
  const [received,     setReceived]     = useState('');
  const [relationship, setRelationship] = useState('');
  const [context,      setContext]      = useState('');
  const [replies,      setReplies]      = useState<string[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [copied,       setCopied]       = useState<number | null>(null);
  const [showResults,  setShowResults]  = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!received.trim()) { setError('Paste the message you received.'); return; }
    if (!relationship) { setError('Select your relationship with the sender.'); return; }
    setError(''); setLoading(true); setShowResults(false); setReplies([]);
    try {
      const res = await fetch('/api/quick-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receivedMessage: received, relationship, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setReplies(data.replies);
      setShowResults(true);
      const rel = RELATIONSHIPS.find((r) => r.id === relationship);
      saveEntry({
        type: 'quickreply', emoji: rel?.emoji ?? '💬', label: rel?.label ?? relationship,
        preview: received.slice(0, 60),
        data: { receivedMessage: received, relationship, context, replies: data.replies },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [received, relationship, context, saveEntry]);

  const handleCopy = (text: string, i: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* Received message */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-500">Message you received</label>
          <VoiceInput onResult={(t) => setReceived((r) => r ? r + ' ' + t : t)} disabled={loading} />
        </div>
        <textarea
          value={received}
          onChange={(e) => setReceived(e.target.value)}
          placeholder="Paste the message someone sent you…"
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
        />
      </div>

      {/* Relationship + Context */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2.5">
            Who sent it?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRelationship(r.id)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border py-3 transition-all duration-150 ${
                  relationship === r.id
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl">{r.emoji}</span>
                <span className="text-[11px] font-medium">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Context <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. deadline is tomorrow, I already said no once…"
            className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Generating replies…
          </span>
        ) : 'Generate smart replies'}
      </button>

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-20" style={{ animationDelay: `${i * 0.1}s` }} />)}
        </div>
      )}

      {showResults && replies.length > 0 && (
        <div className="space-y-2.5 fade-in-up">
          <h2 className="text-sm font-medium text-slate-700">Reply options</h2>
          {replies.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/70 p-4 flex items-start gap-3 group result-card transition-all duration-200 fade-in-up"
              style={{ animationDelay: `${i * 0.06}s`, boxShadow: 'var(--shadow-card)' }}
            >
              <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-1 rounded border whitespace-nowrap mt-0.5 ${APPROACH_META[i].color}`}>
                {APPROACH_META[i].label}
              </span>
              <p className="flex-1 text-sm text-slate-700 leading-relaxed">{r}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <SpeakButton text={r} />
                <ShareButton text={r} />
                <button
                  onClick={() => handleCopy(r, i)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-all ${
                    copied === i
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'opacity-0 group-hover:opacity-100 border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {copied === i ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
