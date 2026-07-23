import { signalingClient } from './SignalingClient';
import { useRoomStore } from '../../store/roomStore';
import { usePeerStore } from '../../store/peerStore';
import { useTransferStore } from '../../store/transferStore';
import { fileTransferManager } from './FileTransfer';
import { isValidURL } from '../utils/fileUtils';

export class PeerManager {
  private peers: Map<string, RTCPeerConnection> = new Map();
  private channels: Map<string, RTCDataChannel> = new Map();
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  
  private iceConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  public init() {
    signalingClient.connect(
      (targetSocketId) => this.createOffer(targetSocketId),
      (fromSocketId, offer) => this.handleOffer(fromSocketId, offer),
      (fromSocketId, answer) => this.handleAnswer(fromSocketId, answer),
      (fromSocketId, candidate) => this.handleIce(fromSocketId, candidate),
      (socketId) => this.disconnectPeer(socketId)
    );
  }

  // 1. SENDER: Initiate connection to a target peer
  public async createOffer(targetSocketId: string): Promise<void> {
    console.log(`[PeerManager] Creating connection to: ${targetSocketId}`);
    
    if (this.peers.has(targetSocketId)) {
      console.log(`[PeerManager] Connection to ${targetSocketId} already exists. Cleaning up first.`);
      this.disconnectPeer(targetSocketId);
    }

    const pc = new RTCPeerConnection(this.iceConfig);
    this.peers.set(targetSocketId, pc);
    usePeerStore.getState().updatePeerState(targetSocketId, 'connecting');

    // Create Data Channel
    const channel = pc.createDataChannel('nudge-transfer', {
      ordered: true
    });
    this.setupDataChannel(channel, targetSocketId);
    this.channels.set(targetSocketId, channel);

    // ICE Handlers
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalingClient.sendIce(targetSocketId, e.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[PeerManager] Connection state to ${targetSocketId}: ${pc.connectionState}`);
      usePeerStore.getState().updatePeerState(targetSocketId, pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.disconnectPeer(targetSocketId);
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      signalingClient.sendOffer(targetSocketId, offer);
    } catch (err) {
      console.error(`[PeerManager] Failed to create offer for ${targetSocketId}:`, err);
    }
  }

  // 2. RECEIVER: Receive offer from a peer and reply with answer
  public async handleOffer(fromSocketId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    console.log(`[PeerManager] Handling offer from: ${fromSocketId}`);

    if (this.peers.has(fromSocketId)) {
      console.log(`[PeerManager] Connection to ${fromSocketId} already exists. Overwriting.`);
      this.disconnectPeer(fromSocketId);
    }

    const pc = new RTCPeerConnection(this.iceConfig);
    this.peers.set(fromSocketId, pc);
    usePeerStore.getState().updatePeerState(fromSocketId, 'connecting');

    // Watch for remote data channel
    pc.ondatachannel = (e) => {
      console.log(`[PeerManager] Received DataChannel from ${fromSocketId}`);
      this.setupDataChannel(e.channel, fromSocketId);
      this.channels.set(fromSocketId, e.channel);
    };

    // ICE Handlers
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalingClient.sendIce(fromSocketId, e.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[PeerManager] Connection state to ${fromSocketId}: ${pc.connectionState}`);
      usePeerStore.getState().updatePeerState(fromSocketId, pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.disconnectPeer(fromSocketId);
      }
    };

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await this.flushPendingIceCandidates(fromSocketId);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signalingClient.sendAnswer(fromSocketId, answer);
    } catch (err) {
      console.error(`[PeerManager] Failed to handle offer and answer:`, err);
    }
  }

  // 3. SENDER: Receive answer from receiver peer
  public async handleAnswer(fromSocketId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    console.log(`[PeerManager] Received answer from: ${fromSocketId}`);
    const pc = this.peers.get(fromSocketId);
    if (!pc) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await this.flushPendingIceCandidates(fromSocketId);
    } catch (err) {
      console.error(`[PeerManager] Failed to apply remote description answer:`, err);
    }
  }

  // 4. BOTH: Receive ICE candidates
  public async handleIce(fromSocketId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peers.get(fromSocketId);
    if (!pc || !pc.remoteDescription) {
      console.log(`[PeerManager] Queueing ICE candidate for ${fromSocketId} (remote description pending)`);
      if (!this.pendingIceCandidates.has(fromSocketId)) {
        this.pendingIceCandidates.set(fromSocketId, []);
      }
      this.pendingIceCandidates.get(fromSocketId)!.push(candidate);
      return;
    }

    try {
      console.log(`[PeerManager] Applying ICE candidate from: ${fromSocketId}`);
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error(`[PeerManager] Failed to add ICE candidate:`, err);
    }
  }

  private async flushPendingIceCandidates(peerId: string): Promise<void> {
    const pc = this.peers.get(peerId);
    const candidates = this.pendingIceCandidates.get(peerId);
    if (!pc || !candidates || candidates.length === 0) return;

    console.log(`[PeerManager] Flushing ${candidates.length} queued ICE candidates for ${peerId}`);
    for (const cand of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err) {
        console.error(`[PeerManager] Failed to add queued ICE candidate for ${peerId}:`, err);
      }
    }
    this.pendingIceCandidates.delete(peerId);
  }

  // 5. Setup Data Channel event bindings
  private setupDataChannel(channel: RTCDataChannel, peerId: string) {
    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      console.log(`[PeerManager] DataChannel open with peer: ${peerId}`);
      usePeerStore.getState().setChannelOpen(peerId, true);
    };

    channel.onclose = () => {
      console.log(`[PeerManager] DataChannel closed with peer: ${peerId}`);
      usePeerStore.getState().setChannelOpen(peerId, false);
      this.disconnectPeer(peerId);
    };

    channel.onmessage = (e) => {
      const peer = useRoomStore.getState().devices.find(d => d.socketId === peerId);
      const nickname = peer?.nickname || 'Unknown Peer';
      const emoji = peer?.emoji || '👤';

      if (typeof e.data === 'string') {
        // String JSON content
        try {
          const msg = JSON.parse(e.data);
          
          switch (msg.type) {
            case 'file-meta':
              fileTransferManager.initReceive(msg, peerId, nickname, emoji);
              break;
            case 'file-complete':
              fileTransferManager.finalizeReceive(msg.transferId);
              break;
            case 'file-cancel':
              fileTransferManager.cancelReceive(msg.transferId);
              break;
            case 'text':
              useTransferStore.getState().addHistoryItem({
                type: 'text',
                direction: 'received',
                content: msg.content,
                peerNickname: nickname,
                peerEmoji: emoji,
                status: 'completed'
              });
              this.playTextSound();
              break;
            case 'link':
              useTransferStore.getState().addHistoryItem({
                type: 'link',
                direction: 'received',
                content: msg.content,
                peerNickname: nickname,
                peerEmoji: emoji,
                status: 'completed'
              });
              this.playTextSound();
              break;
            case 'clipboard':
              useTransferStore.getState().addHistoryItem({
                type: 'clipboard',
                direction: 'received',
                content: msg.content,
                peerNickname: nickname,
                peerEmoji: emoji,
                status: 'completed'
              });
              this.playTextSound();
              break;
          }
        } catch (err) {
          console.error('[PeerManager] Error parsing string message:', err);
        }
      } else {
        // Binary ArrayBuffer (file chunk)
        const transferId = fileTransferManager.getActiveIncomingId(peerId);
        if (transferId) {
          fileTransferManager.receiveChunk(transferId, e.data);
        }
      }
    };
  }

  // 6. SENDER: Dispatch a text transfer to peers
  public sendText(text: string, type: 'text' | 'link' | 'clipboard' = 'text', targetPeerIds?: string[]): void {
    const peersToSend = targetPeerIds || this.getActivePeerIds();
    if (peersToSend.length === 0) return;

    // Detect if text is a link to automatically upgrade it
    const finalType = type === 'text' && isValidURL(text) ? 'link' : type;

    const payload = JSON.stringify({
      type: finalType,
      content: text,
      timestamp: new Date().toISOString()
    });

    peersToSend.forEach(peerId => {
      const channel = this.channels.get(peerId);
      if (channel && channel.readyState === 'open') {
        channel.send(payload);
      }
    });

    // Write to history
    useTransferStore.getState().addHistoryItem({
      type: finalType,
      direction: 'sent',
      content: text,
      peerNickname: peersToSend.length === 1 
        ? (useRoomStore.getState().devices.find(d => d.socketId === peersToSend[0])?.nickname || 'Peer')
        : 'Everyone',
      peerEmoji: peersToSend.length === 1
        ? (useRoomStore.getState().devices.find(d => d.socketId === peersToSend[0])?.emoji || '👥')
        : '👥',
      status: 'completed'
    });
  }

  // 7. SENDER: Dispatch files to selected peers
  public sendFiles(files: FileList | File[], targetPeerIds?: string[]): void {
    const peersToSend = targetPeerIds || this.getActivePeerIds();
    if (peersToSend.length === 0) return;

    const fileList = Array.from(files);
    fileList.forEach(file => {
      peersToSend.forEach(peerId => {
        const channel = this.channels.get(peerId);
        const peer = useRoomStore.getState().devices.find(d => d.socketId === peerId);
        
        if (channel && channel.readyState === 'open') {
          fileTransferManager.sendFile(
            file, 
            channel, 
            peerId, 
            peer?.nickname || 'Peer', 
            peer?.emoji || '👤'
          );
        }
      });
    });
  }

  // 8. SENDER: Cancel sending file
  public cancelSend(transferId: string, peerSocketId: string) {
    const channel = this.channels.get(peerSocketId);
    if (channel) {
      fileTransferManager.cancelSend(transferId, channel);
    }
  }

  // Clean connection to a peer
  public disconnectPeer(socketId: string) {
    console.log(`[PeerManager] Cleaning up connection to: ${socketId}`);
    
    const pc = this.peers.get(socketId);
    if (pc) {
      pc.close();
      this.peers.delete(socketId);
    }

    const channel = this.channels.get(socketId);
    if (channel) {
      channel.close();
      this.channels.delete(socketId);
    }

    usePeerStore.getState().updatePeerState(socketId, 'disconnected');
    usePeerStore.getState().setChannelOpen(socketId, false);
  }

  public getActivePeerIds(): string[] {
    return Array.from(this.channels.entries())
      .filter(([_, ch]) => ch.readyState === 'open')
      .map(([id]) => id);
  }

  public clearAll() {
    console.log('[PeerManager] Clearing all peer connections');
    Array.from(this.peers.keys()).forEach(peerId => this.disconnectPeer(peerId));
    usePeerStore.getState().clearPeers();
  }

  private playTextSound() {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, context.currentTime); // E5
      
      gain.gain.setValueAtTime(0.03, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.15);
    } catch (e) {
      // Ignore
    }
  }
}

export const peerManager = new PeerManager();
