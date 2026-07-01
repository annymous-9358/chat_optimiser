'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

const STRATEGIES = ['Direct', 'Question', 'Benefit', 'Conversational', 'Intriguing'];

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual',       label: 'Casual' },
  { id: 'urgent',       label: 'Urgent' },
  { id: 'curious',      label: 'Curious' },
  { id: 'friendly',     label: 'Friendly' },
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

export default function EmailSubjectTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [body,     setBody]     = useState('');
  const [purpose,  setPurpose]  = useState('');
  const [tone,     setTone]     = useState('professional');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [copied,   setCopied]   = useState<number | null>(null);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setBody((d.body as string) ?? '');
    setPurpose((d.purpose as string) ?? '');
    setTone((d.tone as string) ?? 'professional');
    setSubjects((d.subjects as string[]) ?? []);
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleGenerate = useCallback(async () => {
    if (!body.trim()) { setError('Paste your email body first.'); return; }
    setError(''); setLoading(true); setSubjects([]);
    try {
      const res = await fetch('/api/email-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, tone, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSubjects(data.subjects);
      saveEntry({
        type: 'emailsubject', emoji: '', label: 'Email Subject',
        preview: (purpose || body).slice(0, 60),
        data: { body, tone, purpose, subjects: data.subjects },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [body, tone, purpose, saveEntry]);

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Email Subject</h1>
        <p className="tc-desc">Generate five subject lines — each from a different angle — for any email.</p>
      </div>

      <div>
        <div className="tc-label">Email purpose <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
        <input className="tc-input" type="text" value={purpose} onChange={e => setPurpose(e.target.value)}
          placeholder="e.g. Following up on a proposal, announcing a product launch…" />
      </div>

      <div>
        <div className="tc-label">Email body</div>
        <div style={{ position: 'relative' }}>
          <textarea
            className="tc-textarea"
            rows={6}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Paste your full email body here…"
            maxLength={3000}
          />
          {body && (
            <button onClick={() => { setBody(''); setSubjects([]); }}
              style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 4, border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tc-muted)' }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: body.length > 2700 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{body.length} / 3000</span>
        </div>
      </div>

      <div>
        <div className="tc-label">Subject tone</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TONES.map(t => (
            <button key={t.id} onClick={() => setTone(t.id)} className={`tc-chip${tone === t.id ? ' tc-active' : ''}`}>{t.label}</button>
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
        {loading ? 'Generating…' : 'Generate subject lines'}
      </button>

      {loading && (
        <div className="tc-skeletons">
          {[48, 48, 48, 48, 48].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 0, borderBottom: i < 4 ? '1px solid var(--tc-faint)' : 'none' }} />
          ))}
        </div>
      )}

      {subjects.length > 0 && (
        <div>
          <div className="tc-label">Subject lines</div>
          <div className="tc-result-list">
            {subjects.map((s, i) => (
              <div key={i} className="tc-result-row" style={{ alignItems: 'center' }}>
                <div style={{ flexShrink: 0, minWidth: 72 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--tc-muted)' }}>{STRATEGIES[i]}</span>
                </div>
                <p style={{ flex: 1, fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{s}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: s.length > 60 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{s.length}</span>
                  <button onClick={() => { navigator.clipboard.writeText(s); setCopied(i); setTimeout(() => setCopied(null), 2000); }}
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
