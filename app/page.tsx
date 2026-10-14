'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TOOLS, CATEGORY_ORDER } from './toolsData';
import HomeHeader from './components/HomeHeader';
import PricingModal from './components/PricingModal';

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg style={{ width: size, height: size, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const STEPS = [
  { title: "Pick a tool", body: "Rephrase a message, check its tone, write an email, or use the AI Assistant to figure out which of 16 tools fits your need." },
  { title: "Add your text", body: "Paste what you're working with — a draft, a message you received, or a rough idea. Upload a file and the assistant works with it directly." },
  { title: "Get results instantly", body: "AI-generated, tone-matched output ready to copy and send in seconds." },
];

export default function HomePage() {
  const [pricingOpen, setPricingOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', color: '#1c1917' }}>

      <HomeHeader onPricing={() => setPricingOpen(true)} />

      {pricingOpen && <PricingModal onClose={() => setPricingOpen(false)} />}

      {/* Hero */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '96px 24px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#6366f1', background: '#f0efff', padding: '6px 14px', borderRadius: 999, marginBottom: 24 }}>
          16 free AI writing tools + AI Assistant, one workspace
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, margin: '0 0 20px' }}>
          Write with the <span style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>perfect tone</span>, every time
        </h1>
        <p style={{ fontSize: 17, color: '#57534e', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 32px' }}>
          Convey is a free AI writing assistant that rephrases, polishes, checks tone, and drafts messages, emails, and replies — instantly, in the tone you need.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/app" style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: '#18181b', padding: '13px 26px', borderRadius: 10, textDecoration: 'none' }}>
            Get started free →
          </Link>
          <Link href="/tools" style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', background: '#fff', border: '1px solid #e7e5e0', padding: '13px 26px', borderRadius: 10, textDecoration: 'none' }}>
            Browse all tools
          </Link>
        </div>
      </section>

      {/* App preview */}
      <section style={{ maxWidth: 900, margin: '0 auto 72px', padding: '0 24px' }}>
        <div style={{ borderRadius: 16, border: '1px solid #e7e5e0', overflow: 'hidden', boxShadow: '0 24px 64px -24px rgba(0,0,0,0.18)', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid #e7e5e0', background: '#fafaf9' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e7e5e0' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e7e5e0' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e7e5e0' }} />
            <span style={{ marginLeft: 10, fontSize: 11, color: '#a8a29e', fontFamily: 'var(--font-geist-mono), monospace' }}>conveybot.in/app/assistant</span>
          </div>
          <div style={{ display: 'flex', minHeight: 320, overflowX: 'auto' }}>
            <div style={{ width: 160, borderRight: '1px solid #e7e5e0', padding: '14px 0', flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#a8a29e', padding: '0 14px 6px', fontFamily: 'var(--font-geist-mono), monospace' }}>AI Assistant</div>
              {['Assistant', 'Rephrase', 'Tone Check'].map((label, i) => (
                <div key={label} style={{ padding: '6px 14px', fontSize: 11, fontWeight: i === 0 ? 700 : 500, background: i === 0 ? '#18181b' : 'transparent', color: i === 0 ? '#fff' : '#57534e', fontFamily: 'var(--font-geist-mono), monospace', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                  {label}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 300, padding: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: '#1c1917' }}>AI Assistant</div>
              <div style={{ fontSize: 12, color: '#78716c', marginBottom: 20 }}>Tell me what you need — I&apos;ll solve it or route you to the right tool.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: '#18181b', color: '#fff', borderRadius: 12, borderBottomRightRadius: 4, padding: '9px 14px', fontSize: 12, maxWidth: '80%' }}>
                    Rewrite this less bluntly: &quot;why haven&apos;t you replied?&quot;
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', flexShrink: 0 }} />
                  <div style={{ border: '1px solid #e7e5e0', borderRadius: 12, borderTopLeftRadius: 4, padding: '9px 14px', fontSize: 12, color: '#1c1917', lineHeight: 1.6, flex: 1 }}>
                    Here are 3 softer ways to ask: &ldquo;Hey, just wanted to check in!&rdquo; / &ldquo;Did my last message get through?&rdquo; / &ldquo;No rush, just following up when you get a chance.&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool grid */}
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', textAlign: 'center', marginBottom: 8 }}>
          Every tool in Convey
        </h2>
        <p style={{ fontSize: 14, color: '#78716c', textAlign: 'center', marginBottom: 40 }}>
          17 tools, grouped by what you&apos;re trying to do.
        </p>
        {CATEGORY_ORDER.map((category) => {
          const tools = TOOLS.filter((t) => t.category === category);
          if (tools.length === 0) return null;
          return (
            <div key={category} style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#a8a29e', marginBottom: 14 }}>
                {category}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {tools.map((t) => (
                  <Link key={t.slug} href={`/tools/${t.slug}`}
                    style={{ display: 'block', padding: '22px', borderRadius: 14, border: `1px solid ${t.category === 'AI Assistant' ? '#c4b5fd' : '#e7e5e0'}`, background: t.category === 'AI Assistant' ? 'linear-gradient(180deg,#f5f3ff,#fff)' : '#fff', textDecoration: 'none', transition: 'border-color .15s' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 14 }}>
                      <Icon d={t.icon} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 13, color: '#78716c', lineHeight: 1.5 }}>{t.tagline}</div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', borderTop: '1px solid #e7e5e0', borderBottom: '1px solid #e7e5e0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '72px 24px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', textAlign: 'center', marginBottom: 48 }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#18181b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#78716c', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#6366f1', background: '#f0efff', padding: '5px 12px', borderRadius: 999, marginBottom: 16 }}>
            🎉 Limited launch pricing
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8 }}>
            Plans that won&apos;t break the bank
          </h2>
          <p style={{ fontSize: 15, color: '#78716c', maxWidth: 440, margin: '0 auto' }}>
            All prices in INR. Cancel anytime. Free tier always available.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            {
              name: 'Free', price: null, badge: null, color: '#78716c', highlight: false,
              cta: 'Use for free', ctaBg: '#f5f5f4', ctaColor: '#57534e',
              perks: [
                { t: '5 uses per day', s: 'resets at midnight' },
                { t: 'All 16 AI writing tools' },
                { t: 'AI Assistant — basic', s: 'short answers, no file upload' },
              ],
            },
            {
              name: 'Starter', price: 49, badge: null, color: '#6366f1', highlight: false,
              cta: 'Get Starter', ctaBg: '#18181b', ctaColor: '#fff',
              perks: [
                { t: '50 uses per month', s: 'resets on the 1st' },
                { t: 'All 16 AI writing tools' },
                { t: 'AI Assistant — basic', s: 'short answers, no file upload' },
              ],
            },
            {
              name: 'Pro', price: 69, badge: 'Most Popular', color: '#7c3aed', highlight: true,
              cta: 'Get Pro', ctaBg: '#7c3aed', ctaColor: '#fff',
              perks: [
                { t: 'Unlimited uses', s: 'no daily or monthly cap' },
                { t: 'All 16 AI writing tools' },
                { t: 'AI Assistant — full', s: 'detailed answers + file upload' },
                { t: 'File upload support', s: '.txt .csv .json .md and more' },
              ],
            },
          ].map(plan => (
            <div key={plan.name} style={{
              borderRadius: 16, padding: '28px 24px',
              border: plan.highlight ? '2px solid #7c3aed' : '1px solid #e7e5e0',
              background: plan.highlight ? 'linear-gradient(180deg,#f5f3ff 0%,#fff 100%)' : '#fff',
              position: 'relative',
            }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: plan.color, textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 20 }}>
                {plan.price === null ? (
                  <span style={{ fontSize: 34, fontWeight: 900, color: '#1c1917', letterSpacing: '-.02em', lineHeight: 1 }}>Free</span>
                ) : (
                  <>
                    <span style={{ fontSize: 13, color: '#78716c' }}>₹</span>
                    <span style={{ fontSize: 40, fontWeight: 900, color: '#1c1917', letterSpacing: '-.03em', lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontSize: 13, color: '#78716c' }}>/mo</span>
                  </>
                )}
              </div>
              <Link href="/app" style={{ display: 'block', textAlign: 'center', fontSize: 13, fontWeight: 700, textDecoration: 'none', padding: '10px 16px', borderRadius: 10, marginBottom: 20, background: plan.ctaBg, color: plan.ctaColor }}>
                {plan.cta}
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.perks.map((perk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <svg style={{ width: 13, height: 13, flexShrink: 0, marginTop: 3, color: plan.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <div>
                      <div style={{ fontSize: 13, color: '#1c1917', fontWeight: 500 }}>{perk.t}</div>
                      {'s' in perk && <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 1 }}>{perk.s}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#fff', borderTop: '1px solid #e7e5e0' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 12 }}>Ready to write better?</h2>
          <p style={{ fontSize: 15, color: '#78716c', marginBottom: 28 }}>Free to start. No credit card required.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/app" style={{ display: 'inline-block', fontSize: 14, fontWeight: 700, color: '#fff', background: '#18181b', padding: '13px 28px', borderRadius: 10, textDecoration: 'none' }}>
              Get started free →
            </Link>
            <button onClick={() => setPricingOpen(true)} style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', background: '#fff', border: '1px solid #e7e5e0', padding: '13px 28px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              View pricing
            </button>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #e7e5e0', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <Link href="/tools" style={{ fontSize: 12, color: '#a8a29e', textDecoration: 'none' }}>All tools</Link>
          <Link href="/privacy" style={{ fontSize: 12, color: '#a8a29e', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ fontSize: 12, color: '#a8a29e', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
        <p style={{ fontSize: 12, color: '#a8a29e', margin: 0 }}>© {new Date().getFullYear()} Convey. Free AI writing assistant.</p>
      </footer>
    </div>
  );
}
