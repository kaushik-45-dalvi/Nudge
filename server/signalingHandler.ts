import { Server, Socket } from 'socket.io';
import { RoomManager } from './roomManager';
import os from 'os';

function getLocalIpAddress(): string | null {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(socketId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(socketId);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(socketId, { count: 1, resetAt: now + 10000 }); // 10 seconds window
    return false;
  }

  limit.count++;
  if (limit.count > 15) { // Max 15 requests per 10 seconds
    return true;
  }
  return false;
}

function sanitizeText(input: string, maxLen: number = 40): string {
  if (!input) return 'Peer';
  return input.replace(/<[^>]*>/g, '').trim().substring(0, maxLen) || 'Peer';
}

export function setupSignalingHandlers(
  socket: Socket,
  io: Server,
  roomManager: RoomManager
): void {
  // Clean rate limit record on disconnect
  socket.on('disconnect', () => {
    rateLimitMap.delete(socket.id);
  });

  // 1. CREATE ROOM
  socket.on('room:create', async ({ deviceInfo }) => {
    try {
      if (isRateLimited(socket.id)) {
        socket.emit('room:error', { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment.' });
        return;
      }

      const safeDeviceInfo = {
        emoji: sanitizeText(deviceInfo?.emoji || '📱', 10),
        label: sanitizeText(deviceInfo?.label || 'Browser', 40),
        nickname: sanitizeText(deviceInfo?.nickname || 'Peer User', 40)
      };

      const roomCode = await roomManager.createRoom();
      const device = await roomManager.addDevice(roomCode, socket.id, safeDeviceInfo);

      if (!device) {
        socket.emit('room:error', { code: 'CREATE_FAILED', message: 'Failed to create room' });
        return;
      }

      socket.join(roomCode);
      socket.data.roomCode = roomCode;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      socket.emit('room:created', {
        roomCode,
        roomUrl: `${appUrl}/room/${roomCode}`,
        expiresAt: Date.now() + 30 * 60 * 1000,
        localIp: getLocalIpAddress()
      });
    } catch (err) {
      console.error('Error in room:create:', err);
      socket.emit('room:error', { code: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // 2. JOIN ROOM (auto-creates room if it doesn't exist)
  socket.on('room:join', async ({ roomCode, deviceInfo }) => {
    try {
      // Normalize the room code
      const normalizedCode = roomCode.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
      
      let room = await roomManager.getRoom(normalizedCode);
      let isNewRoom = false;

      // Auto-create the room if it doesn't exist
      if (!room) {
        console.log(`[SignalingHandler] Room ${normalizedCode} does not exist, auto-creating...`);
        await roomManager.createRoomWithCode(normalizedCode);
        room = await roomManager.getRoom(normalizedCode);
        isNewRoom = true;

        if (!room) {
          socket.emit('room:error', { code: 'CREATE_FAILED', message: 'Failed to create room' });
          return;
        }
      }

      const deviceCount = await roomManager.getDeviceCount(normalizedCode);
      if (deviceCount >= 6) {
        socket.emit('room:error', { code: 'FULL', message: 'Room is full (max 6 devices)' });
        return;
      }

      const safeDeviceInfo = deviceInfo || { emoji: '📱', label: 'Browser', nickname: 'Peer User' };
      const device = await roomManager.addDevice(normalizedCode, socket.id, safeDeviceInfo);
      if (!device) {
        socket.emit('room:error', { code: 'JOIN_FAILED', message: 'Failed to join room' });
        return;
      }

      const devices = await roomManager.getDevices(normalizedCode);

      socket.join(normalizedCode);
      socket.data.roomCode = normalizedCode;

      // Send confirmation to the joining device
      socket.emit('room:joined', {
        roomCode: normalizedCode,
        devices,
        expiresAt: room.expiresAt,
        localIp: getLocalIpAddress()
      });

      // Broadcast to other devices in the room that a new device joined
      socket.to(normalizedCode).emit('device:joined', device);

      // Trigger WebRTC signaling: tell other devices to send WebRTC offer to this new device
      socket.to(normalizedCode).emit('signal:initiate-offer', { targetSocketId: socket.id });
    } catch (err) {
      console.error('Error in room:join:', err);
      socket.emit('room:error', { code: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // 3. WEBRTC OFFER
  socket.on('signal:offer', ({ targetSocketId, sdp }) => {
    io.to(targetSocketId).emit('signal:offer', {
      fromSocketId: socket.id,
      sdp
    });
  });

  // 4. WEBRTC ANSWER
  socket.on('signal:answer', ({ targetSocketId, sdp }) => {
    io.to(targetSocketId).emit('signal:answer', {
      fromSocketId: socket.id,
      sdp
    });
  });

  // 5. WEBRTC ICE CANDIDATES
  socket.on('signal:ice', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('signal:ice', {
      fromSocketId: socket.id,
      candidate
    });
  });

  // 6. RENAME DEVICE
  socket.on('device:rename', async ({ nickname }) => {
    const roomCode = socket.data.roomCode;
    if (roomCode) {
      const success = await roomManager.renameDevice(roomCode, socket.id, nickname);
      if (success) {
        io.to(roomCode).emit('device:renamed', {
          socketId: socket.id,
          nickname
        });
      }
    }
  });

  // 7. ROOM HEARTBEAT / KEEP-ALIVE
  socket.on('room:ping', async () => {
    const roomCode = socket.data.roomCode;
    if (roomCode) {
      await roomManager.refreshRoom(roomCode);
    }
  });

  // 8. DISCONNECT / LEAVE ROOM
  socket.on('disconnect', async () => {
    const roomCode = socket.data.roomCode;
    if (roomCode) {
      await roomManager.removeDevice(roomCode, socket.id);
      socket.to(roomCode).emit('device:left', { socketId: socket.id });
      socket.leave(roomCode);
    }
  });
}
