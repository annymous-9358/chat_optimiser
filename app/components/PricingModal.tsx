'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: '',
    tagline: 'Get started with no commitment, ever.',
    color: '#78716c',
    highlight: false,
    badge: null,
    perks: [
      { text: '5 uses per day', sub: 'resets at midnight, across all tools' },
      { text: 'All 16 AI writing tools' },
      { text: 'AI Assistant — basic', sub: 'short answers (~100 words)' },
      { text: 'No file upload' },
    ],
    cta: 'Use for free',
    ctaStyle: { background: '#f5f5f4', color: '#57534e' },
  },
  {
    name: 'Starter',
    price: 49,
    period: '/mo',
    tagline: 'More room for regular writers.',
    color: '#6366f1',
    highlight: false,
    badge: null,
    perks: [
      { text: '50 uses per month', sub: 'resets on the 1st, across all tools' },
      { text: 'All 16 AI writing tools' },
      { text: 'AI Assistant — basic', sub: 'short answers (~100 words)' },
      { text: 'No file upload' },
    ],
    cta: 'Get Starter',
    ctaStyle: { background: '#18181b', color: '#fff' },
  },
  {
    name: 'Pro',
    price: 69,
    period: '/mo',
    tagline: 'Unlimited access, full AI power.',
    color: '#7c3aed',
    highlight: true,
    badge: 'Most Popular',
    perks: [
      { text: 'Unlimited uses', sub: 'no daily or monthly cap' },
      { text: 'All 16 AI writing tools' },
      { text: 'AI Assistant — full', sub: 'detailed answers (~600 words)' },
      { text: 'File upload in AI Assistant', sub: '.txt .csv .json .md .html .xml .log' },
    ],
    cta: 'Get Pro',
    ctaStyle: { background: '#7c3aed', color: '#fff' },
  },
];

function Check({ color }: { color: string }) {
  return (
    <svg style={{ width: 13, height: 13, flexShrink: 0, marginTop: 3, color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PricingModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 820, maxHeight: '90vh', background: '#fafaf9', borderRadius: 20, overflow: 'auto', boxShadow: '0 32px 80px -12px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ padding: '32px 32px 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, border: '1px solid #e7e5e0', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716c' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#6366f1', background: '#f0efff', padding: '5px 12px', borderRadius: 999, marginBottom: 14 }}>
            🎉 Limited launch pricing
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', color: '#1c1917', margin: '0 0 6px' }}>
            Simple pricing, no surprises
          </h2>
          <p style={{ fontSize: 14, color: '#78716c', margin: '0 0 28px' }}>
            All prices in INR. Individual plans. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{ borderRadius: 16, padding: '24px', border: plan.highlight ? '2px solid #7c3aed' : '1px solid #e7e5e0', background: plan.highlight ? 'linear-gradient(180deg,#f5f3ff 0%,#fafaf9 100%)' : '#fff', position: 'relative' }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 6 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, marginBottom: 6 }}>
                  {plan.price === 0 ? (
                    <span style={{ fontSize: 32, fontWeight: 900, color: '#1c1917', letterSpacing: '-.02em', lineHeight: 1 }}>Free</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 11, color: '#78716c', marginTop: 2 }}>₹</span>
                      <span style={{ fontSize: 36, fontWeight: 900, color: '#1c1917', letterSpacing: '-.03em', lineHeight: 1 }}>{plan.price}</span>
                      <span style={{ fontSize: 12, color: '#78716c' }}>{plan.period}</span>
                    </>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.5, margin: 0 }}>{plan.tagline}</p>
              </div>

              <Link href="/app" style={{ display: 'block', textAlign: 'center', fontSize: 13, fontWeight: 700, textDecoration: 'none', padding: '10px 14px', borderRadius: 9, marginBottom: 18, ...plan.ctaStyle }}>
                {plan.cta}
              </Link>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.perks.map((perk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Check color={plan.color} />
                    <div>
                      <div style={{ fontSize: 13, color: '#1c1917', fontWeight: 500 }}>{perk.text}</div>
                      {perk.sub && <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 1 }}>{perk.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 32px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#a8a29e', margin: 0 }}>
            Free plan is always free — no credit card needed.{' '}
            <button onClick={onClose} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}>
              Continue on free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
