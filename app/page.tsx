'use client';

import { useState, useCallback } from 'react';
import { useAuth, type OAuthProvider } from './context/AuthContext';
import { useHistory, HistoryEntry, ArchivedEntry } from './context/HistoryContext';
import { useTheme } from './context/ThemeContext';
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

type Tab         = 'rephrase' | 'quickreply' | 'analyzer' | 'polish' | 'standup' | 'chatanalyzer' | 'giftmessage' | 'occasionmessage' | 'emailsubject' | 'emailwriter';
type SidebarView = 'history' | 'archive';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'rephrase', label: 'Rephrase',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  },
  {
    id: 'quickreply', label: 'Quick Reply',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  },
  {
    id: 'analyzer', label: 'Tone Check',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  {
    id: 'polish', label: 'Polish',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  },
  {
    id: 'standup', label: 'Standup',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  },
  {
    id: 'chatanalyzer', label: 'Chat Insights',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  },
  {
    id: 'occasionmessage', label: 'Occasions',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>,
  },
  {
    id: 'giftmessage', label: 'Gift Message',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  },
  {
    id: 'emailsubject', label: 'Email Subject',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  },
  {
    id: 'emailwriter', label: 'Email Writer',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  },
];

const TYPE_LABELS: Record<string, string> = {
  rephrase:        'Rephrase',
  quickreply:      'Quick Reply',
  analyzer:        'Tone Check',
  polish:          'Polish',
  standup:         'Standup',
  chatanalyzer:    'Chat Insights',
  giftmessage:     'Gift Message',
  occasionmessage: 'Occasions',
  emailsubject:    'Email Subject',
  emailwriter:     'Email Writer',
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

const REPLY_APPROACH = ['Agreeable', 'Neutral', 'Declining'];

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

  if (info) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Check your email</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{info}</p>
          <button onClick={() => { setInfo(''); setMode('signin'); }}
            className="mt-5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold tracking-tight shadow-lg shadow-indigo-200">
              CO
            </div>
            <span className="text-base font-semibold text-slate-900">ToneCraft</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'signin' ? 'Sign in to access your history and settings.' : "Get started — it's free."}
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={() => handleOAuth('google')}
          disabled={!!oauthLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-60"
        >
          {oauthLoading === 'google' ? (
            <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">or continue with email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Mode toggle */}
        <div className="flex border-b border-slate-200 mb-5">
          {(['signin', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`pb-2.5 px-1 mr-5 text-sm font-medium transition border-b-2 -mb-px ${
                mode === m ? 'text-slate-900 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}>
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all" />
          </div>
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
              </span>
            ) : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Expanded history entry ────────────────────────────────────────────────────
function ExpandedEntry({ entry, onLoad }: { entry: HistoryEntry; onLoad?: () => void }) {
  const d = entry.data;

  if (entry.type === 'rephrase') {
    const suggestions = (d.suggestions as string[]) ?? [];
    return (
      <div className="px-4 pb-4 pt-3 space-y-2.5 bg-slate-50/80 border-t border-slate-100">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Original</p>
          <p className="text-xs text-slate-600 bg-white rounded-xl p-2.5 border border-slate-200/80 leading-relaxed italic">{d.message as string}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Suggestions</p>
          {suggestions.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-2.5 text-xs text-slate-700 leading-relaxed border border-slate-200/80 mb-1.5">
              <span className="font-bold text-slate-300 mr-1.5">{i + 1}.</span>{s}
            </div>
          ))}
        </div>
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  if (entry.type === 'quickreply') {
    const replies = (d.replies as string[]) ?? [];
    return (
      <div className="px-4 pb-4 pt-3 space-y-2.5 bg-slate-50/80 border-t border-slate-100">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Message received</p>
          <p className="text-xs text-slate-600 bg-white rounded-xl p-2.5 border border-slate-200/80 italic leading-relaxed">{d.receivedMessage as string}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Replies</p>
          {replies.map((r, i) => (
            <div key={i} className="bg-white rounded-xl p-2.5 text-xs text-slate-700 leading-relaxed border border-slate-200/80 mb-1.5">
              <span className="font-semibold text-slate-400 mr-1">{REPLY_APPROACH[i]}:</span> {r}
            </div>
          ))}
        </div>
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  if (entry.type === 'analyzer') {
    const analysis = d.analysis as { verdict?: string; tags?: string[] };
    return (
      <div className="px-4 pb-4 pt-3 space-y-2 bg-slate-50/80 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Verdict</p>
        <p className="text-xs text-slate-700 bg-white rounded-xl p-2.5 border border-slate-200/80 leading-relaxed">{analysis?.verdict}</p>
        {(analysis?.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {analysis?.tags?.map(tag => (
              <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  if (entry.type === 'polish') {
    const orig = (d.message as string) ?? '';
    const res  = (d.result  as string) ?? '';
    return (
      <div className="px-4 pb-4 pt-3 space-y-2.5 bg-slate-50/80 border-t border-slate-100">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Original</p>
          <p className="text-xs text-slate-600 italic bg-white rounded-xl p-2.5 border border-slate-200/80">{orig.slice(0, 120)}{orig.length > 120 ? '…' : ''}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Result</p>
          <p className="text-xs text-slate-700 bg-white rounded-xl p-2.5 border border-slate-200/80 leading-relaxed">{res.slice(0, 200)}{res.length > 200 ? '…' : ''}</p>
        </div>
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  if (entry.type === 'standup') {
    const sd = d as { formatted?: string };
    return (
      <div className="px-4 pb-4 pt-3 space-y-2 bg-slate-50/80 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Formatted standup</p>
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-xl p-2.5 border border-slate-200/80 max-h-48 overflow-y-auto">{sd?.formatted}</pre>
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  if (entry.type === 'chatanalyzer') {
    const cd = d as { mode?: string; analysis?: { summary?: string; sentiment?: string }; purpose?: string; toneLabel?: string; messages?: string[] };
    if (cd.mode === 'analyze') {
      return (
        <div className="px-4 pb-4 pt-3 space-y-2 bg-slate-50/80 border-t border-slate-100">
          {cd.analysis?.sentiment && (
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{cd.analysis.sentiment}</span>
          )}
          <p className="text-xs text-slate-700 bg-white rounded-xl p-2.5 border border-slate-200/80 leading-relaxed">{cd.analysis?.summary}</p>
          <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
            Load session
          </button>
        </div>
      );
    }
    const msgs = cd.messages ?? [];
    return (
      <div className="px-4 pb-4 pt-3 space-y-2 bg-slate-50/80 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Purpose · {cd.toneLabel}</p>
        <p className="text-xs text-slate-500 italic mb-1.5">{cd.purpose?.slice(0, 80)}</p>
        {msgs.slice(0, 2).map((m, i) => (
          <p key={i} className="text-xs text-slate-700 bg-white rounded-xl p-2.5 border border-slate-200/80 leading-relaxed">
            <span className="font-bold text-slate-300 mr-1">{i + 1}.</span>{m}
          </p>
        ))}
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  if (entry.type === 'giftmessage') {
    const gd = d as { occasion?: string; relationship?: string; styleLabel?: string; messages?: string[] };
    const msgs = gd.messages ?? [];
    return (
      <div className="px-4 pb-4 pt-3 space-y-2 bg-slate-50/80 border-t border-slate-100">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {gd.occasion && <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{gd.occasion}</span>}
          {gd.styleLabel && <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{gd.styleLabel}</span>}
        </div>
        {msgs.slice(0, 2).map((m, i) => (
          <p key={i} className="text-xs text-slate-700 bg-white rounded-xl p-2.5 border border-slate-200/80 leading-relaxed">
            <span className="font-bold text-slate-300 mr-1">{i + 1}.</span>{m}
          </p>
        ))}
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  if (entry.type === 'occasionmessage') {
    const od = d as { occasion?: string; toneLabel?: string; lengthLabel?: string; messages?: string[] };
    const msgs = od.messages ?? [];
    return (
      <div className="px-4 pb-4 pt-3 space-y-2 bg-slate-50/80 border-t border-slate-100">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {od.occasion && <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{od.occasion}</span>}
          {od.toneLabel && <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{od.toneLabel}</span>}
          {od.lengthLabel && <span className="text-[10px] font-semibold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{od.lengthLabel}</span>}
        </div>
        {msgs.slice(0, 1).map((m, i) => (
          <p key={i} className="text-xs text-slate-700 bg-white rounded-xl p-2.5 border border-slate-200/80 leading-relaxed line-clamp-4">{m}</p>
        ))}
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  if (entry.type === 'emailsubject') {
    const ed = d as { subjects?: string[]; purpose?: string };
    const subjects = ed.subjects ?? [];
    return (
      <div className="px-4 pb-4 pt-3 space-y-2 bg-slate-50/80 border-t border-slate-100">
        {ed.purpose && (
          <p className="text-xs text-slate-500 italic">{ed.purpose.slice(0, 80)}</p>
        )}
        {subjects.slice(0, 3).map((s, i) => (
          <p key={i} className="text-xs text-slate-700 bg-white rounded-xl p-2.5 border border-slate-200/80 leading-relaxed">
            <span className="font-bold text-slate-300 mr-1">{i + 1}.</span>{s}
          </p>
        ))}
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  if (entry.type === 'emailwriter') {
    const ed = d as { subject?: string; body?: string; purpose?: string };
    return (
      <div className="px-4 pb-4 pt-3 space-y-2.5 bg-slate-50/80 border-t border-slate-100">
        {ed.subject && (
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Subject</p>
            <p className="text-xs text-slate-700 font-semibold bg-white rounded-xl p-2.5 border border-slate-200/80">{ed.subject}</p>
          </div>
        )}
        {ed.body && (
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Body preview</p>
            <p className="text-xs text-slate-600 bg-white rounded-xl p-2.5 border border-slate-200/80 leading-relaxed line-clamp-3">{ed.body.slice(0, 150)}…</p>
          </div>
        )}
        <button onClick={onLoad} className="w-full text-xs py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-700 transition-all">
          Load session
        </button>
      </div>
    );
  }

  return null;
}

// ── Days-remaining badge (UI-only — DB row is never deleted) ─────────────────
function DaysLeftBadge({ permanentDeleteAt }: { permanentDeleteAt: number }) {
  const days = Math.max(0, Math.ceil((permanentDeleteAt - Date.now()) / 86_400_000));
  if (days <= 0) return <span className="text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">Expiring</span>;
  if (days <= 7) return <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">{days}d left</span>;
  return <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">{days}d left</span>;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [activeTab,     setActiveTab]     = useState<Tab>('rephrase');
  const [historyOpen,   setHistoryOpen]   = useState(false);
  const [sidebarView,   setSidebarView]   = useState<SidebarView>('history');
  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [loadedSession, setLoadedSession] = useState<HistoryEntry | null>(null);

  const {
    entries, loading: histLoading,
    deleteEntry, clearAll,
    archivedEntries, archiveLoading, retentionDays,
    loadArchive, restoreEntry,
  } = useHistory();

  const handleLoadSession = useCallback((entry: HistoryEntry) => {
    setLoadedSession(entry);
    setActiveTab(entry.type as Tab);
    setHistoryOpen(false);
  }, []);

  const handleArchiveAll = useCallback(async () => {
    await clearAll();
  }, [clearAll]);

  const handleOpenArchive = useCallback(() => {
    setSidebarView('archive');
    loadArchive();
  }, [loadArchive]);

  // ── Loading splash ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="app-bg">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 glass border-b border-slate-200/70 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-md shadow-indigo-200">
              CO
            </div>
            <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">ToneCraft</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400 hidden sm:block truncate max-w-[160px]">{user.email}</span>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
            >
              {theme === 'dark' ? (
                /* Sun icon */
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 110 8 4 4 0 010-8z" />
                </svg>
              ) : (
                /* Moon icon */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={signOut}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              Sign out
            </button>
            <button
              onClick={() => setHistoryOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                historyOpen
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
              {entries.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${historyOpen ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                  {entries.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">
        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">

          {/* ── Pill tab bar ── */}
          <div className="glass rounded-2xl border border-slate-200/60 shadow-sm p-1.5 mb-5 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 min-w-max">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'tab-pill-active'
                      : 'tab-pill-inactive'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab content ── */}
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
          </div>
        </main>

        {/* ── Mobile backdrop ── */}
        {historyOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setHistoryOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        {historyOpen && (
          <aside className="fixed top-0 right-0 h-full w-[82vw] max-w-[300px] z-30 slide-in-right lg:static lg:h-auto lg:max-w-none lg:w-72 lg:flex-shrink-0 lg:sticky lg:top-[72px]">
            <div className="bg-white h-full lg:h-auto lg:rounded-2xl shadow-2xl lg:shadow-sm border-l lg:border border-slate-200/70 overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-card)' }}>

              {/* Sidebar header */}
              <div className="flex-shrink-0 border-b border-slate-100/80">
                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                  {/* Toggle */}
                  <div className="flex gap-0.5 bg-slate-100 rounded-xl p-0.5">
                    <button
                      onClick={() => setSidebarView('history')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        sidebarView === 'history' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      History
                      {entries.length > 0 && (
                        <span className="ml-1 text-[10px] text-slate-400">({entries.length})</span>
                      )}
                    </button>
                    <button
                      onClick={handleOpenArchive}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        sidebarView === 'archive' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Archive
                      {archivedEntries.length > 0 && (
                        <span className="ml-1 text-[10px] text-slate-400">({archivedEntries.length})</span>
                      )}
                    </button>
                  </div>

                  <button onClick={() => setHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 transition ml-1 p-1 rounded-lg hover:bg-slate-100" aria-label="Close">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* History sub-header */}
                {sidebarView === 'history' && (
                  <div className="flex items-center justify-between px-3 pb-2.5">
                    <span className="text-[10px] text-slate-400">
                      {histLoading ? 'Syncing…' : 'Deleted items go to Archive'}
                    </span>
                    {entries.length > 0 && (
                      <button onClick={handleArchiveAll} className="text-[11px] text-slate-400 hover:text-slate-600 transition font-semibold">
                        Archive all
                      </button>
                    )}
                  </div>
                )}

                {/* Archive sub-header */}
                {sidebarView === 'archive' && (
                  <div className="flex items-center justify-between px-3 pb-2.5">
                    <span className="text-[10px] text-slate-400">
                      {archiveLoading ? 'Loading…' : `Visible for ${retentionDays} days · data kept in DB`}
                    </span>
                  </div>
                )}
              </div>

              {/* ── HISTORY VIEW ── */}
              {sidebarView === 'history' && (
                <div className="overflow-y-auto flex-1 lg:max-h-[calc(100vh-11rem)]">
                  {entries.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-400">No history yet</p>
                      <p className="text-xs text-slate-400 mt-1">All tabs save here automatically.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100/80">
                      {entries.map(entry => (
                        <div key={entry.id}>
                          <div
                            role="button" tabIndex={0}
                            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            onKeyDown={e => e.key === 'Enter' && setExpandedId(expandedId === entry.id ? null : entry.id)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition cursor-pointer group/row"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="text-base flex-shrink-0 mt-0.5">{entry.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-xs font-semibold text-slate-700 truncate">{entry.label}</span>
                                    <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap font-medium">
                                      {TYPE_LABELS[entry.type] ?? entry.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-[10px] text-slate-400">{timeAgo(entry.timestamp)}</span>
                                    <button
                                      onClick={e => { e.stopPropagation(); deleteEntry(entry.id); setExpandedId(cur => cur === entry.id ? null : cur); }}
                                      className="text-slate-300 hover:text-red-400 transition opacity-0 group-hover/row:opacity-100 flex-shrink-0 p-0.5 rounded"
                                      aria-label="Archive entry"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{entry.preview}</p>
                              </div>
                            </div>
                          </div>

                          {expandedId === entry.id && (
                            <ExpandedEntry
                              entry={entry}
                              onLoad={() => handleLoadSession(entry)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── ARCHIVE VIEW ── */}
              {sidebarView === 'archive' && (
                <div className="overflow-y-auto flex-1 lg:max-h-[calc(100vh-11rem)]">
                  {archiveLoading ? (
                    <div className="px-4 py-12 text-center">
                      <Spinner className="h-5 w-5 text-slate-300 mx-auto" />
                    </div>
                  ) : archivedEntries.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-400">Archive is empty</p>
                      <p className="text-xs text-slate-400 mt-1">Archived items appear here for {retentionDays} days.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100/80">
                      {archivedEntries.map((entry: ArchivedEntry) => (
                        <div key={entry.id} className="px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <span className="text-base flex-shrink-0 mt-0.5 opacity-40">{entry.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs font-semibold text-slate-400 truncate">{entry.label}</span>
                                  <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap font-medium">
                                    {TYPE_LABELS[entry.type] ?? entry.type}
                                  </span>
                                </div>
                                <DaysLeftBadge permanentDeleteAt={entry.permanentDeleteAt} />
                              </div>
                              <p className="text-xs text-slate-400 truncate mb-2">{entry.preview}</p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { restoreEntry(entry.id); setSidebarView('history'); }}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                                >
                                  Restore
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
