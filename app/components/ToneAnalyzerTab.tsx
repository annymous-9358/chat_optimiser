'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

type Analysis = {
  primary: string;
  scores: Record<string, number>;
  verdict: string;
  tips: string[];
  tags: string[];
};

const SCORE_META: Record<string, { label: string }> = {
  professional: { label: 'Professional' },
  casual:       { label: 'Casual' },
  emotional:    { label: 'Emotional' },
  assertive:    { label: 'Assertive' },
  empathetic:   { label: 'Empathetic' },
  formal:       { label: 'Formal' },
};

function Spin() {
  return (
    <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function ToneAnalyzerTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [message,  setMessage]  = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [animate,  setAnimate]  = useState(false);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setMessage((d.message as string) ?? '');
    if (d.analysis) {
      setAnalysis(d.analysis as Analysis);
      setTimeout(() => setAnimate(true), 50);
    }
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleAnalyze = useCallback(async () => {
    if (!message.trim()) { setError('Enter a message to analyze.'); return; }
    setError(''); setLoading(true); setAnimate(false); setAnalysis(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setAnalysis(data.analysis);
      setTimeout(() => setAnimate(true), 50);
      saveEntry({
        type: 'analyzer', emoji: '', label: data.analysis.primary,
        preview: message.slice(0, 60),
        data: { message, analysis: data.analysis },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [message, saveEntry]);

  return (
    <div className="tc-view">
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--tc-text)', letterSpacing: '-.3px', marginBottom: 4 }}>Tone Analyzer</h1>
        <p style={{ fontSize: 13, color: 'var(--tc-sec)', lineHeight: 1.6 }}>Understand the emotional tone and communication style of any message.</p>
      </div>

      <div>
        <div className="tc-label">Message to analyse</div>
        <textarea
          className="tc-textarea"
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Paste any message to see what tone it's giving off…"
        />
      </div>

      {error && (
        <div className="tc-err">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <button onClick={handleAnalyze} disabled={loading} className="tc-btn">
        {loading && <Spin />}
        {loading ? 'Analysing…' : 'Analyse tone'}
      </button>

      {loading && (
        <div className="tc-skeletons">
          {[80, 120, 100].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 0, borderBottom: i < 2 ? '1px solid var(--tc-faint)' : 'none' }} />
          ))}
        </div>
      )}

      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Primary + verdict */}
          <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <div className="tc-label" style={{ marginBottom: 0 }}>Primary tone</div>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 4, border: '1px solid var(--tc-border)', background: 'var(--tc-accent)', color: 'var(--tc-on)' }}>
                {analysis.primary}
              </span>
              {analysis.tags?.map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', color: 'var(--tc-sec)' }}>{tag}</span>
              ))}
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0 }}>{analysis.verdict}</p>
          </div>

          {/* Score bars */}
          <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
            <div className="tc-label">Tone breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(analysis.scores)
                .sort(([, a], [, b]) => b - a)
                .map(([key, score]) => {
                  const meta = SCORE_META[key];
                  if (!meta) return null;
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--tc-text)' }}>{meta.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{score}%</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--tc-faint)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 2, background: 'var(--tc-accent)', transition: 'width .7s ease', width: animate ? `${Math.min(score, 100)}%` : '0%' }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Tips */}
          {analysis.tips?.length > 0 && (
            <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
              <div className="tc-label">Tips to improve</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysis.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', fontSize: 11, fontWeight: 600, color: 'var(--tc-sec)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</span>
                    <p style={{ fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.6, margin: 0 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
