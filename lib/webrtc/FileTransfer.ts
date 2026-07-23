import { useTransferStore } from '../../store/transferStore';
import { sanitizeFilename } from '../utils/fileUtils';

interface IncomingTransfer {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  totalChunks: number;
  receivedChunks: number;
  chunks: ArrayBuffer[];
  startTime: number;
  lastProgressTime: number;
  lastProgressBytes: number;
  peerNickname: string;
  peerEmoji: string;
  historyId: string;
  peerId: string;
}

export class FileTransferManager {
  private incoming: Map<string, IncomingTransfer> = new Map();
  private activeIncoming: Map<string, string> = new Map(); // peerId -> transferId
  private activeSends: Map<string, { paused: boolean; resume: (() => void) | null }> = new Map();

  private sendQueues: Map<string, Array<{ file: File; channel: RTCDataChannel; peerId: string; peerNickname: string; peerEmoji: string }>> = new Map();
  private isProcessingQueue: Map<string, boolean> = new Map();

  public getActiveIncomingId(peerId: string): string | undefined {
    return this.activeIncoming.get(peerId);
  }

  // 1. RECEIVER: Initialize receiving a file
  public initReceive(meta: { transferId: string; name: string; size: number; mimeType: string; totalChunks: number }, peerId: string, peerNickname: string, peerEmoji: string): void {
    const cleanName = sanitizeFilename(meta.name);

    const historyId = useTransferStore.getState().addHistoryItem({
      type: 'file',
      direction: 'received',
      fileName: cleanName,
      fileSize: meta.size,
      peerNickname,
      peerEmoji,
      status: 'pending'
    });

    const now = Date.now();
    this.incoming.set(meta.transferId, {
      id: meta.transferId,
      name: cleanName,
      size: meta.size,
      mimeType: meta.mimeType,
      totalChunks: meta.totalChunks,
      receivedChunks: 0,
      chunks: [],
      startTime: now,
      lastProgressTime: now,
      lastProgressBytes: 0,
      peerNickname,
      peerEmoji,
      historyId,
      peerId
    });

    this.activeIncoming.set(peerId, meta.transferId);

    useTransferStore.getState().initTransferProgress({
      id: meta.transferId,
      name: meta.name,
      size: meta.size,
      progress: 0,
      speed: 0,
      remainingTime: 0,
      status: 'transferring',
      direction: 'receive',
      peerNickname
    });
  }

  // 2. RECEIVER: Receive a single chunk
  public receiveChunk(transferId: string, chunk: ArrayBuffer): void {
    const transfer = this.incoming.get(transferId);
    if (!transfer) return;

    transfer.chunks.push(chunk);
    transfer.receivedChunks++;

    const now = Date.now();
    
    const CHUNK_SIZE = 16384; // 16KB
    const bytesReceived = transfer.chunks.length * CHUNK_SIZE;
    
    // Calculate progress %
    const progress = Math.min((transfer.receivedChunks / transfer.totalChunks) * 100, 99.9);

    // Calculate speed (average and instantaneous)
    let speed = 0;
    let remainingTime = 0;

    // Refresh stats every 500ms
    if (now - transfer.lastProgressTime >= 500) {
      const deltaBytes = bytesReceived - transfer.lastProgressBytes;
      const deltaMs = now - transfer.lastProgressTime;
      speed = (deltaBytes / deltaMs) * 1000; // bytes per second
      
      const bytesRemaining = Math.max(transfer.size - bytesReceived, 0);
      remainingTime = speed > 0 ? bytesRemaining / speed : 0;

      transfer.lastProgressTime = now;
      transfer.lastProgressBytes = bytesReceived;

      useTransferStore.getState().updateTransferProgress(transferId, {
        progress,
        speed,
        remainingTime
      });
    } else {
      useTransferStore.getState().updateTransferProgress(transferId, {
        progress
      });
    }
  }

  // 3. RECEIVER: Finalize transfer and trigger download
  public finalizeReceive(transferId: string): void {
    const transfer = this.incoming.get(transferId);
    if (!transfer) return;

    const blob = new Blob(transfer.chunks, { type: transfer.mimeType });
    
    // Trigger download with cross-platform (iOS Safari / Android) fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = transfer.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 10000);

    // Update stores
    useTransferStore.getState().completeTransfer(transferId);
    useTransferStore.getState().updateHistoryBlob(transfer.historyId, blob);
    useTransferStore.getState().updateHistoryStatus(transfer.historyId, 'completed');

    // Play visual satisfaction feedback if available
    this.playAudioNotification();

    this.activeIncoming.delete(transfer.peerId);
    this.incoming.delete(transferId);
  }

  // 4. RECEIVER: Handle cancellation by sender
  public cancelReceive(transferId: string): void {
    const transfer = this.incoming.get(transferId);
    if (!transfer) return;

    useTransferStore.getState().cancelTransfer(transferId);
    useTransferStore.getState().updateHistoryStatus(transfer.historyId, 'cancelled');
    
    this.activeIncoming.delete(transfer.peerId);
    this.incoming.delete(transferId);
  }

  // 5. SENDER: Enqueue file for sending to a specific peer sequentially
  public async sendFile(
    file: File, 
    channel: RTCDataChannel, 
    peerId: string, 
    peerNickname: string,
    peerEmoji: string
  ): Promise<void> {
    if (!this.sendQueues.has(peerId)) {
      this.sendQueues.set(peerId, []);
    }
    const queue = this.sendQueues.get(peerId)!;
    queue.push({ file, channel, peerId, peerNickname, peerEmoji });

    if (!this.isProcessingQueue.get(peerId)) {
      this.processSendQueue(peerId);
    }
  }

  private async processSendQueue(peerId: string): Promise<void> {
    this.isProcessingQueue.set(peerId, true);
    const queue = this.sendQueues.get(peerId);

    while (queue && queue.length > 0) {
      const item = queue.shift();
      if (item && item.channel.readyState === 'open') {
        await this.executeSendFile(item.file, item.channel, item.peerId, item.peerNickname, item.peerEmoji);
      }
    }

    this.isProcessingQueue.set(peerId, false);
  }

  // Internal implementation of sending a single file chunk by chunk
  private async executeSendFile(
    file: File, 
    channel: RTCDataChannel, 
    peerId: string, 
    peerNickname: string,
    peerEmoji: string
  ): Promise<void> {
    const transferId = crypto.randomUUID();
    const CHUNK_SIZE = 16384; // 16KB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Write to history
    const historyId = useTransferStore.getState().addHistoryItem({
      type: 'file',
      direction: 'sent',
      fileName: file.name,
      fileSize: file.size,
      peerNickname,
      peerEmoji,
      status: 'pending'
    });

    // Initialize progress tracking
    useTransferStore.getState().initTransferProgress({
      id: transferId,
      name: file.name,
      size: file.size,
      progress: 0,
      speed: 0,
      remainingTime: 0,
      status: 'transferring',
      direction: 'send',
      peerNickname
    });

    this.activeSends.set(transferId, { paused: false, resume: null });

    // Send metadata
    channel.send(JSON.stringify({
      type: 'file-meta',
      transferId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      totalChunks
    }));

    let offset = 0;
    let chunkIndex = 0;
    let lastTime = Date.now();
    let lastBytes = 0;

    // DataChannel flow control
    channel.bufferedAmountLowThreshold = 65536; // 64KB
    
    const handleBufferedAmountLow = () => {
      const activeSend = this.activeSends.get(transferId);
      if (activeSend && activeSend.paused) {
        activeSend.paused = false;
        if (activeSend.resume) {
          activeSend.resume();
        }
      }
    };

    channel.onbufferedamountlow = handleBufferedAmountLow;

    const waitForBufferToDrain = (): Promise<void> => {
      return new Promise<void>((resolve) => {
        const activeSend = this.activeSends.get(transferId);
        if (!activeSend) {
          resolve();
          return;
        }

        if (channel.bufferedAmount > 1024 * 1024) { // Pause if > 1MB
          activeSend.paused = true;
          activeSend.resume = () => {
            activeSend.resume = null;
            resolve();
          };
        } else {
          resolve();
        }
      });
    };

    try {
      while (offset < file.size) {
        // Check if cancelled
        const activeSend = this.activeSends.get(transferId);
        if (!activeSend || (activeSend.paused && activeSend.resume === null && !this.activeSends.has(transferId))) {
          // Cancelled
          return;
        }

        // Wait for WebRTC buffer to clear up
        await waitForBufferToDrain();

        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const chunk = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target!.result as ArrayBuffer);
          reader.onerror = (err) => reject(err);
          reader.readAsArrayBuffer(slice);
        });

        // Send binary data
        channel.send(chunk);
        
        chunkIndex++;
        offset += CHUNK_SIZE;

        const now = Date.now();
        const progress = Math.min((offset / file.size) * 100, 100);

        // Update progress and speeds every 500ms
        if (now - lastTime >= 500) {
          const deltaBytes = offset - lastBytes;
          const deltaMs = now - lastTime;
          const speed = (deltaBytes / deltaMs) * 1000;
          const bytesRemaining = Math.max(file.size - offset, 0);
          const remainingTime = speed > 0 ? bytesRemaining / speed : 0;

          lastTime = now;
          lastBytes = offset;

          useTransferStore.getState().updateTransferProgress(transferId, {
            progress,
            speed,
            remainingTime
          });
        } else {
          useTransferStore.getState().updateTransferProgress(transferId, {
            progress
          });
        }
      }

      // Send complete metadata
      channel.send(JSON.stringify({
        type: 'file-complete',
        transferId
      }));

      // Set completed state
      useTransferStore.getState().completeTransfer(transferId);
      useTransferStore.getState().updateHistoryStatus(historyId, 'completed');
      
    } catch (error) {
      console.error('[FileTransfer] Error sending file:', error);
      useTransferStore.getState().failTransfer(transferId);
      useTransferStore.getState().updateHistoryStatus(historyId, 'failed');
    } finally {
      this.activeSends.delete(transferId);
    }
  }

  // 6. SENDER: Cancel a send transfer
  public cancelSend(transferId: string, channel: RTCDataChannel): void {
    const activeSend = this.activeSends.get(transferId);
    if (activeSend) {
      // Send cancel event to remote peer
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify({
          type: 'file-cancel',
          transferId
        }));
      }
      this.activeSends.delete(transferId);
      useTransferStore.getState().cancelTransfer(transferId);
    }
  }

  private playAudioNotification() {
    try {
      // Audio cue for successful transfer
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, context.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, context.currentTime + 0.1); // A5
      
      gain.gain.setValueAtTime(0.05, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.3);
    } catch (e) {
      // Ignore audio contexts blocked by browser policies
    }
  }
}

export const fileTransferManager = new FileTransferManager();
