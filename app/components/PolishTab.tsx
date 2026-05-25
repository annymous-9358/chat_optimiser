'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';
import VoiceInput  from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

const ACTIONS = [
  { id: 'shorten', label: 'Shorten',       emoji: '✂️',  desc: 'Cut the fluff' },
  { id: 'expand',  label: 'Expand',        emoji: '📖',  desc: 'Add more detail' },
  { id: 'fix',     label: 'Fix Grammar',   emoji: '✅',  desc: 'Fix spelling & grammar' },
  { id: 'punchy',  label: 'Make Punchier', emoji: '🎯',  desc: 'Stronger & snappier' },
  { id: 'emojis',  label: 'Add Emojis',    emoji: '😊',  desc: 'Express more' },
  { id: 'strip',   label: 'Strip Emojis',  emoji: '🚫',  desc: 'Clean text only' },
];

type Props = {
  loadSession?: HistoryEntry | null;
  onSessionLoaded?: () => void;
};

export default function PolishTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [message,      setMessage]      = useState('');
  const [activeAction, setActiveAction] = useState('');
  const [result,       setResult]       = useState('');
  const [loading,      setLoading]      = useState<string | null>(null);
  const [error,        setError]        = useState('');
  const [copied,       setCopied]       = useState(false);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setMessage((d.message as string) ?? '');
    setActiveAction((d.action as string) ?? '');
    setResult((d.result as string) ?? '');
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const runAction = useCallback(async (actionId: string) => {
    if (!message.trim()) { setError('Please enter a message first.'); return; }
    setError(''); setLoading(actionId); setActiveAction(actionId); setResult('');
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, action: actionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data.result);
      const action = ACTIONS.find((a) => a.id === actionId);
      saveEntry({
        type: 'polish', emoji: action?.emoji ?? '🛠️', label: action?.label ?? actionId,
        preview: message.slice(0, 60),
        data: { message, action: actionId, result: data.result },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(null); }
  }, [message, saveEntry]);

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
    <div className="space-y-4">
      {/* Input */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-500">Your message</label>
          <VoiceInput onResult={(t) => setMessage((m) => m ? m + ' ' + t : t)} disabled={!!loading} />
        </div>
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste your message, then pick a transform below…"
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all pr-8"
          />
          {message && (
            <button
              onClick={() => { setMessage(''); setResult(''); setActiveAction(''); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition"
              aria-label="Clear message"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Action grid */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-3">
          Pick a transform
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => runAction(a.id)}
              disabled={!!loading}
              className={`flex flex-col items-center gap-2 rounded-lg border px-3 py-3.5 text-center transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
                activeAction === a.id && result
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {loading === a.id ? (
                <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <span className="text-xl">{a.emoji}</span>
              )}
              <span className="text-xs font-medium text-slate-700 leading-tight">{a.label}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 fade-in-up" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-slate-500">Result</h3>
            <div className="flex items-center gap-1.5">
              <SpeakButton text={result} />
              <ShareButton text={result} />
              <button
                onClick={useResult}
                className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Use as input
              </button>
              <button
                onClick={handleCopy}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition ${
                  copied
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
