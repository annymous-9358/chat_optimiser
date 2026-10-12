'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Plan {
  name: string;
  price: number | null;
  period: string;
  tagline: string;
  badge?: string;
  color: string;
  perks: { text: string; note?: string }[];
  cta: string;
  href: string;
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: null,
    period: '',
    tagline: 'Get started with no commitment.',
    color: '#78716c',
    perks: [
      { text: '5 tool uses per day', note: 'resets at midnight' },
      { text: 'All 16 writing tools' },
      { text: 'AI Assistant (basic)', note: 'short answers, no file upload' },
      { text: '5 assistant messages per day' },
    ],
    cta: 'Continue free',
    href: '/app',
  },
  {
    name: 'Starter',
    price: 49,
    period: 'month',
    tagline: 'For regular writers who need more room.',
    color: '#6366f1',
    perks: [
      { text: '50 tool uses per month' },
      { text: 'All 16 writing tools' },
      { text: 'AI Assistant (basic)', note: 'short answers, no file upload' },
      { text: '50 assistant messages per month' },
      { text: 'Session history — 7 days' },
    ],
    cta: 'Get Starter',
    href: '/app',
  },
  {
    name: 'Pro',
    price: 69,
    period: 'month',
    tagline: 'Unlimited access for daily professionals.',
    badge: 'Most Popular',
    color: '#7c3aed',
    perks: [
      { text: 'Unlimited tool uses' },
      { text: 'All 16 writing tools' },
      { text: 'AI Assistant (full)', note: 'long answers + file upload' },
      { text: 'Unlimited assistant messages' },
      { text: 'Session history — 90 days' },
      { text: 'Priority AI processing' },
      { text: 'Export history as CSV' },
    ],
    cta: 'Get Pro',
    href: '/app',
  },
  {
    name: 'Team',
    price: 99,
    period: 'month',
    tagline: 'Everything in Pro, built for teams.',
    color: '#0f172a',
    perks: [
      { text: 'Everything in Pro' },
      { text: 'Up to 5 team members' },
      { text: 'Shared history & sessions' },
      { text: 'API access' },
      { text: 'Priority support' },
      { text: 'Custom tone presets' },
    ],
    cta: 'Get Team',
    href: '/app',
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg style={{ width: 13, height: 13, flexShrink: 0, marginTop: 2, color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PricingModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 980, maxHeight: '90vh', background: '#fafaf9', borderRadius: 20, overflow: 'auto', boxShadow: '0 32px 80px -12px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ padding: '32px 32px 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, border: '1px solid #e7e5e0', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716c' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#6366f1', background: '#f0efff', padding: '5px 12px', borderRadius: 999, marginBottom: 16 }}>
            🎉 Limited launch pricing
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', color: '#1c1917', margin: '0 0 6px' }}>Simple, honest pricing</h2>
          <p style={{ fontSize: 14, color: '#78716c', margin: '0 0 28px', lineHeight: 1.5 }}>All plans billed in INR. Cancel anytime. Free tier always available.</p>
        </div>

        {/* Plans grid */}
        <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{ borderRadius: 16, padding: '22px', border: plan.badge ? '2px solid #7c3aed' : '1px solid #e7e5e0', background: plan.badge ? 'linear-gradient(180deg,#f5f3ff 0%,#fafaf9 100%)' : '#fff', position: 'relative' }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>{plan.name}</div>
                {plan.price !== null ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#78716c' }}>₹</span>
                    <span style={{ fontSize: 34, fontWeight: 900, color: '#1c1917', letterSpacing: '-.03em', lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontSize: 12, color: '#78716c' }}>/{plan.period}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#1c1917', letterSpacing: '-.02em', lineHeight: 1, marginBottom: 4 }}>₹0</div>
                )}
                <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.5, margin: 0 }}>{plan.tagline}</p>
              </div>

              <Link href={plan.href} style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 700, textDecoration: 'none', padding: '9px 14px', borderRadius: 9, marginBottom: 16, background: plan.badge ? plan.color : plan.price === null ? '#f0f0f0' : '#18181b', color: plan.price === null ? '#57534e' : '#fff' }}>
                {plan.cta}
              </Link>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.perks.map((perk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                    <CheckIcon color={plan.color} />
                    <div>
                      <span style={{ fontSize: 12, color: '#44403c' }}>{perk.text}</span>
                      {perk.note && <span style={{ fontSize: 10, color: '#a8a29e', display: 'block' }}>{perk.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 32px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#a8a29e', margin: 0 }}>
            Paid plans include a 7-day free trial. No credit card required to start.{' '}
            <button onClick={onClose} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}>
              Stay on free plan
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
