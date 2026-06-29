'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

const ACTIONS = [
  { id: 'shorten', label: 'Shorten',       desc: 'Cut the fluff' },
  { id: 'expand',  label: 'Expand',        desc: 'Add more detail' },
  { id: 'fix',     label: 'Fix Grammar',   desc: 'Fix spelling & grammar' },
  { id: 'punchy',  label: 'Make Punchier', desc: 'Stronger & snappier' },
  { id: 'emojis',  label: 'Add Emojis',   desc: 'Express more' },
  { id: 'strip',   label: 'Strip Emojis', desc: 'Clean text only' },
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

export default function PolishTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [message,      setMessage]      = useState('');
  const [activeAction, setActiveAction] = useState('');
  const [result,       setResult]       = useState('');
  const [loading,      setLoading]      = useState<string | null>(null);
  const [error,        setError]        = useState('');
  const [copied,       setCopied]       = useState(false);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setMessage((d.message as string) ?? '');
    setActiveAction((d.action as string) ?? '');
    setResult((d.result as string) ?? '');
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const runAction = useCallback(async (actionId: string) => {
    if (!message.trim()) { setError('Enter a message first.'); return; }
    setError(''); setLoading(actionId); setActiveAction(actionId); setResult('');
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, action: actionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data.result);
      const action = ACTIONS.find(a => a.id === actionId);
      saveEntry({
        type: 'polish', emoji: '', label: action?.label ?? actionId,
        preview: message.slice(0, 60),
        data: { message, action: actionId, result: data.result },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(null); }
  }, [message, saveEntry]);

  const isActive = (id: string) => activeAction === id && !!result;

  return (
    <div className="tc-view">
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--tc-text)', letterSpacing: '-.3px', marginBottom: 4 }}>Polish</h1>
        <p style={{ fontSize: 13, color: 'var(--tc-sec)', lineHeight: 1.6 }}>Transform your message — shorten, expand, fix grammar, or add punch.</p>
      </div>

      <div>
        <div className="tc-label">Message</div>
        <div style={{ position: 'relative' }}>
          <textarea
            className="tc-textarea"
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Paste your message, then pick a transform below…"
          />
          {message && (
            <button
              onClick={() => { setMessage(''); setResult(''); setActiveAction(''); }}
              style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 4, border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tc-muted)' }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="tc-label">Transform</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {ACTIONS.map(a => (
            <button
              key={a.id}
              onClick={() => runAction(a.id)}
              disabled={!!loading}
              style={{
                display: 'flex', flexDirection: 'column', gap: 4,
                padding: '12px 14px', borderRadius: 6,
                border: `1px solid ${isActive(a.id) ? 'var(--tc-accent)' : 'var(--tc-border)'}`,
                background: isActive(a.id) ? 'var(--tc-accent)' : 'var(--tc-chip)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading && loading !== a.id ? 0.5 : 1,
                transition: 'all .1s', textAlign: 'left', fontFamily: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {loading === a.id && <Spin />}
                <span style={{ fontSize: 12, fontWeight: 500, color: isActive(a.id) ? 'var(--tc-on)' : 'var(--tc-text)' }}>{a.label}</span>
              </div>
              <span style={{ fontSize: 11, color: isActive(a.id) ? 'rgba(255,255,255,0.6)' : 'var(--tc-muted)', lineHeight: 1.4 }}>{a.desc}</span>
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

      {result && (
        <div>
          <div className="tc-label">Result</div>
          <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
            <p style={{ fontSize: 14, color: 'var(--tc-text)', lineHeight: 1.72, margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-geist-mono), monospace' }}>{result}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setMessage(result); setResult(''); setActiveAction(''); }}
                style={{ fontSize: 12, padding: '5px 12px', borderRadius: 4, border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', color: 'var(--tc-sec)', cursor: 'pointer', fontFamily: 'inherit' }}>
                Use as input
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className={`tc-copy${copied ? ' copied' : ''}`}
                style={{ opacity: 1 }}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
