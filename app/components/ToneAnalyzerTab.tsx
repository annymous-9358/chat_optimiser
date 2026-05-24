'use client';

import { useState, useCallback } from 'react';
import { useHistory } from '../context/HistoryContext';

type Analysis = {
  primary: string;
  scores: Record<string, number>;
  verdict: string;
  tips: string[];
  tags: string[];
};

const SCORE_META: Record<string, { label: string; bar: string }> = {
  professional: { label: 'Professional', bar: 'bg-blue-500' },
  casual:       { label: 'Casual',       bar: 'bg-green-500' },
  emotional:    { label: 'Emotional',    bar: 'bg-pink-500' },
  assertive:    { label: 'Assertive',    bar: 'bg-orange-500' },
  empathetic:   { label: 'Empathetic',   bar: 'bg-teal-500' },
  formal:       { label: 'Formal',       bar: 'bg-indigo-500' },
};

export default function ToneAnalyzerTab() {
  const { saveEntry } = useHistory();
  const [message,  setMessage]  = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [animate,  setAnimate]  = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!message.trim()) { setError('Please enter a message to analyze.'); return; }
    setError(''); setLoading(true); setAnimate(false); setAnalysis(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setAnalysis(data.analysis);
      setTimeout(() => setAnimate(true), 50);
      saveEntry({
        type: 'analyzer', emoji: '🔍', label: data.analysis.primary,
        preview: message.slice(0, 60),
        data: { message, analysis: data.analysis },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [message, saveEntry]);

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-2">
          Message to analyse
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste any message to see what tone it's giving off…"
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analysing…
          </span>
        ) : 'Analyse tone'}
      </button>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-24" />
          <div className="skeleton h-40" />
        </div>
      )}

      {analysis && (
        <div className="space-y-3 fade-in-up">
          {/* Primary + verdict */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-medium text-slate-500">Primary tone</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {analysis.primary}
              </span>
              {analysis.tags?.map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.verdict}</p>
          </div>

          {/* Score bars */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3 className="text-xs font-medium text-slate-500 mb-4">Tone breakdown</h3>
            <div className="space-y-3.5">
              {Object.entries(analysis.scores)
                .sort(([, a], [, b]) => b - a)
                .map(([key, score]) => {
                  const meta = SCORE_META[key];
                  if (!meta) return null;
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-slate-600">{meta.label}</span>
                        <span className="text-xs font-semibold text-slate-500">{score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${meta.bar} transition-all duration-700`}
                          style={{ width: animate ? `${Math.min(score, 100)}%` : '0%' }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Tips */}
          {analysis.tips?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-xs font-medium text-slate-500 mb-3">Tips to improve</h3>
              <ul className="space-y-2.5">
                {analysis.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
