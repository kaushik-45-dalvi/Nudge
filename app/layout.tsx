import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nudge-p2p.vercel.app"),
  title: "Nudge — Instant P2P File & Content Transfer",
  description: "Browser-based, peer-to-peer file, photo, video, text, and clipboard transfer over local network. No account, no install, no cloud storage. 100% private & encrypted.",
  keywords: ["P2P file transfer", "local network share", "browser file sharing", "Airdrop alternative", "direct file share", "instant share"],
  authors: [{ name: "Nudge Team" }],
  openGraph: {
    title: "Nudge — Instant P2P File & Content Transfer",
    description: "Send files, photos, videos, and text directly between browsers with zero cloud storage and 256-bit encryption.",
    url: "https://nudge-p2p.vercel.app",
    siteName: "Nudge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nudge — Instant P2P File & Content Transfer",
    description: "Send files, photos, videos, and text directly between browsers with zero cloud storage.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/logo.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  verification: {
    google: "DaX_GLvOQcuOcN0iIiZ_J7Jol2Bgnr0rsBcyYXguqeI",
  }
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Nudge',
    'url': 'https://nudge-p2p.vercel.app',
    'applicationCategory': 'UtilitiesApplication',
    'operatingSystem': 'Windows, macOS, Android, iOS, Linux',
    'description': 'Browser-based, peer-to-peer file, photo, video, text, and clipboard transfer over local network.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="6554ff53-d4d1-4bd2-b49b-e2f019963fa9"
        />
      </head>
      <body className="font-sans antialiased selection:bg-[#E8321A] selection:text-white">
        {children}
      </body>
    </html>
  );
}
