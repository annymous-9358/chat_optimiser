'use client';

import { useState, useCallback } from 'react';

interface Props {
  text: string;
  className?: string;
}

export default function SpeakButton({ text, className = '' }: Props) {
  const [speaking, setSpeaking] = useState(false);

  const toggle = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [text, speaking]);

  if (typeof window !== 'undefined' && !('speechSynthesis' in window)) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={speaking ? 'Stop speaking' : 'Listen'}
      aria-label={speaking ? 'Stop speaking' : 'Listen'}
      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        speaking
          ? 'bg-violet-100 text-violet-600 scale-105'
          : 'text-slate-300 hover:text-violet-500 hover:bg-violet-50'
      } ${className}`}
    >
      {speaking ? (
        /* Stop icon */
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6"  y="4" width="4" height="16" rx="2" />
          <rect x="14" y="4" width="4" height="16" rx="2" />
        </svg>
      ) : (
        /* Speaker icon */
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.536 8.464a5 5 0 010 7.072M12 6v12M9.5 8.5A4 4 0 009.5 15.5m9.571-9.571a9 9 0 010 12.728" />
        </svg>
      )}
    </button>
  );
}
