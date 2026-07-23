'use client';

import { useState, useCallback } from 'react';

interface Props {
  text: string;
  title?: string;
  className?: string;
}

export default function ShareButton({ text, title = 'Convey', className = '' }: Props) {
  const [done, setDone] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      // user cancelled or clipboard failed — silent
    }
  }, [text, title]);

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share"
      aria-label="Share"
      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        done
          ? 'bg-green-100 text-green-600 scale-105'
          : 'text-slate-300 hover:text-green-500 hover:bg-green-50'
      } ${className}`}
    >
      {done ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )}
    </button>
  );
}
