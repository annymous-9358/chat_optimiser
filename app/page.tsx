'use client';

import { useState, useCallback } from 'react';
import { useAuth, type OAuthProvider } from './context/AuthContext';
import { useHistory, HistoryEntry } from './context/HistoryContext';
import { useTheme, type ThemeMode } from './context/ThemeContext';
import RephraseTab        from './components/RephraseTab';
import QuickReplyTab      from './components/QuickReplyTab';
import ToneAnalyzerTab    from './components/ToneAnalyzerTab';
import PolishTab          from './components/PolishTab';
import StandupTab         from './components/StandupTab';
import ChatAnalyzerTab    from './components/ChatAnalyzerTab';
import GiftMessageTab     from './components/GiftMessageTab';
import OccasionMessageTab from './components/OccasionMessageTab';
import EmailSubjectTab    from './components/EmailSubjectTab';
import EmailWriterTab     from './components/EmailWriterTab';
import PromptEnhancerTab  from './components/PromptEnhancerTab';
import AgentGeneratorTab  from './components/AgentGeneratorTab';
import WordSuggestTab     from './components/WordSuggestTab';
import OfflineGame        from './components/OfflineGame';

type Tab = 'rephrase' | 'quickreply' | 'analyzer' | 'polish' | 'standup' | 'chatanalyzer' | 'giftmessage' | 'occasionmessage' | 'emailsubject' | 'emailwriter' | 'promptenhancer' | 'agentgenerator' | 'wordsuggest';

const TABS: { id: Tab; label: string; d: string }[] = [
  { id: 'rephrase',        label: 'Rephrase',       d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { id: 'quickreply',      label: 'Quick Reply',    d: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'analyzer',        label: 'Tone Check',     d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'polish',          label: 'Polish',         d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { id: 'standup',         label: 'Standup',        d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'chatanalyzer',    label: 'Chat Insights',  d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { id: 'occasionmessage', label: 'Occasions',      d: 'M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z' },
  { id: 'giftmessage',     label: 'Gift Message',   d: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
  { id: 'emailsubject',    label: 'Email Subject',  d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'emailwriter',     label: 'Email Writer',   d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'promptenhancer',  label: 'Prompt Boost',   d: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'agentgenerator',  label: 'Agent Builder',  d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'wordsuggest',     label: 'Word Finder',    d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7' },
];

const TYPE_LABELS: Record<string, string> = {
  rephrase: 'Rephrase', quickreply: 'Quick Reply', analyzer: 'Tone Check',
  polish: 'Polish', standup: 'Standup', chatanalyzer: 'Chat Insights',
  giftmessage: 'Gift Message', occasionmessage: 'Occasions',
  emailsubject: 'Email Subject', emailwriter: 'Email Writer',
  promptenhancer: 'Prompt Boost', agentgenerator: 'Agent Builder',
  wordsuggest: 'Word Finder',
};

const TAB_ID_MAP: Record<string, Tab> = {
  rephrase: 'rephrase', quickreply: 'quickreply', analyzer: 'analyzer',
  polish: 'polish', standup: 'standup', chatanalyzer: 'chatanalyzer',
  giftmessage: 'giftmessage', occasionmessage: 'occasionmessage',
  emailsubject: 'emailsubject', emailwriter: 'emailwriter',
  promptenhancer: 'promptenhancer', agentgenerator: 'agentgenerator',
  wordsuggest: 'wordsuggest',
};

const ACCENT_PRESETS = ['#6366f1', '#f5c518', '#ff3b30', '#00c853', '#ff6b00', '#ffffff'];
const THEME_LABELS: Record<ThemeMode, string> = { glass: 'G', dark: 'D', editorial: 'E', brutalist: 'B' };

function timeAgo(ts: number): string {
  const d = Date.now() - ts, m = Math.floor(d / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function SvgIcon({ d, size = 13, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return (
    <svg style={{ width: size, height: size, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function Spin({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg style={{ width: size, height: size, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
      <path style={{ opacity: 0.8 }} fill={color} d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ── Auth page ─────────────────────────────────────────────────────────────────
function AuthPage() {
  const { signIn, signUp, signInWithOAuth } = useAuth();
  const [mode,         setMode]         = useState<'signin' | 'signup'>('signin');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [info,         setInfo]         = useState('');
  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(''); setOauthLoading(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) { setError(error); setOauthLoading(null); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error);
      else setInfo('Account created! Check your email to confirm, then sign in.');
    }
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width: '100%', border: '1px solid #e7e5e0', borderRadius: 6,
    background: '#ffffff', padding: '9px 12px', fontSize: 13, color: '#1c1917',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  if (info) return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1c1917', marginBottom: 6 }}>Check your email</h2>
        <p style={{ fontSize: 13, color: '#78716c', lineHeight: 1.6 }}>{info}</p>
        <button onClick={() => { setInfo(''); setMode('signin'); }} style={{ marginTop: 16, fontSize: 12, color: '#18181b', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          Back to sign in
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, background: '#f5c518', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: 9, letterSpacing: '-.2px', flexShrink: 0 }}>CO</div>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#1c1917', letterSpacing: '-.2px', fontFamily: 'var(--font-geist-mono), monospace', textTransform: 'uppercase' }}>Convey</span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1c1917', letterSpacing: '-.3px', marginBottom: 4 }}>
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p style={{ fontSize: 13, color: '#78716c', marginBottom: 28, lineHeight: 1.55 }}>
          {mode === 'signin' ? 'Access your sessions and history.' : 'Create a free account to get started.'}
        </p>

        <button onClick={() => handleOAuth('google')} disabled={!!oauthLoading || loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '9px 14px', borderRadius: 6, border: '1px solid #e7e5e0', fontSize: 13, fontWeight: 500, color: '#1c1917', background: '#ffffff', cursor: 'pointer', marginBottom: 20, fontFamily: 'inherit', opacity: (oauthLoading || loading) ? 0.6 : 1 }}>
          {oauthLoading === 'google' ? <Spin size={14} /> : (
            <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#e7e5e0' }} />
          <span style={{ fontSize: 11, color: '#a8a29e' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#e7e5e0' }} />
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e7e5e0', marginBottom: 20 }}>
          {(['signin', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ paddingBottom: 10, paddingRight: 16, fontSize: 12, fontWeight: 500, background: 'none', border: 'none', borderBottom: `2px solid ${mode === m ? '#18181b' : 'transparent'}`, color: mode === m ? '#1c1917' : '#a8a29e', cursor: 'pointer', marginBottom: -1, fontFamily: 'inherit', transition: 'color .1s' }}>
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#78716c', marginBottom: 5 }}>Email address</label>
            <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#78716c', marginBottom: 5 }}>Password</label>
            <input type="password" required minLength={6} placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={inp} />
          </div>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', padding: '9px 13px', fontSize: 12, color: '#b91c1c' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ marginTop: 4, padding: '10px', borderRadius: 6, background: '#18181b', color: '#ffffff', fontWeight: 600, fontSize: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1, fontFamily: 'inherit' }}>
            {loading && <Spin size={14} color="#ffffff" />}
            {loading ? (mode === 'signin' ? 'Signing in…' : 'Creating account…') : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface SidebarProps {
  activeTab:    Tab;
  setActiveTab: (t: Tab) => void;
  theme:        ThemeMode;
  accent:       string;
  setTheme:     (t: ThemeMode) => void;
  setAccent:    (a: string) => void;
  email:        string;
  signOut:      () => void;
  entries:      HistoryEntry[];
  histLoading:  boolean;
  onLoadSession:(e: HistoryEntry) => void;
  onClearAll:   () => void;
  mobileOpen:   boolean;
  setMobileOpen:(v: boolean) => void;
}

function Sidebar({ activeTab, setActiveTab, theme, accent, setTheme, setAccent, email, signOut, entries, histLoading, onLoadSession, onClearAll, mobileOpen, setMobileOpen }: SidebarProps) {
  const [histOpen, setHistOpen] = useState(false);
  const [hovNav,   setHovNav]   = useState<string | null>(null);
  const [hovHist,  setHovHist]  = useState<string | null>(null);
  const isBrut = theme === 'brutalist';
  const mono   = 'var(--font-geist-mono), ui-monospace, monospace';

  return (
    <>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }}
          className="mobile-backdrop" />
      )}

      <aside className={`tc-sidebar scrollbar-hide${mobileOpen ? ' sidebar-mobile-open' : ''}`}
        style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 50, fontFamily: mono }}>

        {/* Logo */}
        <div style={{ padding: '16px 14px 12px', borderBottom: `var(--tc-bw) solid var(--tc-border)`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: 'var(--tc-accent)', border: `var(--tc-bw) solid var(--tc-border)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tc-on)', fontWeight: 900, fontSize: 9, letterSpacing: '-.2px', flexShrink: 0, fontFamily: mono }}>CO</div>
              <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--tc-text)', letterSpacing: isBrut ? '-.3px' : '-.2px', textTransform: isBrut ? 'uppercase' : 'none' }}>
                Convey
              </span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="mobile-only"
              style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--tc-muted)', display: 'none', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--tc-muted)', padding: '2px 16px 8px' }}>Tools</div>
          {TABS.map(tab => {
            const active  = activeTab === tab.id;
            const hovered = hovNav === tab.id;
            return (
              <button key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileOpen(false); }}
                onMouseEnter={() => setHovNav(tab.id)}
                onMouseLeave={() => setHovNav(null)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 16px', border: 'none',
                  background: active ? 'var(--tc-accent)' : hovered ? 'var(--tc-hover)' : 'transparent',
                  color: active ? 'var(--tc-on)' : 'var(--tc-sec)',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  fontFamily: mono, letterSpacing: '.03em', textTransform: 'uppercase',
                  borderLeft: active && isBrut ? '4px solid var(--tc-border)' : '4px solid transparent',
                  transition: 'background .08s',
                }}>
                <SvgIcon d={tab.d} size={13} color={active ? 'var(--tc-on)' : 'var(--tc-sec)'} />
                {tab.label}
              </button>
            );
          })}

          {/* Workspace / History */}
          <div style={{ marginTop: 16, borderTop: `var(--tc-bw) solid var(--tc-border)`, paddingTop: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--tc-muted)', padding: '2px 16px 8px' }}>Workspace</div>
            <button onClick={() => setHistOpen(v => !v)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', border: 'none', background: 'transparent', color: 'var(--tc-sec)', cursor: 'pointer', fontSize: 11, fontFamily: mono, textTransform: 'uppercase', letterSpacing: '.03em' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <SvgIcon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="var(--tc-sec)" />
                History
              </div>
              <span style={{ fontSize: 10, color: 'var(--tc-muted)', fontWeight: 700 }}>{histOpen ? '▲' : '▼'}</span>
            </button>

            {histOpen && (
              <div>
                {histLoading && (
                  <div style={{ padding: '8px 16px 4px 40px' }}><Spin size={12} color="var(--tc-muted)" /></div>
                )}
                {!histLoading && entries.length === 0 && (
                  <p style={{ fontSize: 10, color: 'var(--tc-muted)', padding: '4px 16px 4px 40px', margin: 0, fontFamily: mono }}>No history yet</p>
                )}
                {entries.slice(0, 15).map(h => (
                  <div key={h.id}
                    onClick={() => onLoadSession(h)}
                    onMouseEnter={() => setHovHist(h.id)}
                    onMouseLeave={() => setHovHist(null)}
                    style={{
                      padding: '7px 16px 7px 40px', cursor: 'pointer',
                      background: hovHist === h.id ? 'var(--tc-hover)' : 'transparent',
                      borderLeft: hovHist === h.id && isBrut ? '4px solid var(--tc-accent)' : '4px solid transparent',
                      transition: 'background .08s',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginBottom: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tc-text)', fontFamily: mono, letterSpacing: '.04em' }}>{TYPE_LABELS[h.type] ?? h.type}</span>
                      <span style={{ fontSize: 9, color: 'var(--tc-muted)', fontFamily: mono }}>{timeAgo(h.timestamp)}</span>
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--tc-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, fontFamily: mono }}>{h.preview}</p>
                  </div>
                ))}
                {entries.length > 0 && (
                  <button onClick={onClearAll}
                    style={{ width: '100%', textAlign: 'left', padding: '4px 16px 6px 40px', fontSize: 10, color: 'var(--tc-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    Archive all
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer — theme selector + accent + sign out */}
        <div style={{ borderTop: `var(--tc-bw) solid var(--tc-border)`, padding: '10px 14px', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: 'var(--tc-muted)', fontFamily: mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>{email}</div>

          {/* Theme selector */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
            {(['glass', 'dark', 'editorial', 'brutalist'] as ThemeMode[]).map(th => (
              <button key={th} onClick={() => setTheme(th)}
                style={{
                  flex: 1, padding: '5px 2px', fontSize: 9, fontWeight: 700,
                  letterSpacing: '.06em', textTransform: 'uppercase',
                  border: `var(--tc-bw) solid ${theme === th ? 'var(--tc-border)' : 'transparent'}`,
                  background: theme === th ? 'var(--tc-chip)' : 'transparent',
                  color: theme === th ? 'var(--tc-text)' : 'var(--tc-muted)',
                  cursor: 'pointer', fontFamily: mono, borderRadius: 'var(--tc-r)',
                }}>
                {THEME_LABELS[th]}
              </button>
            ))}
          </div>

          {/* Accent color dots + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {ACCENT_PRESETS.map(a => (
              <button key={a} onClick={() => setAccent(a)}
                style={{
                  width: 14, height: 14, borderRadius: '50%', background: a, cursor: 'pointer',
                  border: accent === a ? '2px solid var(--tc-text)' : `1px solid var(--tc-border)`,
                  padding: 0, flexShrink: 0,
                }} />
            ))}
            <button onClick={signOut}
              style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--tc-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, accent, setTheme, setAccent }  = useTheme();
  const [activeTab,     setActiveTab]     = useState<Tab>('rephrase');
  const [loadedSession, setLoadedSession] = useState<HistoryEntry | null>(null);
  const [mobileOpen,    setMobileOpen]    = useState(false);

  const { entries, loading: histLoading, clearAll } = useHistory();

  const handleLoadSession = useCallback((entry: HistoryEntry) => {
    setLoadedSession(entry);
    setActiveTab(TAB_ID_MAP[entry.type] ?? 'rephrase');
  }, []);

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--tc-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--tc-muted)' }}>
        <Spin size={16} /><span style={{ fontSize: 13 }}>Loading…</span>
      </div>
    </div>
  );

  if (!user) return <AuthPage />;

  return (
    <>
      {/* Mobile-only hamburger strip */}
      <div className="mobile-topbar">
        <button onClick={() => setMobileOpen(true)}
          style={{ width: 32, height: 32, border: `var(--tc-bw) solid var(--tc-border)`, borderRadius: 'var(--tc-r)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tc-muted)', flexShrink: 0 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: 'var(--tc-accent)', border: `var(--tc-bw) solid var(--tc-border)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tc-on)', fontWeight: 900, fontSize: 8 }}>CO</div>
          <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--tc-text)', fontFamily: 'var(--font-geist-mono), monospace' }}>Convey</span>
        </div>
      </div>

      <div className="app-layout">
        {theme === 'glass' && (
          <div className="tc-blobs" aria-hidden>
            <span className="b1" /><span className="b2" /><span className="b3" />
          </div>
        )}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          accent={accent}
          setTheme={setTheme}
          setAccent={setAccent}
          email={user.email ?? ''}
          signOut={signOut}
          entries={entries}
          histLoading={histLoading}
          onLoadSession={handleLoadSession}
          onClearAll={clearAll}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="scrollbar-hide app-main" style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <div key={activeTab} className="fade-in-up">
            {activeTab === 'rephrase'        && <RephraseTab        loadSession={loadedSession?.type === 'rephrase'        ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'quickreply'      && <QuickReplyTab      loadSession={loadedSession?.type === 'quickreply'      ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'analyzer'        && <ToneAnalyzerTab    loadSession={loadedSession?.type === 'analyzer'        ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'polish'          && <PolishTab          loadSession={loadedSession?.type === 'polish'          ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'standup'         && <StandupTab         loadSession={loadedSession?.type === 'standup'         ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'chatanalyzer'    && <ChatAnalyzerTab    loadSession={loadedSession?.type === 'chatanalyzer'    ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'occasionmessage' && <OccasionMessageTab loadSession={loadedSession?.type === 'occasionmessage' ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'giftmessage'     && <GiftMessageTab     loadSession={loadedSession?.type === 'giftmessage'     ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'emailsubject'    && <EmailSubjectTab    loadSession={loadedSession?.type === 'emailsubject'    ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'emailwriter'     && <EmailWriterTab     loadSession={loadedSession?.type === 'emailwriter'     ? loadedSession : null} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'promptenhancer'  && <PromptEnhancerTab />}
            {activeTab === 'agentgenerator'  && <AgentGeneratorTab />}
            {activeTab === 'wordsuggest'     && <WordSuggestTab />}
          </div>
        </main>
      </div>

      <OfflineGame />
    </>
  );
}
