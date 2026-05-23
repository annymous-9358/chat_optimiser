'use client';

import { useState, useCallback } from 'react';
import { useAuth, type OAuthProvider } from './context/AuthContext';
import { useHistory, HistoryEntry } from './context/HistoryContext';
import RephraseTab    from './components/RephraseTab';
import QuickReplyTab  from './components/QuickReplyTab';
import ToneAnalyzerTab from './components/ToneAnalyzerTab';
import PolishTab      from './components/PolishTab';
import StandupTab     from './components/StandupTab';

type Tab = 'rephrase' | 'quickreply' | 'analyzer' | 'polish' | 'standup';

const TABS: { id: Tab; label: string; emoji: string; desc: string }[] = [
  { id: 'rephrase',   label: 'Rephrase',    emoji: '✨', desc: 'Rewrite in any tone'    },
  { id: 'quickreply', label: 'Quick Reply', emoji: '💬', desc: 'Smart reply suggestions' },
  { id: 'analyzer',   label: 'Tone Check',  emoji: '🔍', desc: 'Analyse message tone'   },
  { id: 'polish',     label: 'Polish',      emoji: '🛠️', desc: 'Fix, shorten, expand…'  },
  { id: 'standup',    label: 'Standup',     emoji: '📋', desc: 'Daily DSM + timesheet'   },
];

const TAB_ACTIVE: Record<Tab, string> = {
  rephrase:   'border-indigo-500 text-indigo-700 bg-indigo-50',
  quickreply: 'border-cyan-500 text-cyan-700 bg-cyan-50',
  analyzer:   'border-emerald-500 text-emerald-700 bg-emerald-50',
  polish:     'border-amber-500 text-amber-700 bg-amber-50',
  standup:    'border-purple-500 text-purple-700 bg-purple-50',
};

const TYPE_COLORS: Record<string, string> = {
  rephrase:   'text-indigo-600',
  quickreply: 'text-cyan-600',
  analyzer:   'text-emerald-600',
  polish:     'text-amber-600',
  standup:    'text-purple-600',
};

const TYPE_NAMES: Record<string, string> = {
  rephrase:   'Rephrase',
  quickreply: 'Quick Reply',
  analyzer:   'Tone Check',
  polish:     'Polish',
  standup:    'Standup',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type LoadableSession = { id: string; message: string; tone: string; suggestions: string[] };
const REPLY_APPROACH = ['✅ Agreeable', '↔️ Neutral', '🚫 Declining'];

// ── Auth page ──────────────────────────────────────────────────────────────────
// ── OAuth brand config ─────────────────────────────────────────────────────────

function AuthPage() {
  const { signIn, signUp, signInWithOAuth } = useAuth();
  const [mode,        setMode]        = useState<'signin' | 'signup'>('signin');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [error,       setError]       = useState('');
  const [info,        setInfo]        = useState('');
  const [loading,     setLoading]     = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(''); setOauthLoading(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) { setError(error); setOauthLoading(null); }
    // On success the page redirects — no need to reset loading.
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

  if (info) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{info}</p>
          <button onClick={() => { setInfo(''); setMode('signin'); }} className="mt-5 text-indigo-600 text-sm font-semibold hover:underline">
            Back to sign in →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-3">
            C
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Chat Optimiser
          </h1>
          <p className="text-slate-500 text-sm mt-1">Rephrase any message in the perfect tone</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Google OAuth */}
          <button
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold bg-white hover:bg-gray-50 border border-slate-200 text-slate-700 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 mb-5"
          >
            {oauthLoading === 'google' ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or use email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} placeholder="Min 6 characters"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <span className="flex-shrink-0">⚠️</span> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (mode === 'signin' ? '→ Sign In' : '✨ Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Expanded history entry ─────────────────────────────────────────────────────
function ExpandedEntry({ entry, onLoad }: { entry: HistoryEntry; onLoad?: () => void }) {
  const d = entry.data;

  if (entry.type === 'rephrase') {
    const suggestions = (d.suggestions as string[]) ?? [];
    return (
      <div className="px-4 pb-4 pt-2 space-y-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Original</p>
        <p className="text-xs text-slate-500 italic bg-white rounded-lg p-2 border border-slate-100">{d.message as string}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">Suggestions</p>
        {suggestions.map((s, i) => (
          <div key={i} className="bg-white rounded-lg p-2.5 text-xs text-slate-700 leading-relaxed border border-slate-100">
            <span className="font-bold text-indigo-500 mr-1">{i + 1}.</span>{s}
          </div>
        ))}
        <button onClick={onLoad} className="w-full mt-1 text-xs py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition">
          Load this session →
        </button>
      </div>
    );
  }

  if (entry.type === 'quickreply') {
    const replies = (d.replies as string[]) ?? [];
    return (
      <div className="px-4 pb-4 pt-2 space-y-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Message Received</p>
        <p className="text-xs text-slate-500 italic bg-white rounded-lg p-2 border border-slate-100">{d.receivedMessage as string}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">Replies</p>
        {replies.map((r, i) => (
          <div key={i} className="bg-white rounded-lg p-2.5 text-xs text-slate-700 leading-relaxed border border-slate-100">
            <span className="font-bold text-cyan-500 mr-1">{REPLY_APPROACH[i]}:</span> {r}
          </div>
        ))}
      </div>
    );
  }

  if (entry.type === 'analyzer') {
    const analysis = d.analysis as { verdict?: string; tags?: string[] };
    return (
      <div className="px-4 pb-4 pt-2 space-y-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Verdict</p>
        <p className="text-xs text-slate-600 bg-white rounded-lg p-2 border border-slate-100 leading-relaxed">{analysis?.verdict}</p>
        {(analysis?.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {analysis?.tags?.map(tag => (
              <span key={tag} className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (entry.type === 'polish') {
    const orig = (d.message as string) ?? '';
    const res  = (d.result  as string) ?? '';
    return (
      <div className="px-4 pb-4 pt-2 space-y-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Original</p>
        <p className="text-xs text-slate-500 italic bg-white rounded-lg p-2 border border-slate-100">
          {orig.slice(0, 120)}{orig.length > 120 ? '…' : ''}
        </p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">Result</p>
        <p className="text-xs text-slate-700 bg-white rounded-lg p-2 border border-amber-100 leading-relaxed">
          {res.slice(0, 200)}{res.length > 200 ? '…' : ''}
        </p>
      </div>
    );
  }

  if (entry.type === 'standup') {
    const sd = d as { formatted?: string; date?: string };
    return (
      <div className="px-4 pb-4 pt-2 space-y-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Formatted DSM</p>
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-2 border border-purple-100 max-h-48 overflow-y-auto">
          {sd?.formatted}
        </pre>
      </div>
    );
  }

  return null;
}

// ── Main app ───────────────────────────────────────────────────────────────────
export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab,    setActiveTab]    = useState<Tab>('rephrase');
  const [historyOpen,  setHistoryOpen]  = useState(false);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [loadedSession, setLoadedSession] = useState<LoadableSession | null>(null);

  const { entries, loading: histLoading, deleteEntry, clearAll } = useHistory();

  const handleLoadSession = useCallback((entry: HistoryEntry) => {
    if (entry.type !== 'rephrase') return;
    const d = entry.data;
    setLoadedSession({
      id: entry.id,
      message:     d.message     as string,
      tone:        d.tone        as string,
      suggestions: d.suggestions as string[],
    });
    setActiveTab('rephrase');
    setHistoryOpen(false);
  }, []);

  // ── Loading splash ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 animate-pulse shadow-lg" />
      </div>
    );
  }

  // ── Auth wall ──
  if (!user) return <AuthPage />;

  // ── Main UI ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
              C
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent whitespace-nowrap">
              Chat Optimiser
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* User email */}
            <span className="text-xs text-slate-400 hidden sm:block truncate max-w-[160px]">{user.email}</span>
            <button
              onClick={signOut}
              className="text-xs text-slate-500 hover:text-red-500 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition whitespace-nowrap"
            >
              Sign out
            </button>
            <button
              onClick={() => setHistoryOpen(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                historyOpen ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🕐</span>
              History
              {entries.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${historyOpen ? 'bg-white/20 text-white' : 'bg-indigo-500 text-white'}`}>
                  {entries.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex gap-6 items-start">
        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 sm:p-2 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 py-2.5 sm:py-3 px-3 sm:px-2 sm:flex-1 rounded-xl border-2 transition-all duration-150 min-w-[72px] ${
                  activeTab === tab.id ? TAB_ACTIVE[tab.id] : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <span className="text-base sm:text-lg">{tab.emoji}</span>
                <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">{tab.label}</span>
                <span className="text-[9px] text-slate-400 hidden sm:block">{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div key={activeTab} className="fade-in-up">
            {activeTab === 'rephrase'   && <RephraseTab loadSession={loadedSession} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'quickreply' && <QuickReplyTab />}
            {activeTab === 'analyzer'   && <ToneAnalyzerTab />}
            {activeTab === 'polish'     && <PolishTab />}
            {activeTab === 'standup'    && <StandupTab />}
          </div>
        </main>

        {/* Mobile backdrop */}
        {historyOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm" onClick={() => setHistoryOpen(false)} />
        )}

        {/* History sidebar */}
        {historyOpen && (
          <aside className="fixed top-0 right-0 h-full w-[85vw] max-w-xs z-30 slide-in-right lg:static lg:h-auto lg:max-w-none lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24">
            <div className="bg-white h-full lg:h-auto lg:rounded-2xl shadow-xl lg:shadow-sm border-l lg:border border-slate-200 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">History</span>
                  {histLoading
                    ? <span className="text-xs text-slate-400 animate-pulse">syncing…</span>
                    : <span className="text-xs text-slate-400">({entries.length})</span>
                  }
                </div>
                <div className="flex items-center gap-3">
                  {entries.length > 0 && (
                    <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-600 transition font-medium">
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 lg:max-h-[calc(100vh-12rem)]">
                {entries.length === 0 ? (
                  <div className="px-4 py-12 text-center text-slate-400 text-sm">
                    <div className="text-4xl mb-3">📭</div>
                    No history yet.<br />
                    <span className="text-xs">All tabs are saved here across sessions.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {entries.map(entry => (
                      <div key={entry.id}>
                        <button
                          onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition group/row"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-lg flex-shrink-0 mt-0.5">{entry.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`text-xs font-semibold truncate ${TYPE_COLORS[entry.type] ?? 'text-slate-600'}`}>
                                    {entry.label}
                                  </span>
                                  <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                                    {TYPE_NAMES[entry.type] ?? entry.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="text-[10px] text-slate-400">{timeAgo(entry.timestamp)}</span>
                                  <button
                                    onClick={e => { e.stopPropagation(); deleteEntry(entry.id); setExpandedId(cur => cur === entry.id ? null : cur); }}
                                    className="text-slate-300 hover:text-red-400 transition text-base leading-none opacity-0 group-hover/row:opacity-100"
                                  >×</button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 truncate">{entry.preview}</p>
                            </div>
                          </div>
                        </button>

                        {expandedId === entry.id && (
                          <ExpandedEntry
                            entry={entry}
                            onLoad={entry.type === 'rephrase' ? () => handleLoadSession(entry) : undefined}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
