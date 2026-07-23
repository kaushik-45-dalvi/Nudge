import { Room, DeviceInfo } from './types';

const ADJECTIVES = [
  'BLUE', 'RED', 'SWIFT', 'BOLD', 'CALM', 'DARK', 'FAST',
  'GOLD', 'JADE', 'KEEN', 'LIME', 'MINT', 'NEON', 'OAK',
  'PINK', 'RUBY', 'SAGE', 'TEAL', 'WARM', 'ZINC', 'SILVER',
  'BRONZE', 'WILD', 'MYSTIC', 'VIBRANT', 'GLOWING', 'SILENT'
];

const NOUNS = [
  'DUCK', 'BEAR', 'WOLF', 'HAWK', 'DEER', 'FROG', 'CRAB',
  'FISH', 'LYNX', 'MOLE', 'NEWT', 'OWLS', 'PUMA', 'ROOK',
  'SEAL', 'TOAD', 'VOLE', 'WREN', 'YAKS', 'ZEBU', 'EAGLE',
  'TIGER', 'FOX', 'OTTER', 'BADGER', 'DOLPHIN', 'SHARK'
];

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Periodically clean up expired rooms
    this.cleanupInterval = setInterval(() => this.cleanExpiredRooms(), 15 * 1000);
  }

  private cleanExpiredRooms(): void {
    const now = Date.now();
    for (const [code, room] of this.rooms.entries()) {
      const hasNoDevices = Object.keys(room.devices).length === 0;
      const inactiveTimeout = hasNoDevices && (now - room.lastActivity > 10 * 60 * 1000); // 10 min inactivity
      const totalTimeout = now > room.expiresAt; // 30 min max life

      if (inactiveTimeout || totalTimeout) {
        console.log(`[RoomManager] Room ${code} expired and is being cleaned up.`);
        this.rooms.delete(code);
      }
    }
  }

  public destroy(): void {
    clearInterval(this.cleanupInterval);
  }

  public generateRoomCode(): string {
    let attempts = 0;
    while (attempts < 100) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const num = Math.floor(Math.random() * 99) + 1;
      const code = `${adj}-${noun}-${num}`;
      
      if (!this.rooms.has(code)) {
        return code;
      }
      attempts++;
    }
    return `ROOM-${Math.floor(Math.random() * 900000) + 100000}`;
  }

  public async createRoom(): Promise<string> {
    const roomCode = this.generateRoomCode();
    return this.createRoomWithCode(roomCode);
  }

  public async createRoomWithCode(roomCode: string): Promise<string> {
    // Don't create if already exists
    if (this.rooms.has(roomCode)) {
      return roomCode;
    }
    const now = Date.now();
    const room: Room = {
      roomCode,
      createdAt: now,
      expiresAt: now + 30 * 60 * 1000, // 30 minutes lifetime
      devices: {},
      lastActivity: now
    };
    this.rooms.set(roomCode, room);
    console.log(`[RoomManager] Created room: ${roomCode}`);
    return roomCode;
  }

  public async getRoom(roomCode: string): Promise<Room | null> {
    const normalized = roomCode.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
    const room = this.rooms.get(normalized);
    if (!room) return null;

    // Check expiry
    if (Date.now() > room.expiresAt) {
      this.rooms.delete(normalized);
      return null;
    }
    return room;
  }

  public async addDevice(roomCode: string, socketId: string, deviceInfo: { emoji: string; label: string; nickname: string }): Promise<DeviceInfo | null> {
    const room = await this.getRoom(roomCode);
    if (!room) return null;

    const device: DeviceInfo = {
      socketId,
      emoji: deviceInfo.emoji,
      label: deviceInfo.label,
      nickname: deviceInfo.nickname,
      joinedAt: Date.now()
    };

    room.devices[socketId] = device;
    room.lastActivity = Date.now();
    console.log(`[RoomManager] Device ${device.nickname} (${socketId}) joined room ${roomCode}`);
    return device;
  }

  public async removeDevice(roomCode: string, socketId: string): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    if (room.devices[socketId]) {
      console.log(`[RoomManager] Device ${room.devices[socketId].nickname} (${socketId}) left room ${roomCode}`);
      delete room.devices[socketId];
    }
    room.lastActivity = Date.now();
  }

  public async getDeviceCount(roomCode: string): Promise<number> {
    const room = await this.getRoom(roomCode);
    if (!room) return 0;
    return Object.keys(room.devices).length;
  }

  public async getDevices(roomCode: string): Promise<DeviceInfo[]> {
    const room = await this.getRoom(roomCode);
    if (!room) return [];
    return Object.values(room.devices);
  }

  public async renameDevice(roomCode: string, socketId: string, nickname: string): Promise<boolean> {
    const room = await this.getRoom(roomCode);
    if (!room || !room.devices[socketId]) return false;

    room.devices[socketId].nickname = nickname;
    room.lastActivity = Date.now();
    console.log(`[RoomManager] Device ${socketId} renamed to ${nickname}`);
    return true;
  }

  public async refreshRoom(roomCode: string): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    room.lastActivity = Date.now();
    // Extend expiry slightly up to 30 mins from now
    room.expiresAt = Date.now() + 30 * 60 * 1000;
  }
}
