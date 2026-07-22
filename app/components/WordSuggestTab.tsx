'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory, HistoryEntry } from '../context/HistoryContext';

const CATEGORIES = ['Feeling / Emotion', 'Person / Character', 'Place / Scene', 'Moment / Time', 'Action / Event', 'Object / Thing', 'Concept / Idea', 'Literary / Poetic'];
const OUTPUT_LANGS = ['English', 'Hindi', 'Both'];

function Spin() {
  return (
    <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

type WordResult = {
  word: string;
  pronunciation?: string;
  language: string;
  meaning: string;
  example?: string;
  nuance?: string;
};

type ApiResult = {
  words: WordResult[];
  interpretation: string;
};

type Props = { loadSession?: HistoryEntry | null; onSessionLoaded?: () => void; };

export default function WordSuggestTab({ loadSession, onSessionLoaded }: Props) {
  const { saveEntry } = useHistory();
  const [description, setDescription]   = useState('');
  const [category,    setCategory]      = useState('');
  const [outputLang,  setOutputLang]    = useState('English');
  const [result,      setResult]        = useState<ApiResult | null>(null);
  const [loading,     setLoading]       = useState(false);
  const [error,       setError]         = useState('');
  const [copied,      setCopied]        = useState<string | null>(null);

  useEffect(() => {
    if (!loadSession) return;
    const d = loadSession.data;
    setDescription((d.description as string) ?? '');
    setCategory((d.category as string) ?? '');
    setOutputLang((d.outputLang as string) ?? 'English');
    setResult((d.result as ApiResult) ?? null);
    onSessionLoaded?.();
  }, [loadSession, onSessionLoaded]);

  const handleFind = useCallback(async () => {
    if (!description.trim()) { setError('Describe what you are trying to say.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/word-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, category, outputLang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
      saveEntry({
        type: 'wordsuggest', emoji: '', label: category || 'Word Finder',
        preview: description.slice(0, 60),
        data: { description, category, outputLang, result: data },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [description, category, outputLang, saveEntry]);

  const handleCopy = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopied(word);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="tc-view">
      <div className="tc-view-header">
        <h1 className="tc-heading">Word Finder</h1>
        <p className="tc-desc">
          Can't remember that perfect word? Describe the feeling, place, person, or moment — in any language (English, Hindi, Hinglish) — and get the exact words you're looking for.
        </p>
      </div>

      <div>
        <div className="tc-label">Describe what you're looking for</div>
        <textarea
          className="tc-textarea"
          rows={4}
          placeholder={`e.g. "woh feeling jab tum kisi ko miss karo but unhe batana nahi chahte"\nor "that bittersweet feeling of nostalgia for a time that may never have existed"\nor "a word for someone who pretends to be happy but is sad inside"`}
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleFind(); }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="tc-label">Category (optional)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c === category ? '' : c)}
              className={`tc-chip${category === c ? ' tc-active' : ''}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <div className="tc-label">Suggest words in</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {OUTPUT_LANGS.map(l => (
            <button key={l} onClick={() => setOutputLang(l)}
              className={`tc-chip${outputLang === l ? ' tc-active' : ''}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="tc-error">{error}</div>}

      <button className="tc-btn" onClick={handleFind} disabled={loading}>
        {loading && <Spin />}
        {loading ? 'Finding words…' : '🔍 Find Words'}
      </button>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result.interpretation && (
            <div className="tc-result-card" style={{ borderLeft: '3px solid var(--tc-accent)' }}>
              <div className="tc-label" style={{ marginBottom: 6 }}>What I understood</div>
              <p style={{ fontSize: 13, color: 'var(--tc-sec)', lineHeight: 1.65, margin: 0 }}>
                {result.interpretation}
              </p>
            </div>
          )}

          {result.words?.length > 0 && (
            <div>
              <div className="tc-label" style={{ marginBottom: 10 }}>
                {result.words.length} word{result.words.length !== 1 ? 's' : ''} found
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.words.map((w, i) => (
                  <div key={i} className="tc-result-card" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--tc-text)', fontFamily: 'var(--font-geist-mono), ui-monospace, monospace', letterSpacing: '-.2px' }}>
                          {w.word}
                        </span>
                        {w.pronunciation && (
                          <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--tc-muted)', fontStyle: 'italic' }}>
                            /{w.pronunciation}/
                          </span>
                        )}
                        {w.language && w.language !== 'English' && (
                          <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--tc-accent)', border: '1px solid var(--tc-accent)', padding: '1px 6px', borderRadius: 4, opacity: 0.8 }}>
                            {w.language}
                          </span>
                        )}
                      </div>
                      <button onClick={() => handleCopy(w.word)} className="tc-copy-btn">
                        {copied === w.word ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--tc-text)', lineHeight: 1.65, margin: '0 0 6px' }}>
                      {w.meaning}
                    </p>

                    {w.example && (
                      <p style={{ fontSize: 12, color: 'var(--tc-muted)', lineHeight: 1.6, margin: '0 0 4px', fontStyle: 'italic' }}>
                        "{w.example}"
                      </p>
                    )}

                    {w.nuance && (
                      <p style={{ fontSize: 11, color: 'var(--tc-sec)', lineHeight: 1.55, margin: 0, borderTop: '1px solid var(--tc-border)', paddingTop: 8, marginTop: 8 }}>
                        {w.nuance}
                      </p>
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
