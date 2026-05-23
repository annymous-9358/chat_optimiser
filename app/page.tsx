'use client';

import { useState, useCallback, useEffect } from 'react';
import RephraseTab from './components/RephraseTab';
import QuickReplyTab from './components/QuickReplyTab';
import ToneAnalyzerTab from './components/ToneAnalyzerTab';
import PolishTab from './components/PolishTab';
import StandupTab from './components/StandupTab';

type Tab = 'rephrase' | 'quickreply' | 'analyzer' | 'polish' | 'standup';

type Session = {
  id: string;
  timestamp: number;
  message: string;
  tone: string;
  toneName: string;
  toneEmoji: string;
  suggestions: string[];
};

const TABS: { id: Tab; label: string; emoji: string; desc: string; accent: string }[] = [
  { id: 'rephrase',   label: 'Rephrase',      emoji: '✨', desc: 'Rewrite in any tone',      accent: 'from-indigo-600 to-violet-600' },
  { id: 'quickreply', label: 'Quick Reply',   emoji: '💬', desc: 'Smart reply suggestions',   accent: 'from-cyan-500 to-blue-500' },
  { id: 'analyzer',   label: 'Tone Check',    emoji: '🔍', desc: 'Analyse message tone',      accent: 'from-emerald-500 to-teal-500' },
  { id: 'polish',     label: 'Polish',        emoji: '🛠️', desc: 'Fix, shorten, expand…',    accent: 'from-amber-500 to-orange-500' },
  { id: 'standup',    label: 'Standup',       emoji: '📋', desc: 'Daily DSM + timesheet',     accent: 'from-purple-600 to-indigo-600' },
];

const TAB_ACTIVE: Record<Tab, string> = {
  rephrase:   'border-indigo-500 text-indigo-700 bg-indigo-50',
  quickreply: 'border-cyan-500 text-cyan-700 bg-cyan-50',
  analyzer:   'border-emerald-500 text-emerald-700 bg-emerald-50',
  polish:     'border-amber-500 text-amber-700 bg-amber-50',
  standup:    'border-purple-500 text-purple-700 bg-purple-50',
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('rephrase');
  const [history, setHistory] = useState<Session[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadedSession, setLoadedSession] = useState<Session | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rephrase_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const saveToHistory = useCallback(
    (msg: string, toneId: string, toneName: string, toneEmoji: string, suggestions: string[]) => {
      const session: Session = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        message: msg,
        tone: toneId,
        toneName,
        toneEmoji,
        suggestions,
      };
      setHistory((prev) => {
        const updated = [session, ...prev].slice(0, 30);
        localStorage.setItem('rephrase_history', JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const deleteSession = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem('rephrase_history', JSON.stringify(updated));
      return updated;
    });
    setExpandedId((cur) => (cur === id ? null : cur));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('rephrase_history');
    setExpandedId(null);
  }, []);

  const loadSession = useCallback((session: Session) => {
    setLoadedSession(session);
    setActiveTab('rephrase');
    setHistoryOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow">
              C
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Chat Optimiser
            </span>
          </div>
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              historyOpen
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>🕐</span>
            History
            {history.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${historyOpen ? 'bg-white/20 text-white' : 'bg-indigo-500 text-white'}`}>
                {history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex gap-6 items-start">
        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Tab bar — horizontal scroll on mobile */}
          <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 sm:p-2 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 py-2.5 sm:py-3 px-3 sm:px-2 sm:flex-1 rounded-xl border-2 transition-all duration-150 min-w-[72px] ${
                  activeTab === tab.id
                    ? TAB_ACTIVE[tab.id]
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
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
            {activeTab === 'rephrase'   && <RephraseTab onSave={saveToHistory} loadSession={loadedSession} onSessionLoaded={() => setLoadedSession(null)} />}
            {activeTab === 'quickreply' && <QuickReplyTab />}
            {activeTab === 'analyzer'   && <ToneAnalyzerTab />}
            {activeTab === 'polish'     && <PolishTab />}
            {activeTab === 'standup'    && <StandupTab />}
          </div>
        </main>

        {/* Mobile backdrop */}
        {historyOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setHistoryOpen(false)}
          />
        )}

        {/* History sidebar — overlay on mobile, sidebar on desktop */}
        {historyOpen && (
          <aside className="fixed top-0 right-0 h-full w-[85vw] max-w-xs z-30 slide-in-right lg:static lg:h-auto lg:max-w-none lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24">
            <div className="bg-white h-full lg:h-auto lg:rounded-2xl shadow-xl lg:shadow-sm border-l lg:border border-slate-200 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">History</span>
                  <span className="text-xs text-slate-400">({history.length})</span>
                </div>
                <div className="flex items-center gap-3">
                  {history.length > 0 && (
                    <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 transition font-medium">
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
                    ×
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 lg:max-h-[calc(100vh-12rem)]">
                {history.length === 0 ? (
                  <div className="px-4 py-12 text-center text-slate-400 text-sm">
                    <div className="text-4xl mb-3">📭</div>
                    No sessions yet.<br />
                    <span className="text-xs">Your rephrasings will appear here.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {history.map((session) => (
                      <div key={session.id}>
                        <button
                          onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition group/row"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-lg flex-shrink-0 mt-0.5">{session.toneEmoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-xs font-semibold text-indigo-600 truncate">{session.toneName}</span>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="text-[10px] text-slate-400">{timeAgo(session.timestamp)}</span>
                                  <button
                                    onClick={(e) => deleteSession(session.id, e)}
                                    className="text-slate-300 hover:text-red-400 transition text-base leading-none opacity-0 group-hover/row:opacity-100"
                                  >×</button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 truncate">{session.message}</p>
                            </div>
                          </div>
                        </button>

                        {expandedId === session.id && (
                          <div className="px-4 pb-4 pt-2 space-y-2 bg-slate-50 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Original</p>
                            <p className="text-xs text-slate-500 italic bg-white rounded-lg p-2 border border-slate-100">
                              {session.message}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">Suggestions</p>
                            {session.suggestions.map((s, i) => (
                              <div key={i} className="bg-white rounded-lg p-2.5 text-xs text-slate-700 leading-relaxed border border-slate-100">
                                <span className="font-bold text-indigo-500 mr-1">{i + 1}.</span>{s}
                              </div>
                            ))}
                            <button
                              onClick={() => loadSession(session)}
                              className="w-full mt-1 text-xs py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition"
                            >
                              Load this session →
                            </button>
                          </div>
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
