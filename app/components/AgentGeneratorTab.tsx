'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

const PLATFORMS = ['Claude Code', 'Cursor', 'GitHub Copilot', 'VS Code', 'General / API'];
const SPECIALIZATIONS = ['Code Review', 'Debugging', 'Documentation', 'Testing', 'Refactoring', 'Architecture', 'Full-Stack Dev', 'Data Analysis', 'Security Audit', 'Custom'];
const BEHAVIORS = ['Proactive', 'Reactive', 'Balanced', 'Strict / Opinionated', 'Collaborative'];

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

export default function AgentGeneratorTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [description,    setDescription]    = useState('');
  const [platform,       setPlatform]       = useState('Claude Code');
  const [specialization, setSpecialization] = useState('');
  const [behavior,       setBehavior]       = useState('');
  const [result,         setResult]         = useState<{ definition: string; filename: string; usage: string; capabilities: string[] } | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [copied,         setCopied]         = useState(false);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setDescription((d.description as string) ?? '');
    setPlatform((d.platform as string) ?? 'Claude Code');
    setSpecialization((d.specialization as string) ?? '');
    setBehavior((d.behavior as string) ?? '');
    setResult((d.result as { definition: string; filename: string; usage: string; capabilities: string[] }) ?? null);
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) { setError('Describe what your agent should do.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/agent-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, platform, specialization, behavior }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
      saveEntry({
        type: 'agentgenerator', emoji: '', label: specialization || 'Agent Builder',
        preview: description.slice(0, 60),
        data: { description, platform, specialization, behavior, result: data },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [description, platform, specialization, behavior, saveEntry]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.definition);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Agent Generator</h1>
        <p className="tc-desc">Describe what you want your AI agent to do — get a complete, ready-to-use agent definition for Claude Code, Cursor, Copilot, or any LLM API.</p>
      </div>

      <div className="tc-label">What should this agent do?</div>
      <textarea
        className="tc-textarea"
        rows={4}
        placeholder="e.g. Review pull requests for security vulnerabilities, suggest fixes, and explain the risk level of each issue found"
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerate(); }}
      />

      <ChipRow label="Target platform"     options={PLATFORMS}       value={platform}       onChange={setPlatform} />
      <ChipRow label="Specialization"       options={SPECIALIZATIONS} value={specialization} onChange={setSpecialization} />
      <ChipRow label="Behavior style"       options={BEHAVIORS}       value={behavior}       onChange={setBehavior} />

      {error && (
        <div className="tc-error">{error}</div>
      )}

      <button className="tc-btn" onClick={handleGenerate} disabled={loading} style={{ marginTop: 4 }}>
        {loading && <Spin />}
        {loading ? 'Generating…' : '⚡ Generate Agent'}
      </button>

      {result && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Capabilities */}
          {result.capabilities?.length > 0 && (
            <div className="tc-result-card">
              <div className="tc-label" style={{ marginBottom: 10 }}>Capabilities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.capabilities.map((cap, i) => (
                  <span key={i} className="tc-chip tc-active" style={{ cursor: 'default' }}>{cap}</span>
                ))}
              </div>
            </div>
          )}

          {/* Definition file */}
          <div className="tc-result-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <span className="tc-label" style={{ margin: 0 }}>Agent definition</span>
                {result.filename && (
                  <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace', background: 'var(--tc-chip)', padding: '2px 6px', borderRadius: 4 }}>
                    {result.filename}
                  </span>
                )}
              </div>
              <button onClick={handleCopy} className="tc-copy-btn">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              fontSize: 11, color: 'var(--tc-text)', lineHeight: 1.65, margin: 0,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
              maxHeight: 400, overflowY: 'auto',
            }}>
              {result.definition}
            </pre>
          </div>

          {/* Usage */}
          {result.usage && (
            <div className="tc-result-card">
              <div className="tc-label" style={{ marginBottom: 6 }}>How to use</div>
              <p style={{ fontSize: 13, color: 'var(--tc-sec)', lineHeight: 1.65, margin: 0 }}>
                {result.usage}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
