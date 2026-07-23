'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';
import VoiceInput from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

const TONES = [
  { id: 'professional_formal',         label: 'Pro Formal' },
  { id: 'professional_conversational',  label: 'Pro Casual' },
  { id: 'professional_group',           label: 'Team / Group' },
  { id: 'love_romantic',               label: 'Romantic' },
  { id: 'friend_chat',                 label: 'Friend' },
  { id: 'casual',                      label: 'Casual' },
  { id: 'empathetic',                  label: 'Empathetic' },
  { id: 'witty_humorous',              label: 'Witty' },
  { id: 'assertive',                   label: 'Assertive' },
  { id: 'apologetic',                  label: 'Apologetic' },
];

const APPROACH_LABELS = ['Direct', 'Natural', 'Creative'];

function Spin() {
  return (
    <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function RephraseTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setMessage((d.message as string) ?? '');
    setTone((d.tone as string) ?? '');
    setSuggestions((d.suggestions as string[]) ?? []);
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleRephrase = useCallback(async () => {
    if (!message.trim()) { setError('Enter a message to rephrase.'); return; }
    if (!tone) { setError('Select a tone first.'); return; }
    setError(''); setLoading(true); setSuggestions([]);
    try {
      const res = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSuggestions(data.suggestions);
      const t = TONES.find(x => x.id === tone);
      saveEntry({
        type: 'rephrase', emoji: '', label: t?.label ?? tone,
        preview: message.slice(0, 60),
        data: { message, tone, suggestions: data.suggestions },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [message, tone, saveEntry]);

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Rephrase</h1>
        <p className="tc-desc">Rewrite any message in the tone that fits your relationship and context.</p>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="tc-label" style={{ marginBottom: 0 }}>Message</div>
          <VoiceInput onResult={(t) => setMessage(m => m ? m + ' ' + t : t)} disabled={loading} />
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            className="tc-textarea"
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleRephrase(); }}
            placeholder="Paste or type the message you want to rephrase…"
            maxLength={1000}
          />
          {message && (
            <button
              onClick={() => { setMessage(''); setSuggestions([]); }}
              style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 4, border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tc-muted)' }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--tc-muted)' }}>Cmd + Enter to rephrase</span>
          <span style={{ fontSize: 11, color: message.length > 900 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{message.length} / 1000</span>
        </div>
      </div>

      <div>
        <div className="tc-label">Tone</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TONES.map(tn => (
            <button key={tn.id} onClick={() => setTone(tn.id)}
              className={`tc-chip${tone === tn.id ? ' tc-active' : ''}`}>
              {tn.label}
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

      <button onClick={handleRephrase} disabled={loading} className="tc-btn">
        {loading && <Spin />}
        {loading ? 'Rephrasing…' : 'Rephrase message'}
      </button>

      {loading && (
        <div className="tc-skeletons">
          {[80, 64, 72].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 0, borderBottom: i < 2 ? '1px solid var(--tc-faint)' : 'none' }} />
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <div className="tc-label">Results</div>
          <div className="tc-result-list">
            {suggestions.map((s, i) => (
              <div key={i} className="tc-result-row">
                <div style={{ flexShrink: 0, minWidth: 52, paddingTop: 2 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--tc-muted)' }}>{APPROACH_LABELS[i]}</div>
                  <div style={{ fontSize: 11, color: 'var(--tc-muted)', marginTop: 1 }}>{i + 1}</div>
                </div>
                <p style={{ flex: 1, fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0 }}>{s}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <SpeakButton text={s} />
                  <ShareButton text={s} title="Convey" />
                  <button
                    onClick={() => { setMessage(s); setSuggestions([]); }}
                    title="Use this as the new input"
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 4, border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', color: 'var(--tc-sec)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    Use as input
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(s); setCopied(i); setTimeout(() => setCopied(null), 2000); }}
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
