'use client';

import { AuthProvider }    from './context/AuthContext';
import { HistoryProvider } from './context/HistoryContext';
import { ThemeProvider }   from './context/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HistoryProvider>{children}</HistoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
