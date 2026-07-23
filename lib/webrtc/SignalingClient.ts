import { io, Socket } from 'socket.io-client';
import { useRoomStore } from '../../store/roomStore';
import { detectDevice } from '../utils/deviceDetect';

export class SignalingClient {
  private socket: Socket | null = null;
  private serverUrl: string;
  private pendingRoomCode: string | null = null; // queued until socket connects

  private onInitiateOffer: ((targetSocketId: string) => void) | null = null;
  private onOffer: ((fromSocketId: string, sdp: RTCSessionDescriptionInit) => void) | null = null;
  private onAnswer: ((fromSocketId: string, sdp: RTCSessionDescriptionInit) => void) | null = null;
  private onIce: ((fromSocketId: string, candidate: RTCIceCandidateInit) => void) | null = null;
  private onDisconnectPeer: ((socketId: string) => void) | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.serverUrl = this.getServerUrl();
  }

  private getServerUrl(): string {
    if (process.env.NEXT_PUBLIC_SIGNALING_URL) {
      return process.env.NEXT_PUBLIC_SIGNALING_URL;
    }
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const host = window.location.hostname;
      return `${protocol}//${host}:5001`;
    }
    return 'http://localhost:5001';
  }

  public connect(
    onInitiateOffer: (targetSocketId: string) => void,
    onOffer: (fromSocketId: string, sdp: RTCSessionDescriptionInit) => void,
    onAnswer: (fromSocketId: string, sdp: RTCSessionDescriptionInit) => void,
    onIce: (fromSocketId: string, candidate: RTCIceCandidateInit) => void,
    onDisconnectPeer: (socketId: string) => void
  ) {
    // Allow re-registration of handlers even if socket exists
    this.onInitiateOffer = onInitiateOffer;
    this.onOffer = onOffer;
    this.onAnswer = onAnswer;
    this.onIce = onIce;
    this.onDisconnectPeer = onDisconnectPeer;

    // If socket is already connected, do not recreate
    if (this.socket && this.socket.connected) {
      console.log('[SignalingClient] Already connected, updating handlers only.');
      return;
    }

    // If socket exists but disconnected, reconnect it
    if (this.socket) {
      this.socket.connect();
      return;
    }

    // Refresh server URL in case hostname changed
    this.serverUrl = this.getServerUrl();
    console.log(`[SignalingClient] Connecting to signaling server at ${this.serverUrl}`);

    this.socket = io(this.serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log(`[SignalingClient] Socket connected: ${this.socket?.id}`);
      useRoomStore.getState().setError(null);
      useRoomStore.getState().setSocketConnected(true);

      const localDevice = detectDevice();
      useRoomStore.getState().setLocalDevice({
        ...localDevice,
        socketId: this.socket!.id!,
        joinedAt: Date.now()
      });

      // Start ping heartbeat
      if (this.pingInterval) clearInterval(this.pingInterval);
      this.pingInterval = setInterval(() => {
        this.socket?.emit('room:ping');
      }, 30000);

      // If joinRoom was called before socket was ready, fulfil it now
      if (this.pendingRoomCode) {
        console.log(`[SignalingClient] Emitting queued room:join for ${this.pendingRoomCode}`);
        const ld = detectDevice();
        this.socket!.emit('room:join', { roomCode: this.pendingRoomCode, deviceInfo: ld });
        this.pendingRoomCode = null;
      } else {
        // Auto re-join active room on socket reconnection
        const currentRoomCode = useRoomStore.getState().roomCode;
        if (currentRoomCode) {
          console.log(`[SignalingClient] Socket reconnected — auto re-joining room: ${currentRoomCode}`);
          const ld = detectDevice();
          this.socket!.emit('room:join', { roomCode: currentRoomCode, deviceInfo: ld });
        }
      }
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[SignalingClient] Socket retrying connection:', err.message);
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('[SignalingClient] All reconnection attempts failed.');
      useRoomStore.getState().setError('Could not connect to signaling server (port 5001). Please check if server is running.');
    });

    this.socket.on('disconnect', () => {
      console.log('[SignalingClient] Socket disconnected');
      useRoomStore.getState().setSocketConnected(false);
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
    });

    // Handle room created
    this.socket.on('room:created', ({ roomCode, roomUrl, expiresAt }) => {
      console.log(`[SignalingClient] Room created: ${roomCode}`);
      useRoomStore.getState().setRoomData(roomCode, roomUrl, [], expiresAt);
    });

    // Handle room joined — derive URL from current browser window, substituting localIp for localhost if available
    this.socket.on('room:joined', ({ roomCode, devices, expiresAt, localIp }) => {
      console.log(`[SignalingClient] Room joined: ${roomCode}, server localIp: ${localIp}`);
      
      let origin = typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

      // If opening via localhost/127.0.0.1 on local dev machine, substitute with local WiFi IP for scannable QR codes!
      if (typeof window !== 'undefined' && localIp && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        const port = window.location.port ? `:${window.location.port}` : '';
        origin = `${window.location.protocol}//${localIp}${port}`;
        console.log(`[SignalingClient] Using WiFi IP for room URL: ${origin}/room/${roomCode}`);
      }

      useRoomStore.getState().setRoomData(roomCode, `${origin}/room/${roomCode}`, devices, expiresAt);
    });

    // Handle new device joining
    this.socket.on('device:joined', (device) => {
      console.log(`[SignalingClient] Device joined: ${device.nickname}`);
      useRoomStore.getState().addDevice(device);
    });

    // Handle device leaving
    this.socket.on('device:left', ({ socketId }) => {
      console.log(`[SignalingClient] Device left: ${socketId}`);
      useRoomStore.getState().removeDevice(socketId);
      this.onDisconnectPeer?.(socketId);
    });

    // Handle device renamed
    this.socket.on('device:renamed', ({ socketId, nickname }) => {
      console.log(`[SignalingClient] Device ${socketId} renamed to ${nickname}`);
      useRoomStore.getState().renameDevice(socketId, nickname);
    });

    // WebRTC signaling forwards
    this.socket.on('signal:initiate-offer', ({ targetSocketId }) => {
      console.log(`[SignalingClient] Initiating offer to: ${targetSocketId}`);
      this.onInitiateOffer?.(targetSocketId);
    });

    this.socket.on('signal:offer', ({ fromSocketId, sdp }) => {
      console.log(`[SignalingClient] Received offer from: ${fromSocketId}`);
      this.onOffer?.(fromSocketId, sdp);
    });

    this.socket.on('signal:answer', ({ fromSocketId, sdp }) => {
      console.log(`[SignalingClient] Received answer from: ${fromSocketId}`);
      this.onAnswer?.(fromSocketId, sdp);
    });

    this.socket.on('signal:ice', ({ fromSocketId, candidate }) => {
      console.log(`[SignalingClient] Received ICE candidate from: ${fromSocketId}`);
      this.onIce?.(fromSocketId, candidate);
    });

    this.socket.on('room:error', ({ code, message }) => {
      console.error(`[SignalingClient] Room error (${code}): ${message}`);
      useRoomStore.getState().setError(message);
    });
  }

  public createRoom() {
    if (!this.socket) return;
    const localDevice = detectDevice();
    useRoomStore.getState().setConnecting(true);
    this.socket.emit('room:create', { deviceInfo: localDevice });
  }

  /**
   * Join a room. If the socket isn't connected yet, queues the join
   * until the 'connect' event fires.
   */
  public joinRoom(roomCode: string) {
    useRoomStore.getState().setConnecting(true);
    if (this.socket && this.socket.connected) {
      const localDevice = detectDevice();
      this.socket.emit('room:join', { roomCode, deviceInfo: localDevice });
    } else {
      // Queue for when socket connects
      console.log(`[SignalingClient] Socket not yet connected — queuing join for room: ${roomCode}`);
      this.pendingRoomCode = roomCode;
    }
  }

  public renameDevice(nickname: string) {
    if (!this.socket) return;
    this.socket.emit('device:rename', { nickname });
  }

  public sendOffer(targetSocketId: string, sdp: RTCSessionDescriptionInit) {
    this.socket?.emit('signal:offer', { targetSocketId, sdp });
  }

  public sendAnswer(targetSocketId: string, sdp: RTCSessionDescriptionInit) {
    this.socket?.emit('signal:answer', { targetSocketId, sdp });
  }

  public sendIce(targetSocketId: string, candidate: RTCIceCandidateInit) {
    this.socket?.emit('signal:ice', { targetSocketId, candidate });
  }

  public sendPing() {
    this.socket?.emit('room:ping');
  }

  public disconnect() {
    this.pendingRoomCode = null;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const signalingClient = new SignalingClient();
