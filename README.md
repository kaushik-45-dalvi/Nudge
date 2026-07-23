# Nudge 🚀
> Instant Peer-to-Peer File, Media, and Content Transfer over Local Network.

Nudge is a modern, high-performance web application that enables instant, secure, and encrypted peer-to-peer (P2P) transfers directly between browsers on your local WiFi network. No accounts, no installs, no cloud uploads, and zero file size limits.

---

## ✨ Features

- ⚡ **Ultra-Fast P2P Transfer**: Direct browser-to-browser streaming via WebRTC DataChannels. Speed is limited only by your local WiFi network (50–200+ MB/s).
- 📁 **Unlimited File Sizes**: Share high-resolution photos, 4K videos, audio files, PDFs, archives, and virtual disks without artificial size caps.
- 🔒 **End-to-End Encryption**: Mandatory 256-bit DTLS-SRTP encryption natively enforced by WebRTC in the browser.
- 📲 **Mobile & Touch Friendly**: QR code room joining, slide-out drawer navigation, and touch-optimized file selectors.
- 💬 **Text & Clipboard Sharing**: Share text notes, code snippets, auto-rendered links, and one-click clipboard items.
- 🛡️ **Hardened Security**: Includes anti-clickjacking HTTP headers (`X-Frame-Options: DENY`), strict filename sanitization against path traversal, and socket rate limiting.
- ⏱️ **Auto-Expiring Rooms**: Temporary 30-minute rooms ensure clean session management and zero stale data lingering on network channels.

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), React, TypeScript, TailwindCSS / Custom Design System, [Zustand](https://github.com/pmndrs/zustand).
- **Networking / P2P**: WebRTC DataChannels (`RTCDataChannel`), WebSockets ([Socket.IO](https://socket.io/)).
- **Signaling Server**: Node.js, Express, Socket.IO.
- **Icons & Styling**: [Lucide React](https://lucide.dev/), Custom HSL CSS tokens.

---

## 📁 Repository Structure

```
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   ├── room/[roomCode]/  # Interactive room workspace route
│   ├── features/         # Features showcase page
│   ├── how-it-works/     # Step-by-step interactive workflow page
│   ├── security/         # Security & privacy architecture page
│   ├── layout.tsx        # Root HTML layout & OpenGraph metadata
│   └── globals.css       # Global design system & responsive CSS
├── components/           # UI Components
│   ├── landing/          # Navbar, Hero, Footer, Feature cards
│   ├── room/             # DropZone, TransferFeed, TextInput, RoomLayout
│   └── common/           # Modals, Badges, Tooltips
├── lib/                  # WebRTC & Utilities
│   ├── webrtc/           # PeerManager, FileTransfer, SignalingClient
│   ├── store/            # Zustand state stores
│   └── utils/            # Room code generator, file formatters, sanitization
└── server/               # Signaling Server (Node.js/Express/Socket.IO)
    ├── index.ts          # Express & Socket.IO server entry point
    ├── roomManager.ts    # In-memory room & device lifecycle manager
    └── signalingHandler.ts# WebRTC signaling event handlers & rate limiter
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed.

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/nudge.git
cd nudge

# Install frontend dependencies
npm install

# Install signaling server dependencies
cd server
npm install
cd ..
```

### 3. Run Development Server

Start both the frontend and signaling server:

```bash
# Terminal 1: Run Next.js Frontend (http://localhost:3000)
npm run dev

# Terminal 2: Run Signaling Server (http://localhost:5001)
cd server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in two browser windows or two devices on the same WiFi network to test instant file and text sharing.

---

## 🌐 Production Deployment Guide

Nudge is architected into two components for production deployment:

### Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SIGNALING_URL=https://your-signaling-server.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
```

Create `.env` in the `server/` directory:

```env
PORT=5001
ALLOWED_ORIGINS=https://your-app-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
```

---

### Step 1: Deploy Signaling Server

Deploy the `server/` directory to **Render**, **Railway**, **Fly.io**, or a **VPS**:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check Endpoint**: `/health`

---

### Step 2: Deploy Next.js Frontend

Deploy the root directory to **Vercel** or **Netlify**:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

---

## 🛡️ Security & Privacy

- **Zero Cloud Persistence**: Files stream chunk-by-chunk in browser memory and are never uploaded or stored on any cloud disk.
- **Sanitized Downloads**: All incoming filenames are sanitized to prevent path traversal (`../`) and malicious file injection.
- **Strict Headers**: Configured with `X-Frame-Options: DENY`, MIME nosniff, and strict API permissions policies.

---

© Nudge · Built for speed & privacy.
