import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nudge — Instant P2P File & Content Transfer",
  description: "Browser-based, peer-to-peer file, photo, video, text, and clipboard transfer over local network. No account, no install, no cloud storage. 100% private & encrypted.",
  keywords: ["P2P file transfer", "local network share", "browser file sharing", "Airdrop alternative", "WebRTC file share", "instant share"],
  authors: [{ name: "Nudge Team" }],
  openGraph: {
    title: "Nudge — Instant P2P File & Content Transfer",
    description: "Send files, photos, videos, and text directly between browsers with zero cloud storage and 256-bit encryption.",
    url: "https://nudge.app",
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
    icon: "/icons/logo.svg",
    apple: "/icons/logo.svg"
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
  return (
    <html lang="en">
      <body className="font-sans antialiased selection:bg-[#E8321A] selection:text-white">
        {children}
      </body>
    </html>
  );
}
