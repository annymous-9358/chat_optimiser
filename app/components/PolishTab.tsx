'use client';

import { useState, useCallback } from 'react';

const ACTIONS = [
  { id: 'shorten', label: 'Shorten',      emoji: '✂️',  desc: 'Cut the fluff',        color: 'hover:border-rose-400 hover:bg-rose-50',    active: 'border-rose-400 bg-rose-50 shadow-md scale-105' },
  { id: 'expand',  label: 'Expand',       emoji: '📖',  desc: 'Add more detail',      color: 'hover:border-blue-400 hover:bg-blue-50',    active: 'border-blue-400 bg-blue-50 shadow-md scale-105' },
  { id: 'fix',     label: 'Fix Grammar',  emoji: '✅',  desc: 'Fix spelling & grammar', color: 'hover:border-green-400 hover:bg-green-50', active: 'border-green-400 bg-green-50 shadow-md scale-105' },
  { id: 'punchy',  label: 'Make Punchier',emoji: '🎯',  desc: 'Stronger & snappier',  color: 'hover:border-orange-400 hover:bg-orange-50', active: 'border-orange-400 bg-orange-50 shadow-md scale-105' },
  { id: 'emojis',  label: 'Add Emojis',   emoji: '😊',  desc: 'Express more',         color: 'hover:border-yellow-400 hover:bg-yellow-50', active: 'border-yellow-400 bg-yellow-50 shadow-md scale-105' },
  { id: 'strip',   label: 'Strip Emojis', emoji: '🚫',  desc: 'Clean text only',      color: 'hover:border-slate-400 hover:bg-slate-100', active: 'border-slate-400 bg-slate-100 shadow-md scale-105' },
];

export default function PolishTab() {
  const [message, setMessage] = useState('');
  const [activeAction, setActiveAction] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const runAction = useCallback(async (actionId: string) => {
    if (!message.trim()) { setError('Please enter a message first.'); return; }
    setError('');
    setLoading(actionId);
    setActiveAction(actionId);
    setResult('');
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, action: actionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  }, [message]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const useResult = () => {
    setMessage(result);
    setResult('');
    setActiveAction('');
  };

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Your Message
        </label>
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste your message here, then pick a transform below…"
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition pr-8"
          />
          {message && (
            <button
              onClick={() => { setMessage(''); setResult(''); setActiveAction(''); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition text-xl leading-none"
            >×</button>
          )}
        </div>
      </div>

      {/* Action grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Pick a Transform
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => runAction(a.id)}
              disabled={!!loading}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-150 border-slate-200 bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed ${
                activeAction === a.id && result ? a.active : a.color
              }`}
            >
              {loading === a.id ? (
                <svg className="animate-spin h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <span className="text-2xl">{a.emoji}</span>
              )}
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">{a.label}</span>
              <span className="text-[10px] text-slate-400 text-center leading-tight">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2 fade-in-up">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Result</h3>
            <div className="flex gap-2">
              <button
                onClick={useResult}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                ↑ Use as input
              </button>
              <button
                onClick={handleCopy}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                  copied
                    ? 'bg-green-50 border-green-300 text-green-600'
                    : 'border-amber-300 text-amber-600 hover:bg-amber-50'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
