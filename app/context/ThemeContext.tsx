'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'brutalist' | 'editorial' | 'dark';

const ACCENT_DEFAULTS: Record<ThemeMode, string> = {
  brutalist: '#f5c518',
  editorial: '#18181b',
  dark:      '#f5c518',
};

function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function onColor(accent: string): string {
  return hexLuminance(accent) > 0.55 ? '#000000' : '#ffffff';
}

function applyTheme(theme: ThemeMode, accent: string) {
  const html = document.documentElement;
  html.dataset.theme = theme;
  html.classList.toggle('dark', theme === 'dark');
  html.style.setProperty('--tc-accent', accent);
  html.style.setProperty('--tc-on', onColor(accent));
}

type ThemeCtxType = {
  theme:     ThemeMode;
  accent:    string;
  setTheme:  (t: ThemeMode) => void;
  setAccent: (a: string) => void;
  toggle:    () => void;
};

const ThemeCtx = createContext<ThemeCtxType>({
  theme: 'brutalist', accent: '#f5c518',
  setTheme: () => {}, setAccent: () => {}, toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,  setThemeState]  = useState<ThemeMode>('brutalist');
  const [accent, setAccentState] = useState<string>('#f5c518');

  useEffect(() => {
    const savedTheme  = localStorage.getItem('co-theme') as ThemeMode | null;
    const savedAccent = localStorage.getItem('co-accent');
    const validThemes: ThemeMode[] = ['brutalist', 'editorial', 'dark'];
    const initialTheme: ThemeMode  = validThemes.includes(savedTheme as ThemeMode) ? (savedTheme as ThemeMode) : 'brutalist';
    const initialAccent = savedAccent ?? ACCENT_DEFAULTS[initialTheme];
    setThemeState(initialTheme);
    setAccentState(initialAccent);
    applyTheme(initialTheme, initialAccent);
  }, []);

  const setTheme = (t: ThemeMode) => {
    const savedAccent = localStorage.getItem('co-accent');
    const newAccent = savedAccent ?? ACCENT_DEFAULTS[t];
    setThemeState(t);
    setAccentState(newAccent);
    localStorage.setItem('co-theme', t);
    applyTheme(t, newAccent);
  };

  const setAccent = (a: string) => {
    setAccentState(a);
    localStorage.setItem('co-accent', a);
    document.documentElement.style.setProperty('--tc-accent', a);
    document.documentElement.style.setProperty('--tc-on', onColor(a));
  };

  const toggle = () => {
    const next: ThemeMode = theme === 'brutalist' ? 'editorial' : theme === 'editorial' ? 'dark' : 'brutalist';
    setTheme(next);
  };

  return (
    <ThemeCtx.Provider value={{ theme, accent, setTheme, setAccent, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
