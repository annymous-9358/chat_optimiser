'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function HomeHeader({ onPricing }: { onPricing?: () => void }) {
  const { user, loading } = useAuth();

  return (
    <header style={{
      borderBottom: '1px solid #e7e5e0', padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0,
      background: 'rgba(250,250,249,0.92)', backdropFilter: 'blur(10px)',
      zIndex: 10,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ width: 28, height: 28, background: '#18181b', border: '1px solid #e7e5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 900, fontSize: 9, fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '-.2px', flexShrink: 0 }}>CO</div>
        <span style={{ fontSize: 14, fontWeight: 900, color: '#1c1917', fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '-.2px' }}>Convey</span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/tools" style={{ fontSize: 13, color: '#57534e', textDecoration: 'none' }}>All tools</Link>

        {onPricing && (
          <button onClick={onPricing}
            style={{ fontSize: 13, color: '#57534e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            Pricing
          </button>
        )}

        {loading ? (
          <div style={{ width: 80, height: 34, borderRadius: 8, background: '#f0f0f0', animation: 'pulse 1.2s ease-in-out infinite' }} />
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
              {(user.email?.[0] ?? 'U').toUpperCase()}
            </div>
            <Link href="/app" style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#18181b', padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>
              Open app →
            </Link>
          </div>
        ) : (
          <Link href="/app" style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#18181b', padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>
            Sign in
          </Link>
        )}
      </nav>

      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
    </header>
  );
}
