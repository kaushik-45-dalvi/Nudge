import { create } from 'zustand';

interface PeerState {
  peerStates: Record<string, RTCPeerConnectionState>;
  channelStates: Record<string, boolean>;
  
  updatePeerState: (peerId: string, state: RTCPeerConnectionState) => void;
  setChannelOpen: (peerId: string, open: boolean) => void;
  clearPeers: () => void;
}

export const usePeerStore = create<PeerState>((set) => ({
  peerStates: {},
  channelStates: {},

  updatePeerState: (peerId, state) => set((store) => ({
    peerStates: {
      ...store.peerStates,
      [peerId]: state
    }
  })),

  setChannelOpen: (peerId, open) => set((store) => ({
    channelStates: {
      ...store.channelStates,
      [peerId]: open
    }
  })),

  clearPeers: () => set({
    peerStates: {},
    channelStates: {}
  })
}));
