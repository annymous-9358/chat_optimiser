'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HistoryEntry } from '../context/HistoryContext';

type SessionBridgeCtx = {
  loadedSession: HistoryEntry | null;
  loadSession: (entry: HistoryEntry) => void;
  clearLoadedSession: () => void;
};

const Ctx = createContext<SessionBridgeCtx | null>(null);

// Bridges "load this history entry" across a real route navigation (/app/[tool]).
// The layout holds this state so it survives the child page swapping out.
export function SessionBridgeProvider({ children }: { children: ReactNode }) {
  const [loadedSession, setLoadedSession] = useState<HistoryEntry | null>(null);

  const loadSession = useCallback((entry: HistoryEntry) => {
    setLoadedSession(entry);
  }, []);

  const clearLoadedSession = useCallback(() => {
    setLoadedSession(null);
  }, []);

  return (
    <Ctx.Provider value={{ loadedSession, loadSession, clearLoadedSession }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSessionBridge() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSessionBridge must be inside SessionBridgeProvider');
  return ctx;
}
