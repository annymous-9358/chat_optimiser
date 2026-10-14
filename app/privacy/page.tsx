import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Convey',
  description: 'How Convey collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy' },
};

const LAST_UPDATED = 'October 14, 2026';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', color: '#1c1917' }}>
      <header style={{ borderBottom: '1px solid #e7e5e0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 9, fontFamily: 'var(--font-geist-mono), monospace' }}>CO</div>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#1c1917', fontFamily: 'var(--font-geist-mono), monospace' }}>Convey</span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: '#57534e', textDecoration: 'none' }}>← Back to home</Link>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.03em', margin: '0 0 8px' }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: '#a8a29e', margin: 0 }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div style={{ fontSize: 15, lineHeight: 1.75, color: '#44403c', display: 'flex', flexDirection: 'column', gap: 32 }}>

          <section>
            <p>Convey (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the website <strong>conveybot.in</strong> and the Convey AI writing platform. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.</p>
            <p style={{ marginTop: 12 }}>By using Convey, you agree to the collection and use of information in accordance with this policy.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>1. Information We Collect</h2>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#292524', margin: '0 0 8px' }}>Account information</h3>
            <p>When you create an account, we collect your email address and a hashed password (or OAuth token if you sign in with Google or GitHub). We do not store plain-text passwords.</p>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#292524', margin: '16px 0 8px' }}>Usage data</h3>
            <p>We log each tool or AI Assistant use (which tool was used and when) to enforce plan limits and improve the service. We do not log the content of your messages or AI outputs permanently — tool inputs and outputs exist only in your browser session unless you save them to history.</p>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#292524', margin: '16px 0 8px' }}>Session history</h3>
            <p>If you save a result to history, that content is stored in our database (Supabase) and associated with your account. You can delete history entries at any time.</p>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#292524', margin: '16px 0 8px' }}>Files you upload</h3>
            <p>Files uploaded to the AI Assistant are sent directly to our AI processing pipeline and are not stored on our servers. They are discarded after your request is processed.</p>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#292524', margin: '16px 0 8px' }}>Technical data</h3>
            <p>We may collect standard server logs including IP address, browser type, and pages visited for security and debugging purposes. This data is not sold or shared with third parties.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>2. How We Use Your Information</h2>
            <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>To provide and operate the Convey platform and its AI writing tools</li>
              <li>To enforce plan usage limits (Free: 5 uses/day, Starter: 50/month, Pro: unlimited)</li>
              <li>To authenticate you and keep your account secure</li>
              <li>To store session history you choose to save</li>
              <li>To communicate important service updates or changes to this policy</li>
              <li>To detect and prevent abuse or misuse of the platform</li>
            </ul>
            <p style={{ marginTop: 12 }}>We do not use your content to train AI models. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>3. Third-Party Services</h2>
            <p>Convey uses the following third-party services to operate:</p>
            <ul style={{ paddingLeft: 20, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Supabase</strong> — authentication and database (stores your account info, usage logs, saved history). Data is stored on Supabase&apos;s infrastructure. See <a href="https://supabase.com/privacy" style={{ color: '#6366f1' }} target="_blank" rel="noreferrer">supabase.com/privacy</a>.</li>
              <li><strong>Groq</strong> — AI inference for all tool outputs and the AI Assistant. Your text inputs are sent to Groq&apos;s API for processing. See <a href="https://groq.com/privacy-policy" style={{ color: '#6366f1' }} target="_blank" rel="noreferrer">groq.com/privacy-policy</a>.</li>
              <li><strong>Netlify</strong> — website hosting and serverless functions. See <a href="https://www.netlify.com/privacy/" style={{ color: '#6366f1' }} target="_blank" rel="noreferrer">netlify.com/privacy</a>.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>4. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Usage logs are retained for rolling 90-day windows for limit enforcement. Saved history is retained until you delete it or close your account. You may request full account deletion at any time by emailing us.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul style={{ paddingLeft: 20, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your saved history</li>
              <li>Withdraw consent at any time by deleting your account</li>
            </ul>
            <p style={{ marginTop: 12 }}>To exercise these rights, contact us at <a href="mailto:support@conveybot.in" style={{ color: '#6366f1' }}>support@conveybot.in</a>.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>6. Cookies</h2>
            <p>Convey uses cookies strictly for authentication (session tokens). We do not use advertising or tracking cookies. You can disable cookies in your browser, but this will prevent you from signing in.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>7. Children&apos;s Privacy</h2>
            <p>Convey is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of Convey after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>9. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <div style={{ marginTop: 12, padding: '16px 20px', borderRadius: 10, border: '1px solid #e7e5e0', background: '#fff', fontSize: 14 }}>
              <strong>Convey</strong><br />
              Email: <a href="mailto:support@conveybot.in" style={{ color: '#6366f1' }}>support@conveybot.in</a><br />
              Website: <a href="https://conveybot.in" style={{ color: '#6366f1' }}>conveybot.in</a>
            </div>
          </section>

        </div>
      </main>

      <footer style={{ borderTop: '1px solid #e7e5e0', padding: '24px', textAlign: 'center', fontSize: 12, color: '#a8a29e' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ color: '#a8a29e', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#a8a29e', textDecoration: 'none' }}>Terms of Service</Link>
          <Link href="/" style={{ color: '#a8a29e', textDecoration: 'none' }}>Home</Link>
        </div>
        <p style={{ margin: '8px 0 0' }}>© {new Date().getFullYear()} Convey. Free AI writing assistant.</p>
      </footer>
    </div>
  );
}
