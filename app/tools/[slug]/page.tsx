import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, getTool } from "../../toolsData";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};

  return {
    title: `${tool.label} — ${tool.tagline}`,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      title: `${tool.label} | Convey`,
      description: tool.metaDescription,
      url: `/tools/${tool.slug}`,
      siteName: "Convey",
      images: ["/opengraph-image"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.label} | Convey`,
      description: tool.metaDescription,
      images: ["/opengraph-image"],
    },
  };
}

function Icon({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg style={{ width: size, height: size, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Convey ${tool.label}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    description: tool.metaDescription,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const others = TOOLS.filter((t) => t.slug !== tool.slug).slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", color: "#1c1917" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header style={{ borderBottom: "1px solid #e7e5e0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "#18181b", border: "1px solid #e7e5e0", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 900, fontSize: 9, fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "-.2px", flexShrink: 0 }}>CO</div>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#1c1917", fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "-.2px" }}>Convey</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/tools" style={{ fontSize: 13, color: "#57534e", textDecoration: "none" }}>All tools</Link>
          <Link href="/app" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#18181b", padding: "8px 16px", borderRadius: 8, textDecoration: "none" }}>Sign in</Link>
        </nav>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 80px" }}>
        <nav style={{ fontSize: 12, color: "#a8a29e", marginBottom: 24 }}>
          <Link href="/" style={{ color: "#a8a29e", textDecoration: "none" }}>Home</Link>
          {" / "}
          <Link href="/tools" style={{ color: "#a8a29e", textDecoration: "none" }}>Tools</Link>
          {" / "}
          <span style={{ color: "#78716c" }}>{tool.label}</span>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Icon d={tool.icon} />
          </div>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>{tool.label}</h1>
            <p style={{ fontSize: 15, color: "#78716c", margin: "4px 0 0" }}>{tool.tagline}</p>
          </div>
        </div>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: "#44403c", marginBottom: 28 }}>{tool.description}</p>

        <Link href={`/app/${tool.slug}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#fff", background: "#18181b", padding: "12px 22px", borderRadius: 10, textDecoration: "none", marginBottom: 48 }}>
          Try {tool.label} free →
        </Link>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#a8a29e", marginBottom: 16 }}>What it does</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {tool.bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", gap: 10, fontSize: 14.5, color: "#292524", lineHeight: 1.5 }}>
                <span style={{ color: "#6366f1", fontWeight: 700, flexShrink: 0 }}>✓</span>
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#a8a29e", marginBottom: 16 }}>Frequently asked questions</h2>
          <div style={{ display: "grid", gap: 20 }}>
            {tool.faq.map((f, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 6px" }}>{f.q}</h3>
                <p style={{ fontSize: 14, color: "#57534e", margin: 0, lineHeight: 1.6 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#a8a29e", marginBottom: 16 }}>Other tools</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {others.map((t) => (
              <Link key={t.slug} href={`/tools/${t.slug}`}
                style={{ display: "block", padding: "14px 16px", borderRadius: 10, border: "1px solid #e7e5e0", textDecoration: "none" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1c1917", marginBottom: 3 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: "#a8a29e" }}>{t.tagline}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid #e7e5e0", padding: "24px", textAlign: "center", fontSize: 12, color: "#a8a29e" }}>
        © {new Date().getFullYear()} Convey. Free AI writing assistant.
      </footer>
    </div>
  );
}
