'use client';

import { useState, useCallback } from 'react';
import { useHistory } from '../context/HistoryContext';
import VoiceInput  from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

// ── Data ──────────────────────────────────────────────────────────────────────
const OCCASIONS = [
  { id: 'Farewell',        emoji: '✈️',  desc: 'Goodbye message' },
  { id: 'Welcome',         emoji: '🤝',  desc: 'Welcoming someone' },
  { id: 'Congratulations', emoji: '🎉',  desc: 'Achievement / win' },
  { id: 'Appreciation',    emoji: '💝',  desc: 'Thank you / recognition' },
  { id: 'Apology',         emoji: '🙏',  desc: 'Sincere sorry' },
  { id: 'Birthday',        emoji: '🎂',  desc: 'Birthday wishes' },
  { id: 'Work Anniversary',emoji: '🏆',  desc: 'Career milestone' },
  { id: 'Retirement',      emoji: '🌅',  desc: 'End of a chapter' },
  { id: 'Promotion',       emoji: '🚀',  desc: 'New role / level up' },
  { id: 'Get Well',        emoji: '💐',  desc: 'Recovery wishes' },
  { id: 'Motivation',      emoji: '💪',  desc: 'Encouragement' },
  { id: 'Holiday Wishes',  emoji: '✨',  desc: 'Season greetings' },
  { id: 'Condolence',      emoji: '🕊️',  desc: 'Sympathy message' },
  { id: 'Custom',          emoji: '✍️',  desc: 'Your own occasion' },
];

const TONES = [
  { id: 'warm',         label: 'Warm',          emoji: '🤗' },
  { id: 'professional', label: 'Professional',  emoji: '💼' },
  { id: 'casual',       label: 'Casual',        emoji: '💬' },
  { id: 'heartfelt',   label: 'Heartfelt',     emoji: '💗' },
  { id: 'humorous',    label: 'Humorous',      emoji: '😄' },
];

const LENGTHS = [
  { id: 'short',   label: 'Quick note',    desc: '2–4 sentences',    emoji: '⚡' },
  { id: 'message', label: 'Message',       desc: '2–3 paragraphs',   emoji: '💬' },
  { id: 'letter',  label: 'Letter/Speech', desc: '4–6 paragraphs',   emoji: '📄' },
];

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, index, copied, onCopy }: { text: string; index: number; copied: number | null; onCopy: (t: string, i: number) => void }) {
  return (
    <button
      onClick={() => onCopy(text, index)}
      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
        copied === index
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50'
      }`}
    >
      {copied === index ? (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OccasionMessageTab() {
  const { saveEntry } = useHistory();

  const [occasion,       setOccasion]       = useState('');
  const [customOccasion, setCustomOccasion] = useState('');
  const [recipient,      setRecipient]      = useState('');
  const [relationship,   setRelationship]   = useState('');
  const [context,        setContext]        = useState('');
  const [tone,           setTone]           = useState('warm');
  const [length,         setLength]         = useState('message');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [messages,       setMessages]       = useState<string[]>([]);
  const [copied,         setCopied]         = useState<number | null>(null);

  const effectiveOccasion = occasion === 'Custom' ? customOccasion : occasion;

  const handleGenerate = useCallback(async () => {
    if (!effectiveOccasion.trim()) { setError('Please select or describe the occasion.'); return; }
    setError(''); setLoading(true); setMessages([]);
    try {
      const res = await fetch('/api/occasion-message', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ occasion, customOccasion, recipient, relationship, context, tone, length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setMessages(data.messages ?? []);

      const occ   = OCCASIONS.find(o => o.id === occasion);
      const toneL = TONES.find(t => t.id === tone)?.label ?? tone;
      const lenL  = LENGTHS.find(l => l.id === length)?.label ?? length;
      saveEntry({
        type:    'occasionmessage',
        emoji:   occ?.emoji ?? '🎊',
        label:   `${effectiveOccasion}${recipient ? ` for ${recipient}` : ''}`,
        preview: data.messages?.[0]?.slice(0, 70) ?? 'Occasion message',
        data:    { occasion: effectiveOccasion, recipient, relationship, context, tone, toneLabel: toneL, length, lengthLabel: lenL, messages: data.messages },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [effectiveOccasion, occasion, customOccasion, recipient, relationship, context, tone, length, saveEntry]);

  const handleCopy = useCallback((text: string, i: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 2200);
    });
  }, []);

  return (
    <div className="space-y-4">

      {/* ── Occasion grid ── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Occasion <span className="text-red-400 normal-case tracking-normal">*</span>
          </label>
          {occasion && (
            <button onClick={() => { setOccasion(''); setCustomOccasion(''); }} className="text-xs text-slate-400 hover:text-slate-600 transition">
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OCCASIONS.map(o => (
            <button
              key={o.id}
              onClick={() => { setOccasion(o.id); if (o.id !== 'Custom') setCustomOccasion(''); }}
              className={`group flex flex-col items-center gap-1.5 rounded-xl border px-2.5 py-3 text-center transition-all duration-150 chip-btn ${
                occasion === o.id ? 'chip-active' : ''
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-150">{o.emoji}</span>
              <span className={`text-[12px] font-semibold leading-tight ${occasion === o.id ? 'text-indigo-700' : 'text-slate-700'}`}>{o.id}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{o.desc}</span>
            </button>
          ))}
        </div>

        {occasion === 'Custom' && (
          <div className="mt-3">
            <input
              autoFocus
              type="text"
              value={customOccasion}
              onChange={e => setCustomOccasion(e.target.value)}
              placeholder="Describe the occasion (e.g. Team launch celebration, End of project…)"
              className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 focus:bg-white transition-all"
            />
          </div>
        )}
      </div>

      {/* ── Recipient + Relationship ── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            For who? <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder="e.g. Priya, the whole team…"
            className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 focus:bg-white transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Your relationship <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={relationship}
            onChange={e => setRelationship(e.target.value)}
            placeholder="e.g. manager, best friend, colleague…"
            className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* ── Length ── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Length</label>
        <div className="grid grid-cols-3 gap-2">
          {LENGTHS.map(l => (
            <button
              key={l.id}
              onClick={() => setLength(l.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-center transition-all duration-150 chip-btn ${
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

      {/* ── Tone ── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tone</label>
        <div className="grid grid-cols-5 gap-2">
          {TONES.map(t => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-1 text-center transition-all duration-150 chip-btn ${
                tone === t.id ? 'chip-active' : ''
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className={`text-[11px] font-semibold leading-tight ${tone === t.id ? 'text-indigo-700' : 'text-slate-700'}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Context ── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            What to say / context
            <span className="text-slate-400 font-normal normal-case tracking-normal ml-1">(optional)</span>
          </label>
          <VoiceInput onResult={(t) => setContext((c) => c ? c + ' ' + t : t)} disabled={loading} />
        </div>
        <textarea
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder={`e.g. "She's been with us 7 years, built the entire design system from scratch, and we'll deeply miss her energy…"`}
          rows={3}
          maxLength={400}
          className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 focus:bg-white transition-all"
        />
        <div className={`text-right text-[11px] mt-1 ${context.length > 360 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
          {context.length} / 400
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2.5">
          <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Writing your message…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate message
          </span>
        )}
      </button>

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="skeleton" style={{ height: length === 'letter' ? '120px' : length === 'message' ? '88px' : '64px', animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {!loading && messages.length > 0 && (
        <div className="space-y-3 fade-in-up">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {messages.length} versions generated
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Personalise before sending
            </div>
          </div>

          {messages.map((msg, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/70 p-5 result-card group transition-all duration-200"
              style={{ boxShadow: 'var(--shadow-card)', animationDelay: `${i * 0.07}s` }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Version {i + 1}
                    {i === 0 ? ' · Direct' : i === 1 ? ' · Alternate angle' : ' · Creative take'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <SpeakButton text={msg} />
                  <ShareButton text={msg} />
                  <CopyBtn text={msg} index={i} copied={copied} onCopy={handleCopy} />
                </div>
              </div>

              {/* Message content */}
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{msg}</p>
            </div>
          ))}

          <p className="text-[11px] text-slate-400 text-center pt-0.5">
            {OCCASIONS.find(o => o.id === occasion)?.emoji ?? '🎊'} All 3 versions saved to your history
          </p>
        </div>
      )}
    </div>
  );
}
