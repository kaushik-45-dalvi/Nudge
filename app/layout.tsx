import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nudge-p2p.vercel.app"),
  title: "Nudge — Free P2P File Sharing & Local Network Transfer (No Cloud)",
  description: "Share files, photos, videos, and text directly browser-to-browser with 100% peer-to-peer WebRTC encryption. Free, unlimited file size, no account required. The ultimate AirDrop alternative for Android, Windows, Mac, and iOS.",
  keywords: [
    "P2P file sharing",
    "file sharing",
    "free file transfer",
    "airdrop alternative",
    "peer to peer file transfer",
    "local network file sharing",
    "webrtc file transfer",
    "send large files online",
    "browser file sharing",
    "private file share",
    "airdrop for android",
    "airdrop for windows",
    "direct file share",
    "instant file transfer",
    "cross platform file transfer",
    "online file sharing without login"
  ],
  authors: [{ name: "Nudge Team", url: "https://nudge-p2p.vercel.app" }],
  creator: "Nudge Team",
  publisher: "Nudge",
  alternates: {
    canonical: "https://nudge-p2p.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Nudge — Free P2P File Sharing & Instant Transfer",
    description: "Send files, photos, videos, and text directly between browsers with zero cloud storage and 256-bit WebRTC encryption.",
    url: "https://nudge-p2p.vercel.app",
    siteName: "Nudge P2P File Sharing",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://nudge-p2p.vercel.app/hero-illustration.png",
        width: 1200,
        height: 630,
        alt: "Nudge P2P File Sharing Application",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nudge — Free P2P File Sharing & Instant Transfer",
    description: "Send files, photos, videos, and text directly between browsers with zero cloud storage.",
    images: ["https://nudge-p2p.vercel.app/hero-illustration.png"],
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
  // Rich WebApplication Schema
  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Nudge',
    'url': 'https://nudge-p2p.vercel.app',
    'applicationCategory': 'UtilitiesApplication',
    'operatingSystem': 'Windows, macOS, Android, iOS, Linux, ChromeOS',
    'description': 'Browser-based, peer-to-peer file, photo, video, text, and clipboard transfer over local network.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'featureList': [
      'P2P File Sharing',
      'Zero Cloud Storage',
      'End-to-End DTLS Encryption',
      'Cross-Platform File Transfer',
      'AirDrop Alternative for Android and Windows',
      'No File Size Limit'
    ]
  };

  // Rich FAQ Page Schema for Search Engine Snippets
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is Nudge P2P File Sharing?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Nudge is a free, instant peer-to-peer (P2P) file sharing application that lets you transfer files, photos, videos, and text directly between devices using your web browser without uploading to any cloud server.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is Nudge an AirDrop alternative for Android and Windows?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes! Nudge works on any device with a web browser, allowing seamless local network file transfer between Android, Windows, Mac, iPhone, Linux, and ChromeOS with no app installation required.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Are my files stored on Nudge servers?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No. Nudge uses direct WebRTC data channels with 256-bit DTLS encryption. File data streams directly between devices and never touches cloud storage or external servers.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is the maximum file size limit on Nudge?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Nudge has no file size limit. Because files transfer directly peer-to-peer over your local network or WiFi connection, you can share files of any size.'
        }
      }
    ]
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
