import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, CATEGORY_ORDER } from "../toolsData";

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse every AI writing tool in Convey — rephrase, tone check, polish, email writer, standup generator, prompt booster, and more. Free to try.",
  alternates: { canonical: "/tools" },
};

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg style={{ width: size, height: size, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function ToolsIndexPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", color: "#1c1917" }}>
      <header style={{ borderBottom: "1px solid #e7e5e0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #6366f1, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 11 }}>C</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#1c1917" }}>Convey</span>
        </Link>
        <Link href="/app" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#18181b", padding: "8px 16px", borderRadius: 8, textDecoration: "none" }}>Sign in</Link>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em", marginBottom: 8 }}>All tools</h1>
        <p style={{ fontSize: 15, color: "#78716c", marginBottom: 40, maxWidth: 560 }}>
          13 focused AI writing tools, each with its own page. Pick one below or sign in to use them all from one workspace.
        </p>

        {CATEGORY_ORDER.map((category) => {
          const tools = TOOLS.filter((t) => t.category === category);
          if (tools.length === 0) return null;
          return (
            <section key={category} style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#a8a29e", marginBottom: 16 }}>
                {category}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                {tools.map((t) => (
                  <Link key={t.slug} href={`/tools/${t.slug}`}
                    style={{ display: "block", padding: "20px", borderRadius: 14, border: "1px solid #e7e5e0", background: "#fff", textDecoration: "none" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: 14 }}>
                      <Icon d={t.icon} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 13, color: "#78716c", lineHeight: 1.5 }}>{t.tagline}</div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer style={{ borderTop: "1px solid #e7e5e0", padding: "24px", textAlign: "center", fontSize: 12, color: "#a8a29e" }}>
        © {new Date().getFullYear()} Convey. Free AI writing assistant.
      </footer>
    </div>
  );
}
