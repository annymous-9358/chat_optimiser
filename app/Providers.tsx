'use client';

import { HistoryProvider } from './context/HistoryContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <HistoryProvider>{children}</HistoryProvider>;
}
