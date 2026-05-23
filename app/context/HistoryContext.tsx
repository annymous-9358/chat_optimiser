'use client';

import {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode,
} from 'react';

export type TabType = 'rephrase' | 'quickreply' | 'analyzer' | 'polish';

export type HistoryEntry = {
  id: string;
  type: TabType;
  timestamp: number;
  emoji: string;   // icon shown in sidebar
  label: string;   // e.g. "Love Chat", "Boss", "Assertive", "Shorten"
  preview: string; // first ~60 chars of the input message
  data: Record<string, unknown>;
};

type HistoryCtx = {
  entries: HistoryEntry[];
  loading: boolean;
  saveEntry: (e: Omit<HistoryEntry, 'id' | 'timestamp'>) => Promise<HistoryEntry>;
  deleteEntry: (id: string) => void;
  clearAll: () => void;
};

const Ctx = createContext<HistoryCtx | null>(null);

const SESSION_KEY = 'chat_session_id';
const CACHE_KEY   = 'chat_history_cache';

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(SESSION_KEY, id); }
  return id;
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading]  = useState(true);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);

    // Hydrate from cache immediately (no flash)
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setEntries(JSON.parse(cached));
    } catch {}

    // Then sync with DB
    fetch(`/api/history?sessionId=${sid}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.entries?.length) {
          setEntries(d.entries);
          localStorage.setItem(CACHE_KEY, JSON.stringify(d.entries));
        }
      })
      .catch(() => {}) // graceful fallback to cache
      .finally(() => setLoading(false));
  }, []);

  const persist = (next: HistoryEntry[]) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    setEntries(next);
  };

  const saveEntry = useCallback(async (
    partial: Omit<HistoryEntry, 'id' | 'timestamp'>,
  ): Promise<HistoryEntry> => {
    const full: HistoryEntry = {
      ...partial,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setEntries(prev => {
      const next = [full, ...prev].slice(0, 60);
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      return next;
    });
    // Fire-and-forget to DB
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, entry: full }),
    }).catch(() => {});
    return full;
  }, [sessionId]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      return next;
    });
    fetch(`/api/history/${id}`, { method: 'DELETE' }).catch(() => {});
  }, []);

  const clearAll = useCallback(() => {
    persist([]);
    fetch(`/api/history?sessionId=${sessionId}`, { method: 'DELETE' }).catch(() => {});
  }, [sessionId]);

  return (
    <Ctx.Provider value={{ entries, loading, saveEntry, deleteEntry, clearAll }}>
      {children}
    </Ctx.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHistory must be inside HistoryProvider');
  return ctx;
}
