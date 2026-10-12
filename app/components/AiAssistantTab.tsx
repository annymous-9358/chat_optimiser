'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TOOLS } from '../toolsData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  fileLabel?: string;
}

const TOOL_MAP: Record<string, string> = Object.fromEntries(
  TOOLS.map(t => [t.slug, t.label])
);

const SUGGESTED_PROMPTS = [
  { label: 'Rephrase professionally', prompt: 'Rewrite this in a more professional tone: "hey can we move the meeting? something came up"' },
  { label: 'Write a follow-up email', prompt: 'Write a follow-up email to a client I met last week about our design services. Keep it brief and warm.' },
  { label: 'Summarize this', prompt: 'Summarize this for me and give me the key points.' },
  { label: 'Quick reply help', prompt: 'My manager just sent me: "Can you stay late tonight?" — give me 3 reply options.' },
  { label: 'Gift card message', prompt: 'Write a witty birthday gift card message for my best friend who just turned 30.' },
  { label: 'Tone check', prompt: 'Does this sound too passive-aggressive? "I thought I already sent this over, but here it is again."' },
];

function parseToolSuggestion(text: string): { clean: string; toolSlug: string | null; toolLabel: string | null } {
  const match = text.match(/\[SUGGEST_TOOL:([a-z-]+)\|([^\]]+)\]/);
  if (!match) return { clean: text.trim(), toolSlug: null, toolLabel: null };
  return {
    clean: text.replace(/\[SUGGEST_TOOL:[^\]]+\]/g, '').trim(),
    toolSlug: match[1],
    toolLabel: match[2],
  };
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:1px 5px;border-radius:3px;font-size:0.9em">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:12px 0 4px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:700;margin:14px 0 6px">$1</h2>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:18px;margin:8px 0">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin:0 0 8px">')
    .replace(/\n/g, '<br>');
}

function ToolChip({ slug, label, onClick }: { slug: string; label: string; onClick: () => void }) {
  const tool = TOOLS.find(t => t.slug === slug);
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      marginTop: 12, padding: '8px 14px', borderRadius: 8,
      border: '1px solid #6366f1', background: '#f0efff',
      color: '#4f46e5', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      fontFamily: 'inherit', transition: 'all .15s',
    }}>
      {tool && (
        <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
        </svg>
      )}
      Open in {label} →
    </button>
  );
}

export default function AiAssistantTab() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setFileContent(ev.target?.result as string ?? '');
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const removeFile = useCallback(() => {
    setFileContent(null);
    setFileName(null);
  }, []);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    const userMsg: Message = { role: 'user', content, fileLabel: fileName ?? undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          fileContent: fileContent ?? undefined,
        }),
      });

      if (!res.ok) throw new Error('Request failed');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const { text } = JSON.parse(data);
              accumulated += text;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: accumulated };
                return updated;
              });
            } catch { /* skip malformed chunks */ }
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: 'Something went wrong. Please try again.' };
        return updated;
      });
    } finally {
      setStreaming(false);
      // Clear file after first use
      setFileContent(null);
      setFileName(null);
    }
  }, [input, messages, streaming, fileContent, fileName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isEmptyState = messages.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--tc-text)', letterSpacing: '-.03em', margin: '0 0 4px' }}>
          AI Assistant
        </h1>
        <p style={{ fontSize: 13, color: 'var(--tc-muted)', margin: 0 }}>
          Tell me what you need — I'll solve it directly or route you to the right tool.
        </p>
      </div>

      {/* Message area */}
      <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', minHeight: 0, marginBottom: 16 }}>

        {isEmptyState && (
          <div>
            {/* Welcome card */}
            <div style={{
              borderRadius: 14, border: '1px solid var(--tc-border)',
              background: 'var(--tc-surface, var(--tc-bg))',
              padding: '24px 28px', marginBottom: 24,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg style={{ width: 22, height: 22, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--tc-text)', margin: '0 0 8px' }}>
                What can I help you with?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--tc-muted)', lineHeight: 1.6, margin: 0 }}>
                I know all 16 Convey tools — I can rephrase messages, write emails, summarize documents, check tones, generate replies, and much more. Upload a file and I&apos;ll work with it directly.
              </p>
            </div>

            {/* Suggested prompts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {SUGGESTED_PROMPTS.map(sp => (
                <button key={sp.label} onClick={() => send(sp.prompt)}
                  style={{
                    textAlign: 'left', padding: '12px 14px', borderRadius: 10,
                    border: '1px solid var(--tc-border)',
                    background: 'var(--tc-surface, var(--tc-bg))',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'border-color .12s',
                  }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tc-text)', marginBottom: 4 }}>{sp.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--tc-muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                    {sp.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <div style={{ maxWidth: '80%' }}>
                  {msg.fileLabel && (
                    <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 11, color: 'var(--tc-muted)', background: 'var(--tc-chip, #f0f0f0)', padding: '3px 8px', borderRadius: 6 }}>
                        📎 {msg.fileLabel}
                      </span>
                    </div>
                  )}
                  <div style={{
                    padding: '11px 16px', borderRadius: 14, borderBottomRightRadius: 4,
                    background: 'var(--tc-accent)', color: 'var(--tc-on)',
                    fontSize: 13, lineHeight: 1.55,
                  }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          }

          const { clean, toolSlug, toolLabel } = parseToolSuggestion(msg.content);
          const isLast = i === messages.length - 1;

          return (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <svg style={{ width: 13, height: 13, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, lineHeight: 1.65, color: 'var(--tc-text)',
                  padding: '12px 16px', borderRadius: 14, borderTopLeftRadius: 4,
                  border: '1px solid var(--tc-border)',
                  background: 'var(--tc-surface, var(--tc-bg))',
                }}>
                  {clean ? (
                    <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(clean) }} />
                  ) : (
                    isLast && streaming && (
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1s ease-in-out infinite' }} />
                    )
                  )}
                </div>

                {toolSlug && toolLabel && TOOL_MAP[toolSlug] && (
                  <ToolChip slug={toolSlug} label={toolLabel} onClick={() => router.push(`/app/${toolSlug}`)} />
                )}
              </div>
            </div>
          );
        })}

        {streaming && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: 13, height: 13, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 14, borderTopLeftRadius: 4, border: '1px solid var(--tc-border)', background: 'var(--tc-surface, var(--tc-bg))', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(n => (
                <span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--tc-muted)', display: 'block', animation: `bounce 1.2s ease-in-out ${n * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ flexShrink: 0 }}>
        {/* File badge */}
        {fileName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '7px 12px', borderRadius: 8, background: 'var(--tc-chip, #f0efff)', border: '1px solid var(--tc-border)', width: 'fit-content' }}>
            <svg style={{ width: 13, height: 13, color: '#6366f1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--tc-text)' }}>{fileName}</span>
            <button onClick={removeFile} style={{ width: 16, height: 16, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--tc-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', border: '1px solid var(--tc-border)', borderRadius: 12, padding: '8px 8px 8px 12px', background: 'var(--tc-surface, var(--tc-bg))' }}>
          {/* File upload */}
          <button onClick={() => fileRef.current?.click()} title="Upload file"
            style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--tc-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, flexShrink: 0, marginBottom: 2 }}>
            <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input ref={fileRef} type="file" accept=".txt,.csv,.json,.md,.html,.xml,.log" onChange={handleFile} style={{ display: 'none' }} />

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me what you need… (Shift+Enter for new line)"
            rows={1}
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: 'var(--tc-text)', lineHeight: 1.5,
              fontFamily: 'inherit', resize: 'none', minHeight: 32, maxHeight: 160,
              overflowY: 'auto', paddingTop: 6, paddingBottom: 6,
            }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
            }}
          />

          {/* Send */}
          <button onClick={() => send()} disabled={!input.trim() || streaming}
            style={{
              width: 34, height: 34, border: 'none', borderRadius: 8, flexShrink: 0,
              background: (!input.trim() || streaming) ? 'var(--tc-border)' : 'var(--tc-accent)',
              color: (!input.trim() || streaming) ? 'var(--tc-muted)' : 'var(--tc-on)',
              cursor: (!input.trim() || streaming) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .15s',
            }}>
            {streaming ? (
              <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--tc-muted)', textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
          Accepts .txt, .csv, .json, .md files · AI may make mistakes
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
