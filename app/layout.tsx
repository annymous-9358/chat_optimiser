import type { Metadata } from "next";
import Providers from './Providers';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://conveybot.in";
const DESCRIPTION =
  "Convey is a free AI writing assistant that rephrases, polishes, and perfects your tone for emails, chats, and messages — instant rewrites, quick replies, and tone checks.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Convey",
  title: {
    default: "Convey — AI Tone & Writing Assistant",
    template: "%s | Convey",
  },
  description: DESCRIPTION,
  keywords: [
    "Convey",
    "conveybot",
    "AI writing assistant",
    "tone checker",
    "rephrase tool",
    "AI email writer",
    "quick reply generator",
    "chat tone analyzer",
    "message rewriter",
    "polish text AI",
  ],
  alternates: { canonical: "/" },
  verification: {
    google: "8EK-PPfu4xxAEJHornOcU_c7rnN4Q1ZokSfLVgxOQX8",
  },
  openGraph: {
    title: "Convey — AI Tone & Writing Assistant",
    description: DESCRIPTION,
    url: "/",
    siteName: "Convey",
    images: ["/opengraph-image"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convey — AI Tone & Writing Assistant",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Convey",
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
