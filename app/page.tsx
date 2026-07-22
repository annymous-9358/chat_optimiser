import Link from "next/link";
import { TOOLS, CATEGORY_ORDER } from "./toolsData";

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg style={{ width: size, height: size, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const STEPS = [
  { title: "Pick a tool", body: "Rephrase a message, check its tone, write an email, or one of 16 focused writing tools." },
  { title: "Add your text", body: "Paste what you're working with — a draft, a message you received, or a rough idea." },
  { title: "Get results instantly", body: "AI-generated, tone-matched output ready to copy and send in seconds." },
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Convey",
    url: "https://conveybot.in",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://conveybot.in/tools/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", color: "#1c1917" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ borderBottom: "1px solid #e7e5e0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(250,250,249,0.85)", backdropFilter: "blur(8px)", zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "#18181b", border: "1px solid #e7e5e0", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 900, fontSize: 9, fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "-.2px", flexShrink: 0 }}>CO</div>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#1c1917", fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "-.2px" }}>Convey</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/tools" style={{ fontSize: 13, color: "#57534e", textDecoration: "none" }}>All tools</Link>
          <Link href="/app" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#18181b", padding: "8px 16px", borderRadius: 8, textDecoration: "none" }}>Sign in</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "96px 24px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#6366f1", background: "#f0efff", padding: "6px 14px", borderRadius: 999, marginBottom: 24 }}>
          16 free AI writing tools, one workspace
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.1, margin: "0 0 20px" }}>
          Write with the <span style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>perfect tone</span>, every time
        </h1>
        <p style={{ fontSize: 17, color: "#57534e", lineHeight: 1.6, maxWidth: 560, margin: "0 auto 32px" }}>
          Convey is a free AI writing assistant that rephrases, polishes, checks tone, and drafts messages, emails, and replies — instantly, in the tone you need.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/app" style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#18181b", padding: "13px 26px", borderRadius: 10, textDecoration: "none" }}>
            Get started free →
          </Link>
          <Link href="/tools" style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", background: "#fff", border: "1px solid #e7e5e0", padding: "13px 26px", borderRadius: 10, textDecoration: "none" }}>
            Browse all tools
          </Link>
        </div>
      </section>

      {/* App preview — the actual workspace UI, not just an illustration */}
      <section style={{ maxWidth: 900, margin: "0 auto 72px", padding: "0 24px" }}>
        <div style={{ borderRadius: 16, border: "1px solid #e7e5e0", overflow: "hidden", boxShadow: "0 24px 64px -24px rgba(0,0,0,0.18)", background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid #e7e5e0", background: "#fafaf9" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#e7e5e0" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#e7e5e0" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#e7e5e0" }} />
            <span style={{ marginLeft: 10, fontSize: 11, color: "#a8a29e", fontFamily: "var(--font-geist-mono), monospace" }}>conveybot.in/app/rephrase</span>
          </div>
          <div style={{ display: "flex", minHeight: 320, overflowX: "auto" }}>
            <div style={{ width: 160, borderRight: "1px solid #e7e5e0", padding: "14px 0", flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#a8a29e", padding: "0 14px 6px", fontFamily: "var(--font-geist-mono), monospace" }}>Rewrite &amp; Tone</div>
              {["Rephrase", "Tone Check", "Polish"].map((label, i) => (
                <div key={label} style={{ padding: "6px 14px", fontSize: 11, fontWeight: i === 0 ? 700 : 500, background: i === 0 ? "#18181b" : "transparent", color: i === 0 ? "#fff" : "#57534e", fontFamily: "var(--font-geist-mono), monospace", textTransform: "uppercase", letterSpacing: ".03em" }}>
                  {label}
                </div>
              ))}
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#a8a29e", padding: "12px 14px 6px", fontFamily: "var(--font-geist-mono), monospace" }}>Language</div>
              <div style={{ padding: "6px 14px", fontSize: 11, color: "#57534e", fontFamily: "var(--font-geist-mono), monospace", textTransform: "uppercase", letterSpacing: ".03em" }}>Translator</div>
            </div>
            <div style={{ flex: 1, minWidth: 300, padding: 24, textAlign: "left" }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: "#1c1917" }}>Rephrase</div>
              <div style={{ fontSize: 12, color: "#78716c", marginBottom: 16 }}>Rewrite any message in the tone that fits.</div>
              <div style={{ border: "1px solid #e7e5e0", borderRadius: 8, padding: 12, fontSize: 12, color: "#57534e", marginBottom: 12 }}>
                can we push the meeting to thursday, something came up
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {["Pro Formal", "Casual", "Friend"].map((t, i) => (
                  <span key={t} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, border: `1px solid ${i === 0 ? "#18181b" : "#e7e5e0"}`, background: i === 0 ? "#18181b" : "#fff", color: i === 0 ? "#fff" : "#57534e", fontFamily: "var(--font-geist-mono), monospace" }}>
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ border: "1px solid #e7e5e0", borderRadius: 8, padding: 12, fontSize: 12, color: "#1c1917", lineHeight: 1.6 }}>
                Hi — something&apos;s come up on my end, would it be possible to push our meeting to Thursday instead?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool grid */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", textAlign: "center", marginBottom: 8 }}>
          Every tool in Convey
        </h2>
        <p style={{ fontSize: 14, color: "#78716c", textAlign: "center", marginBottom: 40 }}>
          16 tools, grouped by what you&apos;re trying to do.
        </p>
        {CATEGORY_ORDER.map((category) => {
          const tools = TOOLS.filter((t) => t.category === category);
          if (tools.length === 0) return null;
          return (
            <div key={category} style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#a8a29e", marginBottom: 14 }}>
                {category}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {tools.map((t) => (
                  <Link key={t.slug} href={`/tools/${t.slug}`}
                    style={{ display: "block", padding: "22px", borderRadius: 14, border: "1px solid #e7e5e0", background: "#fff", textDecoration: "none", transition: "border-color .15s" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: 14 }}>
                      <Icon d={t.icon} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 13, color: "#78716c", lineHeight: 1.5 }}>{t.tagline}</div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* How it works */}
      <section style={{ background: "#fff", borderTop: "1px solid #e7e5e0", borderBottom: "1px solid #e7e5e0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", textAlign: "center", marginBottom: 48 }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#18181b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#78716c", lineHeight: 1.6, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", marginBottom: 12 }}>Ready to write better?</h2>
        <p style={{ fontSize: 15, color: "#78716c", marginBottom: 28 }}>Free to start. No credit card required.</p>
        <Link href="/app" style={{ display: "inline-block", fontSize: 14, fontWeight: 700, color: "#fff", background: "#18181b", padding: "13px 28px", borderRadius: 10, textDecoration: "none" }}>
          Get started free →
        </Link>
      </section>

      <footer style={{ borderTop: "1px solid #e7e5e0", padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#a8a29e", margin: 0 }}>© {new Date().getFullYear()} Convey. Free AI writing assistant.</p>
      </footer>
    </div>
  );
}
