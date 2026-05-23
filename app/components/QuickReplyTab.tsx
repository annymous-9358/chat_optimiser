'use client';

import { useState, useCallback } from 'react';

const RELATIONSHIPS = [
  { id: 'boss',      label: 'Boss',      emoji: '👔' },
  { id: 'colleague', label: 'Colleague', emoji: '🤝' },
  { id: 'friend',    label: 'Friend',    emoji: '😄' },
  { id: 'partner',   label: 'Partner',   emoji: '❤️' },
  { id: 'family',    label: 'Family',    emoji: '👨‍👩‍👧' },
  { id: 'client',    label: 'Client',    emoji: '💼' },
];

const APPROACH_META = [
  { label: '✅ Agreeable',  color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { label: '↔️ Neutral',    color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { label: '🚫 Declining',  color: 'bg-orange-50 border-orange-200 text-orange-700' },
];

export default function QuickReplyTab() {
  const [received, setReceived] = useState('');
  const [relationship, setRelationship] = useState('');
  const [context, setContext] = useState('');
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!received.trim()) { setError('Paste the message you received.'); return; }
    if (!relationship) { setError('Select your relationship with the sender.'); return; }
    setError('');
    setLoading(true);
    setShowResults(false);
    setReplies([]);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [received, relationship, context]);

  const handleCopy = (text: string, i: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="space-y-5">
      {/* Received message */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Message You Received
        </label>
        <textarea
          value={received}
          onChange={(e) => setReceived(e.target.value)}
          placeholder="Paste the message someone sent you…"
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 transition"
        />
      </div>

      {/* Relationship + Context */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Who Sent It?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRelationship(r.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 transition-all duration-150 ${
                  relationship === r.id
                    ? 'border-cyan-500 bg-cyan-50 scale-105 shadow-md'
                    : 'border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50 hover:scale-[1.03]'
                }`}
              >
                <span className="text-xl">{r.emoji}</span>
                <span className={`text-[11px] font-semibold ${relationship === r.id ? 'text-cyan-700' : 'text-slate-700'}`}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Context <span className="normal-case font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. deadline is tomorrow, I already said no once…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 transition"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2 fade-in-up">
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg shadow-lg hover:from-cyan-600 hover:to-blue-600 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Generating replies…
          </span>
        ) : '💬 Generate Smart Replies'}
      </button>

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-20" style={{ animationDelay: `${i * 0.1}s` }} />)}
        </div>
      )}

      {showResults && replies.length > 0 && (
        <div className="space-y-3 fade-in-up">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Reply Options</h2>
          {replies.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 group hover:border-cyan-200 hover:shadow-md transition-all fade-in-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${APPROACH_META[i].color}`}>
                  {APPROACH_META[i].label}
                </span>
              </div>
              <p className="flex-1 text-slate-700 leading-relaxed">{r}</p>
              <button
                onClick={() => handleCopy(r, i)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  copied === i
                    ? 'bg-green-50 border-green-300 text-green-600 opacity-100'
                    : 'opacity-0 group-hover:opacity-100 border-cyan-200 text-cyan-500 hover:bg-cyan-50'
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
