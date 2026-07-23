'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';
import VoiceInput from './VoiceInput';
import SpeakButton from './SpeakButton';
import ShareButton from './ShareButton';

const LANGUAGES = ['Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese (Simplified)', 'Korean', 'Portuguese', 'Italian', 'Arabic', 'Russian', 'Bengali', 'Tamil', 'Marathi'];
const FORMALITIES = ['Neutral', 'Formal', 'Casual'];

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
          <button key={o} onClick={() => onChange(o === value ? '' : o)}
            className={`tc-chip${value === o ? ' tc-active' : ''}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

type ApiResult = {
  translation: string;
  detectedLanguage: string;
  notes?: string;
};

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function TranslateTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [text,       setText]       = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [formality,  setFormality]  = useState('');
  const [result,     setResult]     = useState<ApiResult | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [copied,     setCopied]     = useState(false);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setText((d.text as string) ?? '');
    setTargetLang((d.targetLang as string) ?? '');
    setFormality((d.formality as string) ?? '');
    setResult((d.result as ApiResult) ?? null);
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleTranslate = useCallback(async () => {
    if (!text.trim()) { setError('Enter some text to translate.'); return; }
    if (!targetLang) { setError('Pick a target language.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang, formality }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
      saveEntry({
        type: 'translate', emoji: '', label: targetLang,
        preview: text.slice(0, 60),
        data: { text, targetLang, formality, result: data },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [text, targetLang, formality, saveEntry]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Translator</h1>
        <p className="tc-desc">Paste text in any language and get a natural, fluent translation — not a robotic word-for-word one.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="tc-label" style={{ marginBottom: 0 }}>Text to translate</div>
        <VoiceInput onResult={(t) => setText(m => m ? m + ' ' + t : t)} disabled={loading} />
      </div>
      <textarea
        className="tc-textarea"
        rows={5}
        maxLength={2000}
        placeholder="Paste or type the text you want translated…"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleTranslate(); }}
      />

      <ChipRow label="Translate to"    options={LANGUAGES}   value={targetLang} onChange={setTargetLang} />
      <ChipRow label="Formality (optional)" options={FORMALITIES} value={formality}  onChange={setFormality} />

      {error && <div className="tc-error">{error}</div>}

      <button className="tc-btn" onClick={handleTranslate} disabled={loading} style={{ marginTop: 4 }}>
        {loading && <Spin />}
        {loading ? 'Translating…' : '🌐 Translate'}
      </button>

      {result && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="tc-result-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="tc-label" style={{ margin: 0 }}>
                Translation
                {result.detectedLanguage && (
                  <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--tc-accent)', border: '1px solid var(--tc-accent)', padding: '1px 6px', borderRadius: 4, opacity: 0.8 }}>
                    {result.detectedLanguage} → {targetLang}
                  </span>
                )}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <SpeakButton text={result.translation} />
                <ShareButton text={result.translation} title="Convey" />
                <button onClick={handleCopy} className="tc-copy-btn">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <p style={{ fontSize: 16, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {result.translation}
            </p>
          </div>

          {result.notes && (
            <p style={{ fontSize: 12, color: 'var(--tc-muted)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              {result.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
