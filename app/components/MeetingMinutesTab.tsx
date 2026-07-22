'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

const MEETING_TYPES = ['Standup', 'Client Call', 'Planning', '1:1', 'General'];

type ActionItem = { task: string; owner: string; due: string };
type MinutesResult = {
  summary: string;
  discussionPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
};

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

function formatMinutes(meetingType: string, result: MinutesResult): string {
  const lines: string[] = [];
  lines.push(`Meeting Minutes${meetingType ? ` — ${meetingType}` : ''}`);
  lines.push('');
  lines.push('Summary');
  lines.push(result.summary);

  if (result.discussionPoints?.length) {
    lines.push('');
    lines.push('Discussion Points');
    result.discussionPoints.forEach(p => lines.push(`- ${p}`));
  }

  if (result.decisions?.length) {
    lines.push('');
    lines.push('Decisions');
    result.decisions.forEach(d => lines.push(`- ${d}`));
  }

  if (result.actionItems?.length) {
    lines.push('');
    lines.push('Action Items');
    result.actionItems.forEach(item => {
      let line = `- ${item.task}`;
      const meta: string[] = [];
      if (item.owner) meta.push(`Owner: ${item.owner}`);
      if (item.due) meta.push(`Due: ${item.due}`);
      if (meta.length) line += ` (${meta.join(', ')})`;
      lines.push(line);
    });
  }

  return lines.join('\n');
}

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function MeetingMinutesTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [notes,       setNotes]       = useState('');
  const [meetingType, setMeetingType] = useState('');
  const [result,      setResult]      = useState<MinutesResult | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [copied,      setCopied]      = useState(false);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setNotes((d.notes as string) ?? '');
    setMeetingType((d.meetingType as string) ?? '');
    setResult((d.result as MinutesResult) ?? null);
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleGenerate = useCallback(async () => {
    if (!notes.trim()) { setError('Paste your meeting notes first.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/meeting-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, meetingType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
      saveEntry({
        type: 'meetingminutes', emoji: '', label: meetingType || 'Meeting Minutes',
        preview: notes.slice(0, 60),
        data: { notes, meetingType, result: data },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [notes, meetingType, saveEntry]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(formatMinutes(meetingType, result));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Meeting Minutes</h1>
        <p className="tc-desc">Paste raw, messy meeting notes or a rough transcript — get back clean, structured minutes with decisions and action items.</p>
      </div>

      <div className="tc-label">Raw meeting notes</div>
      <textarea
        className="tc-textarea"
        rows={8}
        placeholder="Paste your raw meeting notes or transcript here… doesn't need to be tidy — typos and stream-of-consciousness are fine."
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerate(); }}
        maxLength={6000}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: notes.length > 5400 ? '#d97706' : 'var(--tc-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>{notes.length} / 6000</span>
      </div>

      <ChipRow label="Meeting type (optional)" options={MEETING_TYPES} value={meetingType} onChange={setMeetingType} />

      {error && (
        <div className="tc-error">{error}</div>
      )}

      <button className="tc-btn" onClick={handleGenerate} disabled={loading} style={{ marginTop: 4 }}>
        {loading && <Spin />}
        {loading ? 'Generating…' : '📝 Generate Minutes'}
      </button>

      {result && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Summary */}
          <div className="tc-result-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="tc-label" style={{ margin: 0 }}>Summary</span>
              <button onClick={handleCopy} className="tc-copy-btn">
                {copied ? '✓ Copied' : 'Copy full minutes'}
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--tc-text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {result.summary}
            </p>
          </div>

          {/* Discussion points */}
          {result.discussionPoints?.length > 0 && (
            <div className="tc-result-card">
              <div className="tc-label" style={{ marginBottom: 8 }}>Discussion points</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.discussionPoints.map((point, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--tc-sec)', lineHeight: 1.6 }}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Decisions */}
          {result.decisions?.length > 0 && (
            <div className="tc-result-card">
              <div className="tc-label" style={{ marginBottom: 8 }}>Decisions</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.decisions.map((decision, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--tc-sec)', lineHeight: 1.6 }}>{decision}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action items */}
          {result.actionItems?.length > 0 && (
            <div className="tc-result-card">
              <div className="tc-label" style={{ marginBottom: 10 }}>Action items</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.actionItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 10, borderBottom: i < result.actionItems.length - 1 ? '1px solid var(--tc-border)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'var(--tc-text)', lineHeight: 1.6 }}>{item.task}</span>
                    {(item.owner || item.due) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {item.owner && (
                          <span className="tc-chip tc-active" style={{ cursor: 'default', fontSize: 11, padding: '2px 8px' }}>{item.owner}</span>
                        )}
                        {item.due && (
                          <span style={{ fontSize: 11, color: 'var(--tc-muted)' }}>{item.due}</span>
                        )}
                      </div>
                    )}
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
