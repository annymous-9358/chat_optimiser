'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Plan {
  name: string;
  price: number;
  period: string;
  tagline: string;
  badge?: string;
  color: string;
  perks: string[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: 49,
    period: 'month',
    tagline: 'For occasional writers who want AI-powered rewrites.',
    color: '#6366f1',
    perks: [
      '50 AI tool uses per month',
      'All 16 writing tools',
      'AI Assistant (basic)',
      'Session history — 7 days',
      'File upload support',
    ],
    cta: 'Get Starter',
  },
  {
    name: 'Pro',
    price: 69,
    period: 'month',
    tagline: 'Unlimited access for daily writers and professionals.',
    badge: 'Most Popular',
    color: '#7c3aed',
    perks: [
      'Unlimited AI tool uses',
      'All 16 writing tools',
      'AI Assistant (full)',
      'Session history — 90 days',
      'File upload support',
      'Priority AI processing',
      'Export history as CSV',
    ],
    cta: 'Get Pro',
  },
  {
    name: 'Team',
    price: 99,
    period: 'month',
    tagline: 'Everything in Pro, built for teams and power users.',
    color: '#0f172a',
    perks: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared history & sessions',
      'API access',
      'Priority support',
      'Custom tone presets',
    ],
    cta: 'Get Team',
  },
];

function CheckIcon() {
  return (
    <svg style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PricingModal({ onClose }: { onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 860, maxHeight: '90vh',
        background: '#fafaf9', borderRadius: 20, overflow: 'auto',
        boxShadow: '0 32px 80px -12px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ padding: '32px 32px 0', position: 'relative' }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 20, right: 20,
            width: 32, height: 32, border: '1px solid #e7e5e0',
            borderRadius: 8, background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716c',
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#6366f1', background: '#f0efff', padding: '5px 12px', borderRadius: 999, marginBottom: 16 }}>
            🎉 Limited launch pricing
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.03em', color: '#1c1917', margin: '0 0 8px' }}>
            Simple, honest pricing
          </h2>
          <p style={{ fontSize: 15, color: '#78716c', margin: '0 0 32px', lineHeight: 1.5 }}>
            All plans billed in INR. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              borderRadius: 16, padding: '24px',
              border: plan.badge ? '2px solid #7c3aed' : '1px solid #e7e5e0',
              background: plan.badge ? 'linear-gradient(180deg,#f5f3ff 0%,#fafaf9 100%)' : '#fff',
              position: 'relative',
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700,
                  padding: '3px 12px', borderRadius: 999, whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#78716c', fontWeight: 500 }}>₹</span>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#1c1917', letterSpacing: '-.03em', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: '#78716c' }}>/{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: '#78716c', lineHeight: 1.5, margin: 0 }}>{plan.tagline}</p>
              </div>

              <Link href="/app" style={{
                display: 'block', textAlign: 'center',
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
                padding: '10px 16px', borderRadius: 10, marginBottom: 20,
                background: plan.badge ? plan.color : '#18181b',
                color: '#fff',
              }}>
                {plan.cta}
              </Link>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.perks.map(perk => (
                  <div key={perk} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#57534e' }}>
                    <span style={{ color: plan.color }}><CheckIcon /></span>
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 32px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#a8a29e', margin: 0 }}>
            All plans include a 7-day free trial. No credit card required to start.{' '}
            <button onClick={onClose} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}>
              Continue with free plan
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
