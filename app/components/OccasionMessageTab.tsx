'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';
import VoiceInput from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

const OCCASIONS = [
  { id: 'Farewell',         desc: 'Goodbye message' },
  { id: 'Welcome',          desc: 'Welcoming someone' },
  { id: 'Congratulations',  desc: 'Achievement / win' },
  { id: 'Appreciation',     desc: 'Thank you / recognition' },
  { id: 'Apology',          desc: 'Sincere sorry' },
  { id: 'Birthday',         desc: 'Birthday wishes' },
  { id: 'Work Anniversary', desc: 'Career milestone' },
  { id: 'Retirement',       desc: 'End of a chapter' },
  { id: 'Promotion',        desc: 'New role / level up' },
  { id: 'Get Well',         desc: 'Recovery wishes' },
  { id: 'Motivation',       desc: 'Encouragement' },
  { id: 'Holiday Wishes',   desc: 'Season greetings' },
  { id: 'Condolence',       desc: 'Sympathy message' },
  { id: 'Custom',           desc: 'Your own occasion' },
];

const TONES = [
  { id: 'warm',         label: 'Warm' },
  { id: 'professional', label: 'Professional' },
  { id: 'casual',       label: 'Casual' },
  { id: 'heartfelt',    label: 'Heartfelt' },
  { id: 'humorous',     label: 'Humorous' },
];

const LENGTHS = [
  { id: 'short',   label: 'Quick note',    desc: '2–4 sentences' },
  { id: 'message', label: 'Message',       desc: '2–3 paragraphs' },
  { id: 'letter',  label: 'Letter / Speech', desc: '4–6 paragraphs' },
];

function Spin() {
  return (
    <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function OccasionMessageTab({ loadSession, onSessionLoaded }: Props) {
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

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data as Record<string, unknown>;
    const savedOcc = (d.occasion as string) ?? '';
    if (OCCASIONS.some(o => o.id === savedOcc)) { setOccasion(savedOcc); }
    else if (savedOcc) { setOccasion('Custom'); setCustomOccasion(savedOcc); }
    setRecipient((d.recipient as string) ?? '');
    setRelationship((d.relationship as string) ?? '');
    setContext((d.context as string) ?? '');
    setTone((d.tone as string) ?? 'warm');
    setLength((d.length as string) ?? 'message');
    setMessages((d.messages as string[]) ?? []);
    onSessionLoaded?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSession]);

  const effectiveOccasion = occasion === 'Custom' ? customOccasion : occasion;

  const handleGenerate = useCallback(async () => {
    if (!effectiveOccasion.trim()) { setError('Select or describe the occasion.'); return; }
    setError(''); setLoading(true); setMessages([]);
    try {
      const res = await fetch('/api/occasion-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasion, customOccasion, recipient, relationship, context, tone, length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setMessages(data.messages ?? []);
      saveEntry({
        type: 'occasionmessage', emoji: '', label: `${effectiveOccasion}${recipient ? ` for ${recipient}` : ''}`,
        preview: data.messages?.[0]?.slice(0, 70) ?? 'Occasion message',
        data: { occasion: effectiveOccasion, recipient, relationship, context, tone, length, messages: data.messages },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [effectiveOccasion, occasion, customOccasion, recipient, relationship, context, tone, length, saveEntry]);

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Occasion Message</h1>
        <p className="tc-desc">Generate warm, professional, or heartfelt messages for any occasion.</p>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="tc-label" style={{ marginBottom: 0 }}>Occasion</div>
          {occasion && (
            <button onClick={() => { setOccasion(''); setCustomOccasion(''); }}
              style={{ fontSize: 11, color: 'var(--tc-muted)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>
              Clear
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {OCCASIONS.map(o => (
            <button key={o.id}
              onClick={() => { setOccasion(o.id); if (o.id !== 'Custom') setCustomOccasion(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 6, textAlign: 'left', cursor: 'pointer',
                border: `1px solid ${occasion === o.id ? 'var(--tc-accent)' : 'var(--tc-border)'}`,
                background: occasion === o.id ? 'var(--tc-accent)' : 'var(--tc-chip)',
                transition: 'all .1s', fontFamily: 'inherit',
              }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: occasion === o.id ? 'var(--tc-on)' : 'var(--tc-text)' }}>{o.id}</div>
                <div style={{ fontSize: 10, color: occasion === o.id ? 'rgba(255,255,255,0.6)' : 'var(--tc-muted)' }}>{o.desc}</div>
              </div>
            </button>
          ))}
        </div>
        {occasion === 'Custom' && (
          <input autoFocus className="tc-input" style={{ marginTop: 10 }} type="text" value={customOccasion}
            onChange={e => setCustomOccasion(e.target.value)} placeholder="Describe the occasion…" />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div className="tc-label">For who? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
          <input className="tc-input" type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="e.g. Priya, the team…" />
        </div>
        <div>
          <div className="tc-label">Relationship <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
          <input className="tc-input" type="text" value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="e.g. manager, colleague…" />
        </div>
      </div>

      <div>
        <div className="tc-label">Tone</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TONES.map(t => (
            <button key={t.id} onClick={() => setTone(t.id)} className={`tc-chip${tone === t.id ? ' tc-active' : ''}`}>{t.label}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="tc-label">Length</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {LENGTHS.map(l => (
            <button key={l.id} onClick={() => setLength(l.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', gap: 3,
                padding: '10px 8px', borderRadius: 6, textAlign: 'center', cursor: 'pointer',
                border: `1px solid ${length === l.id ? 'var(--tc-accent)' : 'var(--tc-border)'}`,
                background: length === l.id ? 'var(--tc-accent)' : 'var(--tc-chip)',
                transition: 'all .1s', fontFamily: 'inherit',
              }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: length === l.id ? 'var(--tc-on)' : 'var(--tc-text)' }}>{l.label}</span>
              <span style={{ fontSize: 10, color: length === l.id ? 'rgba(255,255,255,0.6)' : 'var(--tc-muted)' }}>{l.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="tc-label" style={{ marginBottom: 0 }}>Context <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
          <VoiceInput onResult={(t) => setContext(c => c ? c + ' ' + t : t)} disabled={loading} />
        </div>
        <textarea
          className="tc-textarea"
          rows={3}
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder={`e.g. "She's been with us 7 years, built the design system, and we'll miss her…"`}
          maxLength={400}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: context.length > 360 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{context.length} / 400</span>
        </div>
      </div>

      {error && (
        <div className="tc-err">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <button onClick={handleGenerate} disabled={loading} className="tc-btn">
        {loading && <Spin />}
        {loading ? 'Writing…' : 'Generate message'}
      </button>

      {loading && (
        <div className="tc-skeletons">
          {[88, 88, 88].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 0, borderBottom: i < 2 ? '1px solid var(--tc-faint)' : 'none' }} />
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div>
          <div className="tc-label">{messages.length} versions</div>
          <div className="tc-result-list">
            {messages.map((msg, i) => (
              <div key={i} className="tc-result-row">
                <div style={{ flexShrink: 0, minWidth: 28, paddingTop: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--tc-muted)' }}>{i + 1}</span>
                </div>
                <p style={{ flex: 1, fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{msg}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <SpeakButton text={msg} />
                  <ShareButton text={msg} title="Convey" />
                  <button
                    onClick={() => { navigator.clipboard.writeText(msg); setCopied(i); setTimeout(() => setCopied(null), 2000); }}
                    className={`tc-copy${copied === i ? ' copied' : ''}`}>
                    {copied === i ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
