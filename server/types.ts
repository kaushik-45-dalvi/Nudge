export interface DeviceInfo {
  socketId: string;
  emoji: string;
  label: string;
  nickname: string;
  joinedAt: number;
}

export interface Room {
  roomCode: string;
  createdAt: number;
  expiresAt: number;
  devices: { [socketId: string]: DeviceInfo };
  lastActivity: number;
}
