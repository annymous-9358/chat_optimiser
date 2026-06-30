'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly',     label: 'Friendly' },
  { id: 'casual',       label: 'Casual' },
  { id: 'persuasive',   label: 'Persuasive' },
  { id: 'urgent',       label: 'Urgent' },
  { id: 'empathetic',   label: 'Empathetic' },
  { id: 'assertive',    label: 'Assertive' },
  { id: 'apologetic',   label: 'Apologetic' },
];

const LENGTHS = [
  { id: 'brief',    label: 'Brief',    desc: '2–3 paragraphs' },
  { id: 'standard', label: 'Standard', desc: '3–4 paragraphs' },
  { id: 'detailed', label: 'Detailed', desc: '5–6 paragraphs' },
];

function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      className={`tc-copy${copied ? ' copied' : ''}`} style={{ opacity: 1, fontSize: 12, padding: '5px 12px' }}>
      {copied ? 'Copied' : label}
    </button>
  );
}

function Spin() {
  return (
    <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function EmailWriterTab({ loadSession, onSessionLoaded }: Props) {
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

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setPurpose((d.purpose as string) ?? '');
    setRecipientName((d.recipientName as string) ?? '');
    setRecipientRole((d.recipientRole as string) ?? '');
    setSenderName((d.senderName as string) ?? '');
    setKeyPoints((d.keyPoints as string) ?? '');
    setTone((d.tone as string) ?? 'professional');
    setLength((d.length as string) ?? 'standard');
    if (d.subject && d.body) setResult({ subject: d.subject as string, body: d.body as string });
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleGenerate = useCallback(async () => {
    if (!purpose.trim()) { setError('Describe what this email is about.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/email-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, recipientName, recipientRole, senderName, keyPoints, tone, length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult({ subject: data.subject, body: data.body });
      saveEntry({
        type: 'emailwriter', emoji: '', label: purpose.slice(0, 40),
        preview: data.subject,
        data: { purpose, recipientName, recipientRole, senderName, keyPoints, tone, length, subject: data.subject, body: data.body },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [purpose, recipientName, recipientRole, senderName, keyPoints, tone, length, saveEntry]);

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Email Writer</h1>
        <p className="tc-desc">Generate a complete email — subject line and body — from a brief description.</p>
      </div>

      <div>
        <div className="tc-label">What is this email about?</div>
        <textarea
          className="tc-textarea"
          rows={3}
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          placeholder="e.g. Following up on a job application I sent 2 weeks ago and asking for an update…"
          maxLength={500}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: purpose.length > 450 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{purpose.length} / 500</span>
        </div>
      </div>

      <div>
        <div className="tc-label">Who's involved? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--tc-muted)', marginBottom: 5 }}>Recipient name</div>
            <input className="tc-input" type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="e.g. Sarah…" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--tc-muted)', marginBottom: 5 }}>Recipient role</div>
            <input className="tc-input" type="text" value={recipientRole} onChange={e => setRecipientRole(e.target.value)} placeholder="e.g. Hiring Manager…" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--tc-muted)', marginBottom: 5 }}>Your name</div>
            <input className="tc-input" type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="e.g. Kunik…" />
          </div>
        </div>
      </div>

      <div>
        <div className="tc-label">Key points to include <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
        <textarea
          className="tc-textarea"
          rows={3}
          value={keyPoints}
          onChange={e => setKeyPoints(e.target.value)}
          placeholder={"• Interview was on Monday\n• Role: Senior Designer\n• Very interested, ready to start asap"}
          maxLength={600}
        />
      </div>

      <div>
        <div className="tc-label">Tone</div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }} className="scrollbar-hide">
          {TONES.map(t => (
            <button key={t.id} onClick={() => setTone(t.id)} className={`tc-chip${tone === t.id ? ' tc-active' : ''}`}>{t.label}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="tc-label">Length</div>
        <div style={{ display: 'flex', gap: 8 }}>
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

      {error && (
        <div className="tc-err">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <button onClick={handleGenerate} disabled={loading} className="tc-btn">
        {loading && <Spin />}
        {loading ? 'Writing your email…' : 'Write email'}
      </button>

      {loading && (
        <div className="tc-skeletons">
          {[40, 160].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 0, borderBottom: i < 1 ? '1px solid var(--tc-faint)' : 'none' }} />
          ))}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="tc-label" style={{ marginBottom: 0 }}>Subject line</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: result.subject.length > 60 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{result.subject.length} chars</span>
                <CopyBtn text={result.subject} label="Copy subject" />
              </div>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--tc-text)', margin: 0 }}>{result.subject}</p>
          </div>

          <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="tc-label" style={{ marginBottom: 0 }}>Email body</div>
              <CopyBtn text={result.body} label="Copy body" />
            </div>
            <p style={{ fontSize: 14, color: 'var(--tc-text)', lineHeight: 1.72, margin: 0, whiteSpace: 'pre-line' }}>{result.body}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--tc-border)', borderRadius: 8, padding: '12px 16px', background: 'var(--tc-chip)' }}>
            <span style={{ fontSize: 12, color: 'var(--tc-sec)' }}>Copy subject + body together</span>
            <CopyBtn text={`Subject: ${result.subject}\n\n${result.body}`} label="Copy full email" />
          </div>
        </div>
      )}
    </div>
  );
}
