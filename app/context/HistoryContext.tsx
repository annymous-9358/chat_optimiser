'use client';

import {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

export type TabType = 'rephrase' | 'quickreply' | 'analyzer' | 'polish' | 'standup';

export type HistoryEntry = {
  id: string;
  type: TabType;
  timestamp: number;
  emoji: string;
  label: string;
  preview: string;
  data: Record<string, unknown>;
};

type HistoryCtx = {
  entries: HistoryEntry[];
  loading: boolean;
  saveEntry:   (e: Omit<HistoryEntry, 'id' | 'timestamp'>) => Promise<HistoryEntry>;
  deleteEntry: (id: string) => void;
  clearAll:    () => void;
};

const Ctx = createContext<HistoryCtx | null>(null);

const CACHE_KEY = 'chat_history_cache';

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;   // wait for auth to resolve

    if (!user) {
      // Logged out — wipe local cache so next user starts clean.
      setEntries([]);
      try { localStorage.removeItem(CACHE_KEY); } catch {}
      setLoading(false);
      return;
    }

    // Hydrate from cache immediately (no flash on load).
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setEntries(JSON.parse(cached));
    } catch {}

    // Then sync from DB — auth session flows via cookies automatically.
    fetch('/api/history')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.entries) {
          setEntries(d.entries);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(d.entries)); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const persist = useCallback((next: HistoryEntry[]) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
    setEntries(next);
  }, []);

  const saveEntry = useCallback(async (
    partial: Omit<HistoryEntry, 'id' | 'timestamp'>,
  ): Promise<HistoryEntry> => {
    const full: HistoryEntry = {
      ...partial,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setEntries(prev => {
      const next = [full, ...prev].slice(0, 100);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    // Fire-and-forget — cookies carry the auth session.
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: full }),
    }).catch(() => {});
    return full;
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/history/${id}`, { method: 'DELETE' }).catch(() => {});
  }, []);

  const clearAll = useCallback(() => {
    persist([]);
    fetch('/api/history', { method: 'DELETE' }).catch(() => {});
  }, [persist]);

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
