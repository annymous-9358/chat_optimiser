'use client';

import { useState, useCallback } from 'react';
import { useHistory } from '../context/HistoryContext';
import VoiceInput  from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

const TONES = [
  { id: 'professional', label: 'Professional', emoji: '🏢' },
  { id: 'friendly',     label: 'Friendly',     emoji: '😊' },
  { id: 'casual',       label: 'Casual',        emoji: '💬' },
  { id: 'persuasive',   label: 'Persuasive',   emoji: '🎯' },
  { id: 'urgent',       label: 'Urgent',        emoji: '⚡' },
  { id: 'empathetic',   label: 'Empathetic',   emoji: '🤗' },
  { id: 'assertive',    label: 'Assertive',     emoji: '💪' },
  { id: 'apologetic',   label: 'Apologetic',   emoji: '🙏' },
];

const LENGTHS = [
  { id: 'brief',    label: 'Brief',    desc: '2–3 paragraphs', emoji: '⚡' },
  { id: 'standard', label: 'Standard', desc: '3–4 paragraphs', emoji: '📝' },
  { id: 'detailed', label: 'Detailed', desc: '5–6 paragraphs', emoji: '📄' },
];

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
        copied
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

export default function EmailWriterTab() {
  const { saveEntry } = useHistory();

  const [purpose,       setPurpose]       = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientRole, setRecipientRole] = useState('');
  const [senderName,    setSenderName]    = useState('');
  const [keyPoints,     setKeyPoints]     = useState('');
  const [tone,          setTone]          = useState('professional');
  const [length,        setLength]        = useState('standard');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [result,        setResult]        = useState<{ subject: string; body: string } | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!purpose.trim()) { setError('Describe what this email is about.'); return; }
    setError(''); setLoading(true); setResult(null);

    try {
      const res = await fetch('/api/email-writer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          purpose, recipientName, recipientRole, senderName, keyPoints, tone, length,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult({ subject: data.subject, body: data.body });
      saveEntry({
        type:    'emailwriter',
        emoji:   '✉️',
        label:   purpose.slice(0, 40),
        preview: data.subject,
        data:    { purpose, recipientName, recipientRole, senderName, keyPoints, tone, length, subject: data.subject, body: data.body },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [purpose, recipientName, recipientRole, senderName, keyPoints, tone, length, saveEntry]);

  const fullEmail = result ? `Subject: ${result.subject}\n\n${result.body}` : '';

  return (
    <div className="space-y-4">

      {/* Purpose */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-500">
            What is this email about? <span className="text-red-400">*</span>
          </label>
          <VoiceInput onResult={(t) => setPurpose((p) => p ? p + ' ' + t : t)} disabled={loading} />
        </div>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g. Following up on a job application I sent 2 weeks ago and asking for an update…"
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
        />
        <p className={`text-xs text-right mt-1 ${purpose.length > 450 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
          {purpose.length} / 500
        </p>
      </div>

      {/* Recipient + Sender */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <p className="text-xs font-medium text-slate-500 mb-3">Who's involved? <span className="font-normal text-slate-400">(optional — helps personalise)</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Recipient name</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Sarah, Mr. Patel…"
              className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Recipient role / relation</label>
            <input
              type="text"
              value={recipientRole}
              onChange={(e) => setRecipientRole(e.target.value)}
              placeholder="e.g. Hiring Manager, Boss…"
              className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Your name (sign-off)</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Kunik, Alex…"
              className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Key points */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-500">
            Key points to include <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <VoiceInput onResult={(t) => setKeyPoints((k) => k ? k + ' ' + t : t)} disabled={loading} />
        </div>
        <textarea
          value={keyPoints}
          onChange={(e) => setKeyPoints(e.target.value)}
          placeholder="• Interview was on Monday&#10;• Role: Senior Designer&#10;• Very interested, ready to start asap"
          rows={3}
          maxLength={600}
          className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
        />
      </div>

      {/* Tone */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-3">Tone</label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-center transition-all chip-btn ${
                tone === t.id ? 'chip-active' : ''
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              <span className={`text-[10px] font-semibold leading-tight ${tone === t.id ? 'text-indigo-700' : 'text-slate-600'}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Length */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-3">Length</label>
        <div className="grid grid-cols-3 gap-2">
          {LENGTHS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLength(l.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-center transition-all chip-btn ${
                length === l.id ? 'chip-active' : ''
              }`}
            >
              <span className="text-xl">{l.emoji}</span>
              <span className={`text-[12px] font-semibold ${length === l.id ? 'text-indigo-700' : 'text-slate-700'}`}>{l.label}</span>
              <span className="text-[10px] text-slate-400">{l.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
            Writing your email…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Write email
          </span>
        )}
      </button>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-40 w-full" style={{ animationDelay: '0.1s' }} />
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="space-y-3 fade-in-up">

          {/* Subject line */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Subject line</span>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-medium ${result.subject.length > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {result.subject.length} chars
                </span>
                <SpeakButton text={result.subject} />
                <CopyButton text={result.subject} label="Copy subject" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-800">{result.subject}</p>
          </div>

          {/* Email body */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Email body</span>
              <div className="flex items-center gap-1">
                <SpeakButton text={result.body} />
                <ShareButton text={result.body} />
                <CopyButton text={result.body} label="Copy body" />
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.body}</p>
          </div>

          {/* Copy full email */}
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200/70 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <span className="text-xs font-medium text-indigo-700">Copy subject + body together</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShareButton text={fullEmail} title="Email" />
              <CopyButton text={fullEmail} label="Copy full email" />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            ✏️ Personalise before sending — AI output is a starting point, not a final draft
          </p>
        </div>
      )}
    </div>
  );
}
