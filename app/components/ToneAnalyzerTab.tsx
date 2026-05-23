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

const SCORE_META: Record<string, { label: string; color: string; bar: string }> = {
  professional: { label: 'Professional', color: 'text-blue-600',   bar: 'bg-blue-500' },
  casual:       { label: 'Casual',       color: 'text-green-600',  bar: 'bg-green-500' },
  emotional:    { label: 'Emotional',    color: 'text-pink-600',   bar: 'bg-pink-500' },
  assertive:    { label: 'Assertive',    color: 'text-orange-600', bar: 'bg-orange-500' },
  empathetic:   { label: 'Empathetic',   color: 'text-teal-600',   bar: 'bg-teal-500' },
  formal:       { label: 'Formal',       color: 'text-indigo-600', bar: 'bg-indigo-500' },
};

const PRIMARY_COLORS: Record<string, string> = {
  Casual:       'bg-green-100 text-green-700 border-green-300',
  Professional: 'bg-blue-100 text-blue-700 border-blue-300',
  Formal:       'bg-indigo-100 text-indigo-700 border-indigo-300',
  Emotional:    'bg-pink-100 text-pink-700 border-pink-300',
  Assertive:    'bg-orange-100 text-orange-700 border-orange-300',
  Empathetic:   'bg-teal-100 text-teal-700 border-teal-300',
  Warm:         'bg-amber-100 text-amber-700 border-amber-300',
};

export default function ToneAnalyzerTab() {
  const { saveEntry } = useHistory();
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!message.trim()) { setError('Please enter a message to analyze.'); return; }
    setError('');
    setLoading(true);
    setAnimate(false);
    setAnalysis(null);
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
        type: 'analyzer',
        emoji: '🔍',
        label: data.analysis.primary,
        preview: message.slice(0, 60),
        data: { message, analysis: data.analysis },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [message, saveEntry]);

  const primaryColor = analysis
    ? PRIMARY_COLORS[analysis.primary] ?? 'bg-slate-100 text-slate-700 border-slate-300'
    : '';

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Message to Analyse
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste any message to see what tone it's giving off…"
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2 fade-in-up">
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analysing…
          </span>
        ) : '🔍 Analyse Tone'}
      </button>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-24" />
          <div className="skeleton h-40" />
        </div>
      )}

      {analysis && (
        <div className="space-y-4 fade-in-up">
          {/* Primary + tags */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Primary Tone</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full border ${primaryColor}`}>
                {analysis.primary}
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {analysis.tags?.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{analysis.verdict}</p>
          </div>

          {/* Bars */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Tone Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(analysis.scores)
                .sort(([, a], [, b]) => b - a)
                .map(([key, score]) => {
                  const meta = SCORE_META[key];
                  if (!meta) return null;
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                        <span className="text-xs font-bold text-slate-500">{score}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${meta.bar} ${animate ? 'grow-bar' : ''} transition-all duration-700`}
                          style={{ width: animate ? `${Math.min(score, 100)}%` : '0%' }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">💡 Tips to Improve</h3>
            <ul className="space-y-2.5">
              {analysis.tips?.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
