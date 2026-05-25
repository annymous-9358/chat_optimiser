'use client';

import { useState, useRef, useCallback } from 'react';

interface Props {
  onResult: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceInput({ onResult, disabled, className = '' }: Props) {
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  const toggle = useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setUnsupported(true);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onerror  = () => setListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join('');
      onResult(transcript);
    };

    rec.start();
    recRef.current = rec;
  }, [listening, onResult]);

  if (unsupported) return null; // silently hide on unsupported browsers

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      title={listening ? 'Stop recording' : 'Speak to type'}
      aria-label={listening ? 'Stop recording' : 'Speak to type'}
      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
        listening
          ? 'bg-red-500 text-white shadow-md shadow-red-200/60 scale-105'
          : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 border border-transparent hover:border-indigo-100'
      } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {listening ? (
        /* Stop icon — two vertical bars */
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6"  y="4" width="4" height="16" rx="2" />
          <rect x="14" y="4" width="4" height="16" rx="2" />
        </svg>
      ) : (
        /* Mic icon */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}
