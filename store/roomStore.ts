import { create } from 'zustand';

export interface DeviceInfo {
  socketId: string;
  emoji: string;
  label: string;
  nickname: string;
  joinedAt: number;
}

interface RoomState {
  roomCode: string | null;
  roomUrl: string | null;
  expiresAt: number | null;
  localDevice: DeviceInfo | null;
  devices: DeviceInfo[];
  socketConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  setRoomData: (roomCode: string, roomUrl: string, devices: DeviceInfo[], expiresAt: number) => void;
  setLocalDevice: (device: DeviceInfo) => void;
  addDevice: (device: DeviceInfo) => void;
  removeDevice: (socketId: string) => void;
  renameDevice: (socketId: string, nickname: string) => void;
  setSocketConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: null,
  roomUrl: null,
  expiresAt: null,
  localDevice: null,
  devices: [],
  socketConnected: false,
  isConnecting: false,
  error: null,

  setRoomData: (roomCode, roomUrl, devices, expiresAt) => set((state) => {
    // Filter out local device if it's somehow in the devices list
    const otherDevices = devices.filter(d => d.socketId !== state.localDevice?.socketId);
    return {
      roomCode,
      roomUrl,
      devices: otherDevices,
      expiresAt,
      isConnecting: false,
      error: null
    };
  }),

  setLocalDevice: (localDevice) => set({ localDevice }),

  addDevice: (device) => set((state) => {
    if (device.socketId === state.localDevice?.socketId) return {};
    // Avoid duplicates
    if (state.devices.some(d => d.socketId === device.socketId)) return {};
    return { devices: [...state.devices, device] };
  }),

  removeDevice: (socketId) => set((state) => ({
    devices: state.devices.filter(d => d.socketId !== socketId)
  })),

  renameDevice: (socketId, nickname) => set((state) => {
    if (state.localDevice?.socketId === socketId) {
      return {
        localDevice: { ...state.localDevice, nickname }
      };
    }
    return {
      devices: state.devices.map(d => 
        d.socketId === socketId ? { ...d, nickname } : d
      )
    };
  }),

  setSocketConnected: (socketConnected) => set({ socketConnected }),

  setConnecting: (isConnecting) => set({ isConnecting }),

  setError: (error) => set({ error, isConnecting: false }),

  clearRoom: () => set({
    roomCode: null,
    roomUrl: null,
    expiresAt: null,
    devices: [],
    isConnecting: false,
    error: null
  })
}));
