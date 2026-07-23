export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds === Infinity || isNaN(seconds) || seconds < 0) return 'calculating...';
  if (seconds < 1) return 'less than a second';
  if (seconds < 60) return `~${Math.round(seconds)} seconds remaining`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = Math.round(seconds % 60);
  if (remainingSecs === 0) {
    return `~${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }
  return `~${minutes}m ${remainingSecs}s remaining`;
}

export function isValidURL(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export function getFileEmoji(mimeType: string, filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (mimeType.startsWith('image/')) return '📷';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.startsWith('text/') || ext === 'txt' || ext === 'md' || ext === 'json') return '📄';
  if (ext === 'pdf') return '📕';
  if (ext === 'zip' || ext === 'rar' || ext === 'tar' || ext === 'gz' || ext === '7z') return '📦';
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return '📊';
  if (ext === 'doc' || ext === 'docx') return '📘';
  if (ext === 'ppt' || ext === 'pptx') return '📙';
  if (ext === 'exe' || ext === 'msi' || ext === 'sh' || ext === 'bat') return '⚙️';
  
  return '📁';
}

export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file';
  // Remove null bytes, path traversal dots/slashes, HTML script tags, and illegal OS characters
  const clean = filename
    .replace(/\0/g, '')
    .replace(/^(\.\.[\/\\])+/g, '')
    .replace(/[\\/:\*\?"<>|]/g, '_')
    .replace(/<[^>]*>/g, '')
    .trim();
  
  return clean || 'downloaded_file';
}
