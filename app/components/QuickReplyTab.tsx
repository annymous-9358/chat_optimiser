'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

const RELATIONSHIPS = [
  { id: 'boss',      label: 'Boss' },
  { id: 'colleague', label: 'Colleague' },
  { id: 'friend',    label: 'Friend' },
  { id: 'partner',   label: 'Partner' },
  { id: 'family',    label: 'Family' },
  { id: 'client',    label: 'Client' },
];

const APPROACH_LABELS = ['Agreeable', 'Neutral', 'Declining'];

function Spin() {
  return (
    <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function QuickReplyTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [received,     setReceived]     = useState('');
  const [relationship, setRelationship] = useState('');
  const [context,      setContext]      = useState('');
  const [replies,      setReplies]      = useState<string[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [copied,       setCopied]       = useState<number | null>(null);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setReceived((d.receivedMessage as string) ?? '');
    setRelationship((d.relationship as string) ?? '');
    setContext((d.context as string) ?? '');
    setReplies((d.replies as string[]) ?? []);
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleGenerate = useCallback(async () => {
    if (!received.trim()) { setError('Paste the message you received.'); return; }
    if (!relationship) { setError('Select your relationship with the sender.'); return; }
    setError(''); setLoading(true); setReplies([]);
    try {
      const res = await fetch('/api/quick-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receivedMessage: received, relationship, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setReplies(data.replies);
      const rel = RELATIONSHIPS.find(r => r.id === relationship);
      saveEntry({
        type: 'quickreply', emoji: '', label: rel?.label ?? relationship,
        preview: received.slice(0, 60),
        data: { receivedMessage: received, relationship, context, replies: data.replies },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [received, relationship, context, saveEntry]);

  return (
    <div className="tc-view">
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--tc-text)', letterSpacing: '-.3px', marginBottom: 4 }}>Quick Reply</h1>
        <p style={{ fontSize: 13, color: 'var(--tc-sec)', lineHeight: 1.6 }}>Generate three contextual replies — agreeable, neutral, or declining — for any message.</p>
      </div>

      <div>
        <div className="tc-label">Message received</div>
        <textarea
          className="tc-textarea"
          rows={4}
          value={received}
          onChange={e => setReceived(e.target.value)}
          placeholder="Paste the message someone sent you…"
        />
      </div>

      <div>
        <div className="tc-label">Who sent it?</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {RELATIONSHIPS.map(r => (
            <button key={r.id} onClick={() => setRelationship(r.id)}
              className={`tc-chip${relationship === r.id ? ' tc-active' : ''}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="tc-label">Context <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
        <input
          type="text"
          className="tc-input"
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder="e.g. deadline is tomorrow, I already said no once…"
        />
      </div>

      {error && (
        <div className="tc-err">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <button onClick={handleGenerate} disabled={loading} className="tc-btn">
        {loading && <Spin />}
        {loading ? 'Generating…' : 'Generate replies'}
      </button>

      {loading && (
        <div className="tc-skeletons">
          {[72, 56, 72].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 0, borderBottom: i < 2 ? '1px solid var(--tc-faint)' : 'none' }} />
          ))}
        </div>
      )}

      {replies.length > 0 && (
        <div>
          <div className="tc-label">Replies</div>
          <div className="tc-result-list">
            {replies.map((r, i) => (
              <div key={i} className="tc-result-row">
                <div style={{ flexShrink: 0, minWidth: 60, paddingTop: 2 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--tc-muted)' }}>{APPROACH_LABELS[i]}</div>
                </div>
                <p style={{ flex: 1, fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0 }}>{r}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(r); setCopied(i); setTimeout(() => setCopied(null), 2000); }}
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
