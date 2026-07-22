'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

const PURPOSES = ['Coding', 'Writing', 'Analysis', 'Research', 'Creative', 'Business', 'Learning', 'Data', 'Design', 'Other'];
const PLATFORMS = ['Claude', 'ChatGPT / GPT-4', 'Gemini', 'Cursor', 'GitHub Copilot', 'General LLM'];
const STYLES = ['Detailed & Structured', 'Concise', 'Chain-of-Thought', 'Role-play / Persona', 'Step-by-step', 'Expert-level'];

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

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function PromptEnhancerTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [prompt,    setPrompt]    = useState('');
  const [purpose,   setPurpose]   = useState('');
  const [platform,  setPlatform]  = useState('');
  const [style,     setStyle]     = useState('');
  const [result,    setResult]    = useState<{ enhanced: string; explanation: string; tips: string[] } | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [copied,    setCopied]    = useState(false);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setPrompt((d.prompt as string) ?? '');
    setPurpose((d.purpose as string) ?? '');
    setPlatform((d.platform as string) ?? '');
    setStyle((d.style as string) ?? '');
    setResult((d.result as { enhanced: string; explanation: string; tips: string[] }) ?? null);
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleEnhance = useCallback(async () => {
    if (!prompt.trim()) { setError('Enter a prompt to enhance.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/prompt-enhancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, purpose, platform, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
      saveEntry({
        type: 'promptenhancer', emoji: '', label: purpose || 'Prompt Boost',
        preview: prompt.slice(0, 60),
        data: { prompt, purpose, platform, style, result: data },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [prompt, purpose, platform, style, saveEntry]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Prompt Enhancer</h1>
        <p className="tc-desc">Write a rough prompt, pick your target platform and style — get back an optimised version that gets dramatically better AI results.</p>
      </div>

      <div className="tc-label">Your prompt</div>
      <textarea
        className="tc-textarea"
        rows={5}
        placeholder="e.g. write me a function that sorts a list of users by date and name"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleEnhance(); }}
      />

      <ChipRow label="Purpose"           options={PURPOSES}  value={purpose}  onChange={setPurpose} />
      <ChipRow label="Target platform"   options={PLATFORMS} value={platform} onChange={setPlatform} />
      <ChipRow label="Output style"      options={STYLES}    value={style}    onChange={setStyle} />

      {error && (
        <div className="tc-error">{error}</div>
      )}

      <button className="tc-btn" onClick={handleEnhance} disabled={loading} style={{ marginTop: 4 }}>
        {loading && <Spin />}
        {loading ? 'Enhancing…' : '✦ Enhance Prompt'}
      </button>

      {result && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Enhanced prompt */}
          <div className="tc-result-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="tc-label" style={{ margin: 0 }}>Enhanced prompt</span>
              <button onClick={handleCopy} className="tc-copy-btn">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {result.enhanced}
            </p>
          </div>

          {/* Explanation */}
          <div className="tc-result-card">
            <div className="tc-label" style={{ marginBottom: 8 }}>What changed & why</div>
            <p style={{ fontSize: 13, color: 'var(--tc-sec)', lineHeight: 1.7, margin: 0 }}>
              {result.explanation}
            </p>
          </div>

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="tc-result-card">
              <div className="tc-label" style={{ marginBottom: 8 }}>Pro tips</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.tips.map((tip, i) => (
                  <li key={i} style={{ fontSize: 12, color: 'var(--tc-sec)', lineHeight: 1.6 }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
