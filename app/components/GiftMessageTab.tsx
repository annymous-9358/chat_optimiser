'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

const OCCASIONS = [
  'Birthday', 'Anniversary', 'Wedding', 'Christmas',
  'New Year', 'Graduation', 'Thank you', 'Congratulations',
  'Get well soon', 'New baby', 'Farewell', 'Custom',
];

const RELATIONSHIPS = [
  'Partner / Spouse', 'Best friend', 'Parent', 'Sibling',
  'Child', 'Close friend', 'Colleague', 'Acquaintance',
];

const STYLES = [
  { id: 'heartfelt', label: 'Heartfelt', desc: 'Warm & sincere' },
  { id: 'witty',     label: 'Witty',     desc: 'Clever & fun' },
  { id: 'short',     label: 'Short',     desc: 'Concise & punchy' },
  { id: 'poetic',    label: 'Poetic',    desc: 'Lyrical & vivid' },
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

export default function GiftMessageTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [recipient,      setRecipient]      = useState('');
  const [occasion,       setOccasion]       = useState('');
  const [customOccasion, setCustomOccasion] = useState('');
  const [relationship,   setRelationship]   = useState('');
  const [personalNote,   setPersonalNote]   = useState('');
  const [style,          setStyle]          = useState('heartfelt');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [messages,       setMessages]       = useState<string[]>([]);
  const [copied,         setCopied]         = useState<number | null>(null);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data as Record<string, unknown>;
    setRecipient((d.recipient as string) ?? '');
    const savedOcc = (d.occasion as string) ?? '';
    if (OCCASIONS.includes(savedOcc)) { setOccasion(savedOcc); }
    else if (savedOcc) { setOccasion('Custom'); setCustomOccasion(savedOcc); }
    setRelationship((d.relationship as string) ?? '');
    setPersonalNote((d.personalNote as string) ?? '');
    setStyle((d.style as string) ?? 'heartfelt');
    setMessages((d.messages as string[]) ?? []);
    onSessionLoaded?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSession]);

  const effectiveOccasion = occasion === 'Custom' ? customOccasion : occasion;

  const handleGenerate = useCallback(async () => {
    if (!effectiveOccasion.trim()) { setError('Select or enter an occasion.'); return; }
    setError(''); setLoading(true); setMessages([]);
    try {
      const res = await fetch('/api/gift-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, occasion: effectiveOccasion, relationship, personalNote, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setMessages(data.messages ?? []);
      saveEntry({
        type: 'giftmessage', emoji: '', label: `${effectiveOccasion}${recipient ? ` for ${recipient}` : ''}`,
        preview: data.messages?.[0]?.slice(0, 70) ?? 'Gift message',
        data: { recipient, occasion: effectiveOccasion, relationship, personalNote, style, messages: data.messages },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [effectiveOccasion, recipient, relationship, personalNote, style, saveEntry]);

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Gift Message</h1>
        <p className="tc-desc">Write a heartfelt, witty, or poetic message for any occasion and recipient.</p>
      </div>

      <div>
        <div className="tc-label">Recipient name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
        <input className="tc-input" type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="e.g. Mum, Rahul, Sarah…" />
      </div>

      <div>
        <div className="tc-label">Occasion</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {OCCASIONS.map(o => (
            <button key={o} onClick={() => { setOccasion(o); if (o !== 'Custom') setCustomOccasion(''); }}
              className={`tc-chip${occasion === o ? ' tc-active' : ''}`}>{o}</button>
          ))}
        </div>
        {occasion === 'Custom' && (
          <input autoFocus className="tc-input" style={{ marginTop: 10 }} type="text" value={customOccasion}
            onChange={e => setCustomOccasion(e.target.value)} placeholder="Describe the occasion…" />
        )}
      </div>

      <div>
        <div className="tc-label">Relationship <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {RELATIONSHIPS.map(r => (
            <button key={r} onClick={() => setRelationship(prev => prev === r ? '' : r)}
              className={`tc-chip${relationship === r ? ' tc-active' : ''}`}>{r}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="tc-label">Style</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setStyle(s.id)}
              style={{
                display: 'flex', flexDirection: 'column', gap: 3,
                padding: '12px 10px', borderRadius: 6, textAlign: 'center',
                border: `1px solid ${style === s.id ? 'var(--tc-accent)' : 'var(--tc-border)'}`,
                background: style === s.id ? 'var(--tc-accent)' : 'var(--tc-chip)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .1s',
              }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: style === s.id ? 'var(--tc-on)' : 'var(--tc-text)' }}>{s.label}</span>
              <span style={{ fontSize: 10, color: style === s.id ? 'rgba(255,255,255,0.6)' : 'var(--tc-muted)' }}>{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="tc-label">What to say <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
        <textarea
          className="tc-textarea"
          rows={3}
          value={personalNote}
          onChange={e => setPersonalNote(e.target.value)}
          placeholder="e.g. Thank them for always being there, mention how much they mean…"
          maxLength={300}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: personalNote.length > 260 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{personalNote.length} / 300</span>
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
          {[80, 80, 80].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 0, borderBottom: i < 2 ? '1px solid var(--tc-faint)' : 'none' }} />
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div>
          <div className="tc-label">Messages</div>
          <div className="tc-result-list">
            {messages.map((msg, i) => (
              <div key={i} className="tc-result-row">
                <div style={{ flexShrink: 0, minWidth: 28, paddingTop: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--tc-muted)' }}>{i + 1}</span>
                </div>
                <p style={{ flex: 1, fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{msg}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(msg); setCopied(i); setTimeout(() => setCopied(null), 2000); }}
                  className={`tc-copy${copied === i ? ' copied' : ''}`}>
                  {copied === i ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
