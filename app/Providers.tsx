'use client';

import { AuthProvider }    from './context/AuthContext';
import { HistoryProvider } from './context/HistoryContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HistoryProvider>{children}</HistoryProvider>
    </AuthProvider>
  );
}
