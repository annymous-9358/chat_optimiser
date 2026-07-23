'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';
import VoiceInput from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

const LENGTHS = ['Short', 'Medium', 'Detailed'];
const FORMATS = ['Bullets', 'Paragraph'];
const MAX_LEN = 8000;

function Spin() {
  return (
    <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function ChipRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="tc-label">{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            className={`tc-chip${value === o ? ' tc-active' : ''}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

type SummarizeResult = {
  tldr: string;
  summary: string;
  keyPoints: string[];
  wordCountReduction?: string;
};

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function SummarizeTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [text,    setText]    = useState('');
  const [length,  setLength]  = useState('Medium');
  const [format,  setFormat]  = useState('Bullets');
  const [result,  setResult]  = useState<SummarizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setText((d.text as string) ?? '');
    setLength((d.length as string) ?? 'Medium');
    setFormat((d.format as string) ?? 'Bullets');
    setResult((d.result as SummarizeResult) ?? null);
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleSummarize = useCallback(async () => {
    if (!text.trim()) { setError('Paste some text to summarize.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, length, format }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
      saveEntry({
        type: 'summarize', emoji: '', label: length,
        preview: text.slice(0, 60),
        data: { text, length, format, result: data },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [text, length, format, saveEntry]);

  const buildCombinedText = () => {
    if (!result) return '';
    const bulletLines = result.summary
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    const summaryText = format === 'Bullets'
      ? bulletLines.map(l => `• ${l}`).join('\n')
      : result.summary;
    const keyPointsText = result.keyPoints?.length
      ? `\n\nKey points:\n${result.keyPoints.map(k => `• ${k}`).join('\n')}`
      : '';
    return `${result.tldr}\n\n${summaryText}${keyPointsText}`;
  };

  const handleCopy = () => {
    if (!result) return;
    const combined = buildCombinedText();
    navigator.clipboard.writeText(combined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const summaryLines = result?.summary
    ? result.summary.split('\n').map(l => l.trim()).filter(Boolean)
    : [];

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Summarizer</h1>
        <p className="tc-desc">Paste any long text — an article, email thread, meeting transcript, or document — and get a fast, accurate summary.</p>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="tc-label" style={{ marginBottom: 0 }}>Text to summarize</div>
          <VoiceInput onResult={(t) => setText(m => m ? m + ' ' + t : t)} disabled={loading} />
        </div>
        <textarea
          className="tc-textarea"
          rows={8}
          placeholder="Paste an article, email thread, meeting transcript, or any long text here…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSummarize(); }}
          maxLength={MAX_LEN}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--tc-muted)' }}>Cmd + Enter to summarize</span>
          <span style={{ fontSize: 11, color: text.length > MAX_LEN * 0.9 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{text.length} / {MAX_LEN}</span>
        </div>
      </div>

      <ChipRow label="Length" options={LENGTHS} value={length} onChange={setLength} />
      <ChipRow label="Format" options={FORMATS} value={format} onChange={setFormat} />

      {error && <div className="tc-error">{error}</div>}

      <button className="tc-btn" onClick={handleSummarize} disabled={loading} style={{ marginTop: 4 }}>
        {loading && <Spin />}
        {loading ? 'Summarizing…' : '📝 Summarize'}
      </button>

      {result && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="tc-result-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="tc-label" style={{ margin: 0 }}>TL;DR</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <SpeakButton text={buildCombinedText()} />
                <ShareButton text={buildCombinedText()} title="Convey" />
                <button onClick={handleCopy} className="tc-copy-btn">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--tc-text)', lineHeight: 1.6, margin: '0 0 16px' }}>
              {result.tldr}
            </p>

            <div className="tc-label" style={{ marginBottom: 8 }}>Summary</div>
            {format === 'Bullets' ? (
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {summaryLines.map((line, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--tc-text)', lineHeight: 1.65 }}>{line}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                {result.summary}
              </p>
            )}

            {result.wordCountReduction && (
              <p style={{ fontSize: 11, color: 'var(--tc-muted)', marginTop: 12, marginBottom: 0, fontStyle: 'italic' }}>
                {result.wordCountReduction}
              </p>
            )}
          </div>

          {result.keyPoints?.length > 0 && (
            <div className="tc-result-card">
              <div className="tc-label" style={{ marginBottom: 8 }}>Key points</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.keyPoints.map((point, i) => (
                  <li key={i} style={{ fontSize: 12, color: 'var(--tc-sec)', lineHeight: 1.6 }}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
