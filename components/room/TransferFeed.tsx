'use client';

import React from 'react';
import { useTransferStore, TransferHistoryItem, TransferProgressState } from '../../store/transferStore';
import { formatBytes, formatSpeed, formatTimeRemaining } from '../../lib/utils/fileUtils';
import { 
  File, Text, Clipboard, Link2, Download, ArrowUpRight, 
  ArrowDownLeft, CheckCircle2, XCircle, Ban, Copy, ExternalLink, RefreshCw 
} from 'lucide-react';
import { peerManager } from '../../lib/webrtc/PeerManager';

export function TransferFeed() {
  const history = useTransferStore((state) => state.history);
  const transfers = useTransferStore((state) => state.transfers);
  const clearHistory = useTransferStore((state) => state.clearHistory);

  const activeTransfers = Object.values(transfers).filter(
    (t) => t.status === 'transferring'
  );

  const handleCancel = (id: string) => {
    // Look up who we are sending to (using target peer IDs)
    const transfer = transfers[id];
    if (!transfer) return;
    
    console.log(`[TransferFeed] Cancelling active transfer: ${id}`);
    
    if (transfer.direction === 'send') {
      // Look up target socket ID from peer store or use active peer IDs
      const activeIds = peerManager.getActivePeerIds();
      activeIds.forEach(peerId => {
        peerManager.cancelSend(id, peerId);
      });
    } else {
      // For receivers, they just cancel locally
      useTransferStore.getState().cancelTransfer(id);
    }
  };

  const handleDownloadBlob = (item: TransferHistoryItem) => {
    if (!item.fileBlob || !item.fileName) return;
    
    console.log(`[TransferFeed] Re-downloading local blob: ${item.fileName}`);
    const url = URL.createObjectURL(item.fileBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (content?: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="space-y-6">
      {/* 1. ACTIVE TRANSFERS PROGRESS BARS */}
      {activeTransfers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-retro-orange">
            Active Transfers ({activeTransfers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTransfers.map((t) => {
              const isSend = t.direction === 'send';
              return (
                <div 
                  key={t.id} 
                  className="retro-card p-4 bg-slate-50 dark:bg-zinc-900 border-solid flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        {isSend ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        )}
                        <span className="font-bold text-xs truncate max-w-[200px]" title={t.name}>
                          {t.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatBytes(t.size)} · {isSend ? `to ${t.peerNickname}` : `from ${t.peerNickname}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancel(t.id)}
                      className="p-1 text-slate-400 hover:text-retro-red transition-colors"
                      title="Cancel Transfer"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSend ? 'bg-emerald-500' : 'bg-primary'
                      }`}
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>

                  {/* Speed & ETA stats */}
                  <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 mt-2 uppercase tracking-wide">
                    <span>{Math.round(t.progress)}% Complete</span>
                    <span>
                      {t.speed > 0 && `${formatSpeed(t.speed)} · `}
                      {formatTimeRemaining(t.remainingTime)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SESSION TRANSFER HISTORY FEED */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-lg font-bold">Transfer History</h4>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs font-semibold text-slate-400 hover:text-retro-red transition-colors flex items-center space-x-1"
            >
              <span>Clear Feed</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="dashed-card p-8 text-center bg-white">
            <div className="max-w-xs mx-auto space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/empty-transfers.png"
                alt="No transfers yet"
                className="w-28 h-28 mx-auto object-contain"
              />
              <h5 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: '#0A0A0A' }}>
                No transfers in this session
              </h5>
              <p style={{ fontSize: '0.75rem', color: '#9B9791', lineHeight: 1.6 }}>
                Drop a file above or share text with a connected peer to start streaming content directly.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {history.map((item) => {
              const isSent = item.direction === 'sent';
              const isFile = item.type === 'file';
              const isLink = item.type === 'link';
              const isClipboard = item.type === 'clipboard';
              
              return (
                <div 
                  key={item.id}
                  className="p-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Direction Icon Badge */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                        {isFile && <File className="w-5 h-5 text-slate-500" />}
                        {isLink && <Link2 className="w-5 h-5 text-primary" />}
                        {isClipboard && <Clipboard className="w-5 h-5 text-retro-orange" />}
                        {item.type === 'text' && <Text className="w-5 h-5 text-retro-red" />}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-zinc-900 rounded-full border border-slate-100 dark:border-zinc-800 flex items-center justify-center">
                        {isSent ? (
                          <ArrowUpRight className="w-2.5 h-2.5 text-emerald-500" />
                        ) : (
                          <ArrowDownLeft className="w-2.5 h-2.5 text-primary" />
                        )}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <span className="font-bold text-xs truncate block text-slate-900 dark:text-white" title={isFile ? item.fileName : item.content}>
                          {isFile ? item.fileName : item.content}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span>{isSent ? `Sent to ${item.peerEmoji} ${item.peerNickname}` : `Received from ${item.peerEmoji} ${item.peerNickname}`}</span>
                        <span>•</span>
                        <span>{isFile ? formatBytes(item.fileSize || 0) : `${item.content?.length || 0} chars`}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center space-x-2 pl-4">
                    {isFile && item.status === 'completed' && item.fileBlob && (
                      <button
                        onClick={() => handleDownloadBlob(item)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-slate-700 dark:text-zinc-200 transition-colors"
                        title="Download Again"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isFile && item.content && (
                      <>
                        <button
                          onClick={() => handleCopyText(item.content)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-slate-700 dark:text-zinc-200 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        
                        {isLink && (
                          <a
                            href={item.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-slate-700 dark:text-zinc-200 transition-colors block"
                            title="Open Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </>
                    )}

                    {item.status === 'failed' && (
                      <span title="Failed"><XCircle className="w-5 h-5 text-retro-red" /></span>
                    )}

                    {item.status === 'cancelled' && (
                      <span title="Cancelled"><XCircle className="w-5 h-5 text-slate-400" /></span>
                    )}

                    {item.status === 'completed' && (
                      <span title="Completed"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
