import { create } from 'zustand';

export interface TransferHistoryItem {
  id: string;
  type: 'file' | 'text' | 'link' | 'clipboard';
  direction: 'sent' | 'received';
  fileName?: string;
  fileSize?: number;
  content?: string;
  peerNickname: string;
  peerEmoji: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  fileBlob?: Blob; // stored in-memory for session re-downloads
}

export interface TransferProgressState {
  id: string;
  name: string;
  size: number;
  progress: number; // 0 to 100
  speed: number; // bytes/sec
  remainingTime: number; // seconds
  status: 'transferring' | 'completed' | 'cancelled' | 'failed';
  direction: 'send' | 'receive';
  peerNickname: string;
}

interface TransferState {
  history: TransferHistoryItem[];
  transfers: Record<string, TransferProgressState>;
  transferStats: {
    bytesSent: number;
    bytesReceived: number;
    filesTransferred: number;
  };
  
  addHistoryItem: (item: Omit<TransferHistoryItem, 'id' | 'timestamp'>) => string;
  updateHistoryBlob: (id: string, blob: Blob) => void;
  updateHistoryStatus: (id: string, status: TransferHistoryItem['status']) => void;
  clearHistory: () => void;
  
  initTransferProgress: (progress: TransferProgressState) => void;
  updateTransferProgress: (id: string, updates: Partial<TransferProgressState>) => void;
  completeTransfer: (id: string) => void;
  cancelTransfer: (id: string) => void;
  failTransfer: (id: string) => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  history: [],
  transfers: {},
  transferStats: {
    bytesSent: 0,
    bytesReceived: 0,
    filesTransferred: 0
  },

  addHistoryItem: (item) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const newItem: TransferHistoryItem = {
      ...item,
      id,
      timestamp
    };

    set((state) => {
      // Update statistics
      const stats = { ...state.transferStats };
      if (item.type === 'file' && item.status === 'completed' && item.fileSize) {
        stats.filesTransferred += 1;
        if (item.direction === 'sent') {
          stats.bytesSent += item.fileSize;
        } else {
          stats.bytesReceived += item.fileSize;
        }
      }
      return {
        history: [newItem, ...state.history],
        transferStats: stats
      };
    });

    return id;
  },

  updateHistoryBlob: (id, blob) => set((state) => ({
    history: state.history.map(item => 
      item.id === id ? { ...item, fileBlob: blob } : item
    )
  })),

  updateHistoryStatus: (id, status) => set((state) => ({
    history: state.history.map(item => 
      item.id === id ? { ...item, status } : item
    )
  })),

  clearHistory: () => set({ history: [] }),

  initTransferProgress: (progress) => set((state) => ({
    transfers: {
      ...state.transfers,
      [progress.id]: progress
    }
  })),

  updateTransferProgress: (id, updates) => set((state) => {
    const existing = state.transfers[id];
    if (!existing) return {};
    return {
      transfers: {
        ...state.transfers,
        [id]: { ...existing, ...updates }
      }
    };
  }),

  completeTransfer: (id) => set((state) => {
    const existing = state.transfers[id];
    if (!existing) return {};
    
    // Update stats
    const stats = { ...state.transferStats };
    stats.filesTransferred += 1;
    if (existing.direction === 'send') {
      stats.bytesSent += existing.size;
    } else {
      stats.bytesReceived += existing.size;
    }

    return {
      transfers: {
        ...state.transfers,
        [id]: { ...existing, progress: 100, speed: 0, remainingTime: 0, status: 'completed' }
      },
      transferStats: stats
    };
  }),

  cancelTransfer: (id) => set((state) => {
    const existing = state.transfers[id];
    if (!existing) return {};
    return {
      transfers: {
        ...state.transfers,
        [id]: { ...existing, progress: 0, speed: 0, remainingTime: 0, status: 'cancelled' }
      }
    };
  }),

  failTransfer: (id) => set((state) => {
    const existing = state.transfers[id];
    if (!existing) return {};
    return {
      transfers: {
        ...state.transfers,
        [id]: { ...existing, progress: 0, speed: 0, remainingTime: 0, status: 'failed' }
      }
    };
  })
}));
