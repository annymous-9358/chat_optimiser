import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Convey',
  description: 'Terms and conditions for using the Convey AI writing platform.',
  alternates: { canonical: '/terms' },
};

const LAST_UPDATED = 'October 14, 2026';

export default function TermsPage() {
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
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.03em', margin: '0 0 8px' }}>Terms of Service</h1>
          <p style={{ fontSize: 13, color: '#a8a29e', margin: 0 }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div style={{ fontSize: 15, lineHeight: 1.75, color: '#44403c', display: 'flex', flexDirection: 'column', gap: 32 }}>

          <section>
            <p>These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Convey (&ldquo;the Service&rdquo;), operated by Convey (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) at <strong>conveybot.in</strong>.</p>
            <p style={{ marginTop: 12 }}>By creating an account or using Convey in any way, you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>1. Description of Service</h2>
            <p>Convey is an AI-powered writing assistant that provides 16 writing tools (including rephrasing, tone checking, email writing, summarization, and more) and an AI Assistant. The Service is provided on a free and paid subscription basis.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>2. Eligibility</h2>
            <p>You must be at least 13 years of age to use Convey. By using the Service, you represent that you meet this requirement. If you are using Convey on behalf of a company or organisation, you represent that you have the authority to bind that entity to these Terms.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>3. Accounts</h2>
            <p>You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorised access to your account. We are not liable for losses caused by unauthorised use of your account.</p>
            <p style={{ marginTop: 12 }}>You may not create accounts using automated means, or create accounts for the purpose of abusing the free tier limits.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>4. Plans and Usage Limits</h2>
            <p>Convey offers the following plans:</p>
            <ul style={{ paddingLeft: 20, margin: '12px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Free:</strong> 5 tool uses per day, basic AI Assistant</li>
              <li><strong>Starter (₹49/month):</strong> 50 tool uses per month, basic AI Assistant</li>
              <li><strong>Pro (₹69/month):</strong> Unlimited uses, full AI Assistant with file upload</li>
            </ul>
            <p>We reserve the right to change plan pricing or limits with reasonable notice. Continued use after a pricing change constitutes acceptance of the new pricing.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>5. Acceptable Use</h2>
            <p>You agree not to use Convey to:</p>
            <ul style={{ paddingLeft: 20, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Generate content that is illegal, defamatory, harassing, threatening, or abusive</li>
              <li>Create spam, phishing messages, or deceptive content</li>
              <li>Infringe any intellectual property rights of others</li>
              <li>Attempt to reverse-engineer, scrape, or overload the Service</li>
              <li>Circumvent usage limits through automated requests or multiple accounts</li>
              <li>Upload files containing malicious code or that violate others&apos; privacy</li>
              <li>Generate content that violates applicable laws in your jurisdiction</li>
            </ul>
            <p style={{ marginTop: 12 }}>We reserve the right to suspend or terminate accounts that violate these rules without prior notice.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>6. AI-Generated Content</h2>
            <p>Convey uses large language models (via Groq) to generate text. You acknowledge that:</p>
            <ul style={{ paddingLeft: 20, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>AI outputs may be inaccurate, incomplete, or inappropriate for your purpose</li>
              <li>You are solely responsible for reviewing, editing, and using any AI-generated content</li>
              <li>We make no guarantees about the accuracy or quality of AI outputs</li>
              <li>You own the content you input and the outputs generated from your inputs</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>7. Intellectual Property</h2>
            <p>The Convey platform, its design, branding, and underlying code are our intellectual property. You may not copy, reproduce, or create derivative works of the platform without our written permission.</p>
            <p style={{ marginTop: 12 }}>You retain ownership of any content you input into Convey. By using the Service, you grant us a limited, non-exclusive licence to process your content solely to provide the Service to you.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>8. Payments and Refunds</h2>
            <p>Paid plans are billed monthly. All prices are in Indian Rupees (INR) and include applicable taxes. Payments are processed securely through our payment provider.</p>
            <p style={{ marginTop: 12 }}>We offer a 7-day free trial on paid plans. If you are not satisfied within the first 7 days of a paid subscription, contact us for a full refund. After 7 days, payments are non-refundable. You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>9. Disclaimer of Warranties</h2>
            <p>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that AI outputs will be accurate or suitable for any particular purpose.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Convey shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of data, loss of revenue, or harm resulting from reliance on AI-generated content. Our total liability to you for any claim shall not exceed the amount you paid us in the three months preceding the claim.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>11. Termination</h2>
            <p>You may terminate your account at any time by contacting us. We may suspend or terminate your account if you violate these Terms, with or without notice. Upon termination, your right to use the Service ceases immediately. We may delete your data after account termination in accordance with our Privacy Policy.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>12. Governing Law</h2>
            <p>These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of India.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>13. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of significant changes by updating the &ldquo;Last updated&rdquo; date. Continued use of Convey after changes constitutes your acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: '0 0 12px', letterSpacing: '-.02em' }}>14. Contact</h2>
            <p>For questions about these Terms, contact us at:</p>
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
          <Link href="/privacy" style={{ color: '#a8a29e', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#a8a29e', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
          <Link href="/" style={{ color: '#a8a29e', textDecoration: 'none' }}>Home</Link>
        </div>
        <p style={{ margin: '8px 0 0' }}>© {new Date().getFullYear()} Convey. Free AI writing assistant.</p>
      </footer>
    </div>
  );
}
