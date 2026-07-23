import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomManager } from './roomManager';
import { setupSignalingHandlers } from './signalingHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// CORS configuration — configurable via ALLOWED_ORIGINS env var
const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5000',
  'http://localhost:5001'
];

const allowedOrigins = [...defaultOrigins, ...envOrigins];

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true; // Allow requests with no origin (e.g. server-to-server)
  if (allowedOrigins.includes(origin)) return true;
  if (origin.startsWith('http://localhost:')) return true;
  if (origin.startsWith('http://127.0.0.1:')) return true;
  // Allow any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Nudge signaling server is running' });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const roomManager = new RoomManager();

app.post('/api/room/create', async (req, res) => {
  try {
    const roomCode = await roomManager.createRoom();
    res.status(200).json({ roomCode });
  } catch (err) {
    console.error('Error creating room via API:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

io.on('connection', (socket) => {
  console.log(`[Server] Socket connected: ${socket.id}`);
  setupSignalingHandlers(socket, io, roomManager);
});

httpServer.listen(port, () => {
  console.log(`[Server] Signaling server listening on port ${port}`);
  console.log(`[Server] Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  roomManager.destroy();
  httpServer.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
});
