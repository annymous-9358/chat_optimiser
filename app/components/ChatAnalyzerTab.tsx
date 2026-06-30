'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

type Mode = 'analyze' | 'generate';

type Analysis = {
  summary: string;
  sentiment: string;
  sentimentScore: number;
  dynamics: string[];
  communicationStyle: { user: string; other: string };
  redFlags?: string[];
  strengths: string[];
  suggestions: string[];
  nextMessageIdea: string;
};

const GENERATE_TONES = [
  { id: 'warm',         label: 'Warm' },
  { id: 'casual',       label: 'Casual' },
  { id: 'playful',      label: 'Playful' },
  { id: 'professional', label: 'Professional' },
  { id: 'apologetic',   label: 'Apologetic' },
  { id: 'assertive',    label: 'Assertive' },
];

function sentimentBar(score: number) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? '#4ade80' : pct >= 45 ? '#fbbf24' : '#f87171';
  return { pct, color };
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

export default function ChatAnalyzerTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [chatText,    setChatText]    = useState('');
  const [mode,        setMode]        = useState<Mode>('analyze');
  const [otherPerson, setOtherPerson] = useState('');
  const [purpose,     setPurpose]     = useState('');
  const [genTone,     setGenTone]     = useState('warm');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [analysis,    setAnalysis]    = useState<Analysis | null>(null);
  const [messages,    setMessages]    = useState<string[]>([]);
  const [copied,      setCopied]      = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data as Record<string, unknown>;
    const savedMode = (d.mode as Mode) ?? 'analyze';
    setMode(savedMode);
    setOtherPerson((d.otherPerson as string) ?? '');
    if (savedMode === 'generate') {
      setPurpose((d.purpose as string) ?? '');
      setGenTone((d.tone as string) ?? 'warm');
      setMessages((d.messages as string[]) ?? []);
    } else {
      setAnalysis((d.analysis as Analysis) ?? null);
    }
    onSessionLoaded?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSession]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setChatText((ev.target?.result as string) ?? ''); setAnalysis(null); setMessages([]); };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleRun = useCallback(async () => {
    if (!chatText.trim()) { setError('Paste or upload a chat export first.'); return; }
    if (mode === 'generate' && !purpose.trim()) { setError('Describe what you want to say.'); return; }
    setError(''); setLoading(true); setAnalysis(null); setMessages([]);
    try {
      const body: Record<string, string> = { chatText, mode };
      if (mode === 'generate') { body.purpose = purpose; body.tone = genTone; body.otherPerson = otherPerson; }
      const res = await fetch('/api/chat-analyzer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      if (mode === 'analyze') {
        setAnalysis(data.analysis);
        saveEntry({ type: 'chatanalyzer', emoji: '', label: `Chat analysis${otherPerson ? ` · ${otherPerson}` : ''}`, preview: data.analysis?.summary?.slice(0, 80) ?? 'Chat analysis', data: { mode: 'analyze', otherPerson, analysis: data.analysis } });
      } else {
        setMessages(data.messages ?? []);
        saveEntry({ type: 'chatanalyzer', emoji: '', label: `Message from context${otherPerson ? ` · ${otherPerson}` : ''}`, preview: purpose.slice(0, 60), data: { mode: 'generate', otherPerson, purpose, tone: genTone, messages: data.messages } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [chatText, mode, purpose, genTone, otherPerson, saveEntry]);

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Chat Analyzer</h1>
        <p className="tc-desc">Analyse chat dynamics or generate a contextual message from your conversation history.</p>
      </div>

      {/* Mode */}
      <div>
        <div className="tc-label">What do you want to do?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { id: 'analyze' as Mode, label: 'Analyse the chat', desc: 'Understand dynamics, patterns & tone' },
            { id: 'generate' as Mode, label: 'Generate a message', desc: 'Craft a reply from your chat context' },
          ].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); if (m.id === 'analyze') setMessages([]); else setAnalysis(null); }}
              style={{
                display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 14px',
                borderRadius: 6, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                border: `1px solid ${mode === m.id ? 'var(--tc-accent)' : 'var(--tc-border)'}`,
                background: mode === m.id ? 'var(--tc-accent)' : 'var(--tc-chip)',
                transition: 'all .1s',
              }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: mode === m.id ? 'var(--tc-on)' : 'var(--tc-text)' }}>{m.label}</span>
              <span style={{ fontSize: 11, color: mode === m.id ? 'rgba(255,255,255,0.6)' : 'var(--tc-muted)', lineHeight: 1.4 }}>{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat paste */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="tc-label" style={{ marginBottom: 0 }}>Chat export</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: 11, color: 'var(--tc-accent)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', fontWeight: 500 }}>
              Upload .txt
            </button>
            <input ref={fileInputRef} type="file" accept=".txt,.log" style={{ display: 'none' }} onChange={handleFileUpload} />
            {chatText && (
              <button onClick={() => { setChatText(''); setAnalysis(null); setMessages([]); }}
                style={{ fontSize: 11, color: 'var(--tc-muted)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>
                Clear
              </button>
            )}
          </div>
        </div>
        <textarea
          className="tc-textarea"
          rows={6}
          value={chatText}
          onChange={e => { setChatText(e.target.value); setAnalysis(null); setMessages([]); }}
          placeholder={`Paste your WhatsApp or Instagram chat export here…\n\nWhatsApp: Open chat → ⋮ → More → Export chat → Without media`}
          style={{ fontSize: 12, lineHeight: 1.6 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--tc-muted)' }}>Export without media — only text needed</span>
          {chatText.length > 0 && <span style={{ fontSize: 11, color: chatText.length > 8000 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{(chatText.length / 1000).toFixed(1)}k chars</span>}
        </div>
      </div>

      <div>
        <div className="tc-label">Their name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
        <input className="tc-input" type="text" value={otherPerson} onChange={e => setOtherPerson(e.target.value)} placeholder="e.g. Priya, Alex…" />
      </div>

      {mode === 'generate' && (
        <>
          <div>
            <div className="tc-label">What do you want to say?</div>
            <textarea
              className="tc-textarea"
              rows={3}
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="e.g. I want to apologise for missing their call and suggest catching up this weekend…"
            />
          </div>
          <div>
            <div className="tc-label">Tone</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {GENERATE_TONES.map(t => (
                <button key={t.id} onClick={() => setGenTone(t.id)} className={`tc-chip${genTone === t.id ? ' tc-active' : ''}`}>{t.label}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="tc-err">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <button onClick={handleRun} disabled={loading} className="tc-btn">
        {loading && <Spin />}
        {loading ? (mode === 'analyze' ? 'Analysing…' : 'Generating…') : (mode === 'analyze' ? 'Analyse chat' : 'Generate message')}
      </button>

      {loading && (
        <div className="tc-skeletons">
          {[64, 80, 64].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 0, borderBottom: i < 2 ? '1px solid var(--tc-faint)' : 'none' }} />
          ))}
        </div>
      )}

      {/* Analysis results */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="tc-label" style={{ marginBottom: 0 }}>Overview</div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 4, border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', color: 'var(--tc-sec)' }}>{analysis.sentiment}</span>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.7, margin: '0 0 16px 0' }}>{analysis.summary}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--tc-muted)' }}>Negative</span>
              <span style={{ fontSize: 11, color: 'var(--tc-muted)' }}>Positive</span>
            </div>
            <div style={{ height: 4, background: 'var(--tc-faint)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: sentimentBar(analysis.sentimentScore).color, width: `${sentimentBar(analysis.sentimentScore).pct}%`, transition: 'width .7s ease' }} />
            </div>
          </div>

          <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
            <div className="tc-label">Communication styles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tc-muted)', marginBottom: 4 }}>You</div><p style={{ fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.6, margin: 0 }}>{analysis.communicationStyle?.user}</p></div>
              <div style={{ height: 1, background: 'var(--tc-faint)' }} />
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tc-muted)', marginBottom: 4 }}>{otherPerson || 'Them'}</div><p style={{ fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.6, margin: 0 }}>{analysis.communicationStyle?.other}</p></div>
            </div>
          </div>

          {analysis.dynamics?.length > 0 && (
            <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
              <div className="tc-label">Dynamics observed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysis.dynamics.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', fontSize: 11, fontWeight: 600, color: 'var(--tc-sec)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <p style={{ fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.6, margin: 0 }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(analysis.strengths?.length > 0 || (analysis.redFlags?.length ?? 0) > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {analysis.strengths?.length > 0 && (
                <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
                  <div className="tc-label">Strengths</div>
                  {analysis.strengths.map((s, i) => <p key={i} style={{ fontSize: 13, color: 'var(--tc-text)', lineHeight: 1.6, margin: '0 0 8px 0' }}>{s}</p>)}
                </div>
              )}
              {(analysis.redFlags?.length ?? 0) > 0 && (
                <div style={{ border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2', padding: 20 }}>
                  <div className="tc-label">Watch out</div>
                  {analysis.redFlags!.map((f, i) => <p key={i} style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.6, margin: '0 0 8px 0' }}>{f}</p>)}
                </div>
              )}
            </div>
          )}

          {analysis.suggestions?.length > 0 && (
            <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
              <div className="tc-label">Suggestions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysis.suggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--tc-border)', background: 'var(--tc-chip)', fontSize: 11, fontWeight: 600, color: 'var(--tc-sec)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <p style={{ fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.6, margin: 0 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.nextMessageIdea && (
            <div style={{ border: '1px solid var(--tc-border)', borderRadius: 8, background: 'var(--tc-card)', padding: 20 }}>
              <div className="tc-label">You could send…</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <p style={{ flex: 1, fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0 }}>{analysis.nextMessageIdea}</p>
                <button onClick={() => { navigator.clipboard.writeText(analysis.nextMessageIdea); setCopied(99); setTimeout(() => setCopied(null), 2000); }}
                  className={`tc-copy${copied === 99 ? ' copied' : ''}`} style={{ opacity: 1 }}>
                  {copied === 99 ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {messages.length > 0 && (
        <div>
          <div className="tc-label">Messages</div>
          <div className="tc-result-list">
            {messages.map((msg, i) => (
              <div key={i} className="tc-result-row">
                <div style={{ flexShrink: 0, minWidth: 28, paddingTop: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--tc-muted)' }}>{i + 1}</span>
                </div>
                <p style={{ flex: 1, fontSize: 13.5, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0 }}>{msg}</p>
                <button onClick={() => { navigator.clipboard.writeText(msg); setCopied(i); setTimeout(() => setCopied(null), 2000); }}
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
