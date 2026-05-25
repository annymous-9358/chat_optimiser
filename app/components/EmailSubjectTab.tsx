'use client';

import { useState, useCallback } from 'react';
import { useHistory } from '../context/HistoryContext';
import VoiceInput  from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

const STRATEGIES = [
  { i: 0, label: 'Direct',        color: 'text-blue-600   bg-blue-50   border-blue-200'   },
  { i: 1, label: 'Question',      color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { i: 2, label: 'Benefit',       color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { i: 3, label: 'Conversational',color: 'text-amber-600  bg-amber-50  border-amber-200'  },
  { i: 4, label: 'Intriguing',    color: 'text-pink-600   bg-pink-50   border-pink-200'   },
];

const TONES = [
  { id: 'professional', label: 'Professional', emoji: '🏢' },
  { id: 'casual',       label: 'Casual',       emoji: '😊' },
  { id: 'urgent',       label: 'Urgent',       emoji: '⚡' },
  { id: 'curious',      label: 'Curious',      emoji: '🤔' },
  { id: 'friendly',     label: 'Friendly',     emoji: '👋' },
];

export default function EmailSubjectTab() {
  const { saveEntry } = useHistory();
  const [body,        setBody]        = useState('');
  const [purpose,     setPurpose]     = useState('');
  const [tone,        setTone]        = useState('professional');
  const [subjects,    setSubjects]    = useState<string[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [copied,      setCopied]      = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!body.trim()) { setError('Paste your email body first.'); return; }
    setError(''); setLoading(true); setShowResults(false); setSubjects([]);
    try {
      const res = await fetch('/api/email-subject', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ body, tone, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSubjects(data.subjects);
      setShowResults(true);
      saveEntry({
        type: 'emailsubject', emoji: '📧', label: 'Email Subject',
        preview: (purpose || body).slice(0, 60),
        data: { body, tone, purpose, subjects: data.subjects },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [body, tone, purpose, saveEntry]);

  const handleCopy = (text: string, i: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* Purpose (optional) */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          Email purpose <span className="font-normal text-slate-400">(optional — helps generate better subjects)</span>
        </label>
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Following up on a proposal, announcing a product launch…"
            className="flex-1 rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
          />
          <VoiceInput onResult={(t) => setPurpose((p) => p ? p + ' ' + t : t)} />
        </div>
      </div>

      {/* Body */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-slate-500">Email body</label>
          <VoiceInput onResult={(t) => setBody((b) => b ? b + ' ' + t : t)} />
        </div>
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste your full email body here…"
            rows={6}
            maxLength={3000}
            className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all pr-8"
          />
          {body && (
            <button
              onClick={() => { setBody(''); setSubjects([]); setShowResults(false); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className={`text-xs mt-1.5 text-right ${body.length > 2700 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
          {body.length} / 3000
        </p>
      </div>

      {/* Tone */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-3">Subject tone</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all chip-btn ${
                tone === t.id ? 'chip-active' : 'border-slate-200 text-slate-600'
              }`}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">{error}</div>
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
            Generating subject lines…
          </span>
        ) : 'Generate subject lines'}
      </button>

      {loading && (
        <div className="space-y-3">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className="skeleton h-14 w-full" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      )}

      {showResults && subjects.length > 0 && (
        <div className="space-y-2.5 fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-700">Subject line options</h2>
            <span className="text-xs text-slate-400">5 different angles</span>
          </div>
          {subjects.map((s, i) => {
            const meta = STRATEGIES[i] ?? STRATEGIES[0];
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/70 p-4 result-card transition-all duration-200 fade-in-up"
                style={{ animationDelay: `${i * 0.07}s`, boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded border whitespace-nowrap mt-0.5 ${meta.color}`}>
                    {meta.label}
                  </span>
                  <p className="flex-1 text-sm text-slate-800 font-medium leading-snug">{s}</p>
                </div>
                {/* Char count + actions */}
                <div className="flex items-center justify-between mt-2.5 pl-1">
                  <span className={`text-[10px] font-medium ${s.length > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {s.length} chars {s.length > 60 ? '⚠️' : '✓'}
                  </span>
                  <div className="flex items-center gap-1">
                    <SpeakButton text={s} />
                    <ShareButton text={s} title="Email Subject" />
                    <button
                      onClick={() => handleCopy(s, i)}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                        copied === i
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {copied === i ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
