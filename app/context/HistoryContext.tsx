'use client';

import {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

export type TabType = 'rephrase' | 'quickreply' | 'analyzer' | 'polish' | 'standup' | 'chatanalyzer' | 'giftmessage' | 'occasionmessage' | 'emailsubject' | 'emailwriter' | 'promptenhancer' | 'agentgenerator' | 'wordsuggest';

export type HistoryEntry = {
  id: string;
  type: TabType;
  timestamp: number;
  emoji?: string;
  label: string;
  preview: string;
  data: Record<string, unknown>;
};

// Archived entry carries when it was archived + when it ages out of the UI.
// The DB row is NEVER deleted — permanentDeleteAt is a UI-only concept that
// controls visibility. Admins can restore any row by flipping is_deleted = false
// directly in the Supabase dashboard.
export type ArchivedEntry = HistoryEntry & {
  deletedAt:        number; // unix ms — when the item was archived
  permanentDeleteAt: number; // unix ms — when it disappears from archive UI
};

type ClearResult = { archivedCount: number };

type HistoryCtx = {
  // Active entries
  entries:     HistoryEntry[];
  loading:     boolean;
  saveEntry:   (e: Omit<HistoryEntry, 'id' | 'timestamp'>) => Promise<HistoryEntry>;
  deleteEntry: (id: string) => void;       // soft-delete → archive
  clearAll:    () => Promise<ClearResult>; // archive all active entries

  // Archive (items within retention window — DB rows never deleted by app)
  archivedEntries: ArchivedEntry[];
  archiveLoading:  boolean;
  retentionDays:   number;
  loadArchive:     () => void;
  restoreEntry:    (id: string) => void; // move back to active
};

const Ctx = createContext<HistoryCtx | null>(null);

const CACHE_KEY = 'chat_history_cache';

// ── Map a raw DB row to ArchivedEntry ────────────────────────────────────────
function mapArchived(row: Record<string, unknown>, retentionDays: number): ArchivedEntry {
  const deletedAt = row.deleted_at
    ? new Date(String(row.deleted_at)).getTime()
    : Date.now();

  return {
    id:               String(row.id),
    type:             row.type as TabType,
    timestamp:        Number(row.timestamp),
    emoji:            String(row.emoji ?? ''),
    label:            String(row.label ?? ''),
    preview:          String(row.preview ?? ''),
    data:             (row.data ?? {}) as Record<string, unknown>,
    deletedAt,
    permanentDeleteAt: deletedAt + retentionDays * 86_400_000,
  };
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [entries,         setEntries]         = useState<HistoryEntry[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [archivedEntries, setArchivedEntries] = useState<ArchivedEntry[]>([]);
  const [archiveLoading,  setArchiveLoading]  = useState(false);
  const [retentionDays,   setRetentionDays]   = useState(30);

  // ── Boot: load active entries from cache + DB ──────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setEntries([]);
      setArchivedEntries([]);
      try { localStorage.removeItem(CACHE_KEY); } catch {}
      setLoading(false);
      return;
    }

    // Hydrate from localStorage immediately (no flash).
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setEntries(JSON.parse(cached));
    } catch {}

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

  // ── Save a new entry (optimistic) ─────────────────────────────────────────
  const saveEntry = useCallback(async (
    partial: Omit<HistoryEntry, 'id' | 'timestamp'>,
  ): Promise<HistoryEntry> => {
    const full: HistoryEntry = {
      ...partial,
      id:        crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setEntries(prev => {
      const next = [full, ...prev].slice(0, 100);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/history', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ entry: full }),
    }).catch(() => {});
    return full;
  }, []);

  // ── Soft-delete one active entry (archive it) ─────────────────────────────
  // DB row is never hard-deleted — only is_deleted flag is set.
  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setArchivedEntries(prev => prev.filter(e => e.id !== id));
    fetch(`/api/history/${id}`, { method: 'DELETE' }).catch(() => {});
  }, []);

  // ── Archive all active entries ─────────────────────────────────────────────
  // DB rows are never hard-deleted.
  const clearAll = useCallback(async (): Promise<ClearResult> => {
    const count = entries.length;
    persist([]);
    setArchivedEntries([]);
    try {
      await fetch('/api/history', { method: 'DELETE' });
    } catch {}
    return { archivedCount: count };
  }, [entries.length, persist]);

  // ── Load archived entries (lazy) ───────────────────────────────────────────
  // Returns only items within the retention window configured in app_config.
  // Items outside the window are still in DB but not shown in UI.
  const loadArchive = useCallback(() => {
    setArchiveLoading(true);
    fetch('/api/history?archived=1')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!d) return;
        const days: number = typeof d.retentionDays === 'number' ? d.retentionDays : 30;
        setRetentionDays(days);
        if (d.entries) {
          setArchivedEntries(d.entries.map((row: Record<string, unknown>) => mapArchived(row, days)));
        }
      })
      .catch(() => {})
      .finally(() => setArchiveLoading(false));
  }, []);

  // ── Restore one archived entry back to active ──────────────────────────────
  const restoreEntry = useCallback((id: string) => {
    setArchivedEntries(prev => prev.filter(e => e.id !== id));
    fetch(`/api/history/${id}`, { method: 'PATCH' })
      .then(r => (r.ok ? fetch('/api/history') : null))
      .then(r => (r && r.ok ? r.json() : null))
      .then(d => {
        if (d?.entries) {
          setEntries(d.entries);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(d.entries)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Ctx.Provider value={{
      entries, loading,
      saveEntry, deleteEntry, clearAll,
      archivedEntries, archiveLoading, retentionDays,
      loadArchive, restoreEntry,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHistory must be inside HistoryProvider');
  return ctx;
}
