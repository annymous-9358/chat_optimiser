'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';
import VoiceInput  from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

// ── Data ──────────────────────────────────────────────────────────────────────
const OCCASIONS = [
  { id: 'Birthday',       emoji: '🎂' },
  { id: 'Anniversary',    emoji: '💑' },
  { id: 'Wedding',        emoji: '💍' },
  { id: 'Christmas',      emoji: '🎄' },
  { id: 'New Year',       emoji: '🎆' },
  { id: 'Graduation',     emoji: '🎓' },
  { id: 'Thank you',      emoji: '🙏' },
  { id: 'Congratulations',emoji: '🎉' },
  { id: 'Get well soon',  emoji: '💐' },
  { id: 'New baby',       emoji: '👶' },
  { id: 'Farewell',       emoji: '✈️' },
  { id: 'Custom',         emoji: '✍️' },
];

const RELATIONSHIPS = [
  { id: 'Partner / Spouse', emoji: '❤️' },
  { id: 'Best friend',      emoji: '🤙' },
  { id: 'Parent',           emoji: '🤱' },
  { id: 'Sibling',          emoji: '👯' },
  { id: 'Child',            emoji: '🧒' },
  { id: 'Close friend',     emoji: '😊' },
  { id: 'Colleague',        emoji: '💼' },
  { id: 'Acquaintance',     emoji: '👋' },
];

const STYLES = [
  { id: 'heartfelt', label: 'Heartfelt',   emoji: '💗', desc: 'Warm & sincere'  },
  { id: 'witty',     label: 'Witty',       emoji: '😄', desc: 'Clever & fun'    },
  { id: 'short',     label: 'Short',       emoji: '✂️',  desc: 'Concise & punchy'},
  { id: 'poetic',    label: 'Poetic',      emoji: '🌸', desc: 'Lyrical & vivid' },
];

// ── Component ─────────────────────────────────────────────────────────────────
type Props = {
  loadSession?: HistoryEntry | null;
  onSessionLoaded?: () => void;
};

export default function GiftMessageTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();

  const [recipient,    setRecipient]    = useState('');
  const [occasion,     setOccasion]     = useState('');
  const [customOccasion, setCustomOccasion] = useState('');
  const [relationship, setRelationship] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [style,        setStyle]        = useState('heartfelt');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [messages,     setMessages]     = useState<string[]>([]);
  const [copied,       setCopied]       = useState<number | null>(null);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data as Record<string, unknown>;
    setRecipient((d.recipient as string) ?? '');
    const savedOccasion = (d.occasion as string) ?? '';
    if (OCCASIONS.some(o => o.id === savedOccasion)) {
      setOccasion(savedOccasion);
      setCustomOccasion('');
    } else if (savedOccasion) {
      setOccasion('Custom');
      setCustomOccasion(savedOccasion);
    }
    setRelationship((d.relationship as string) ?? '');
    setPersonalNote((d.personalNote as string) ?? '');
    setStyle((d.style as string) ?? 'heartfelt');
    setMessages((d.messages as string[]) ?? []);
    onSessionLoaded?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSession]);

  const effectiveOccasion = occasion === 'Custom' ? customOccasion : occasion;

  const handleGenerate = useCallback(async () => {
    if (!effectiveOccasion.trim()) { setError('Please select or enter an occasion.'); return; }
    setError(''); setLoading(true); setMessages([]);

    try {
      const res = await fetch('/api/gift-message', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          recipient,
          occasion:     effectiveOccasion,
          relationship,
          personalNote,
          style,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setMessages(data.messages ?? []);

      const styleLabel = STYLES.find(s => s.id === style)?.label ?? style;
      saveEntry({
        type:    'giftmessage',
        emoji:   OCCASIONS.find(o => o.id === occasion)?.emoji ?? '🎁',
        label:   `${effectiveOccasion}${recipient ? ` for ${recipient}` : ''}`,
        preview: data.messages?.[0]?.slice(0, 70) ?? 'Gift message',
        data:    { recipient, occasion: effectiveOccasion, relationship, personalNote, style, styleLabel, messages: data.messages },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [effectiveOccasion, recipient, relationship, personalNote, style, occasion, saveEntry]);

  const handleCopy = useCallback((text: string, i: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  return (
    <div className="space-y-4">

      {/* Recipient */}
      <div className="bg-white rounded-2xl border border-slate-200/70 px-5 py-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          Recipient name <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="e.g. Mum, Rahul, Sarah…"
          className="w-full rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
        />
      </div>

      {/* Occasion */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-3">
          Occasion <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {OCCASIONS.map(o => (
            <button
              key={o.id}
              onClick={() => { setOccasion(o.id); if (o.id !== 'Custom') setCustomOccasion(''); }}
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-all ${
                occasion === o.id
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-base">{o.emoji}</span>
              <span className="text-[11px] font-medium leading-tight">{o.id}</span>
            </button>
          ))}
        </div>
        {occasion === 'Custom' && (
          <input
            type="text"
            value={customOccasion}
            onChange={e => setCustomOccasion(e.target.value)}
            placeholder="Describe the occasion…"
            autoFocus
            className="mt-3 w-full rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
          />
        )}
      </div>

      {/* Relationship */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-3">
          Your relationship <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RELATIONSHIPS.map(r => (
            <button
              key={r.id}
              onClick={() => setRelationship(prev => prev === r.id ? '' : r.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${
                relationship === r.id
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-base flex-shrink-0">{r.emoji}</span>
              <span className="text-[12px] font-medium leading-tight">{r.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <label className="block text-xs font-medium text-slate-500 mb-3">Message style</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-all ${
                style === s.id
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="text-[12px] font-semibold">{s.label}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Personal note */}
      <div className="bg-white rounded-2xl border border-slate-200/70 px-5 py-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-500">
            What do you want to say? <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <VoiceInput onResult={(t) => setPersonalNote((n) => n ? n + ' ' + t : t)} disabled={loading} />
        </div>
        <textarea
          value={personalNote}
          onChange={e => setPersonalNote(e.target.value)}
          placeholder="e.g. Thank them for always being there, mention how much they mean, reference a shared memory…"
          rows={3}
          maxLength={300}
          className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 focus:bg-white transition-all"
        />
        <div className={`text-right text-[11px] mt-1 ${personalNote.length > 260 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
          {personalNote.length} / 300
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
            Writing your message…
          </span>
        ) : 'Generate gift message'}
      </button>

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="skeleton h-20 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && messages.length > 0 && (
        <div className="space-y-3 fade-in-up">
          <p className="text-xs font-medium text-slate-500 px-1">Pick your favourite</p>
          {messages.map((msg, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/70 p-5 group"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{msg}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <SpeakButton text={msg} />
                  <ShareButton text={msg} />
                  <button
                    onClick={() => handleCopy(msg, i)}
                    className="flex-shrink-0 text-slate-300 hover:text-indigo-600 group-hover:text-slate-400 transition"
                    aria-label="Copy message"
                  >
                    {copied === i ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <p className="text-[11px] text-slate-400 text-center pt-1">
            Feel free to personalise any version before using it 🎁
          </p>
        </div>
      )}
    </div>
  );
}
