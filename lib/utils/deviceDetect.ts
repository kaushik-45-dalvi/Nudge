export interface DetectedDevice {
  iconType: 'laptop' | 'smartphone' | 'tablet' | 'monitor' | 'server' | 'terminal';
  emoji: string; // kept for backwards compatibility, returns icon identifier or clean device label
  label: string;
  nickname: string;
}

export function detectDevice(): DetectedDevice {
  if (typeof window === 'undefined') {
    return { iconType: 'server', emoji: 'server', label: 'Server', nickname: 'Server Node' };
  }

  const ua = window.navigator.userAgent;
  let os = 'Windows';
  let browser = 'Chrome';
  let iconType: DetectedDevice['iconType'] = 'laptop';

  // Detect OS
  if (/Windows/i.test(ua)) {
    os = 'Windows';
    iconType = 'laptop';
  } else if (/Macintosh/i.test(ua)) {
    os = 'macOS';
    iconType = 'laptop';
  } else if (/iPad/i.test(ua)) {
    os = 'iPadOS';
    iconType = 'tablet';
  } else if (/iPhone|iPod/i.test(ua)) {
    os = 'iOS';
    iconType = 'smartphone';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    iconType = /Mobile/i.test(ua) ? 'smartphone' : 'tablet';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    iconType = 'monitor';
  }

  // Detect Browser
  if (/Firefox/i.test(ua)) {
    browser = 'Firefox';
  } else if (/Edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/Chrome/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/OPR|Opera/i.test(ua)) {
    browser = 'Opera';
  }

  const label = `${browser} on ${os}`;
  const nickname = `${os} (${browser})`;

  return {
    iconType,
    emoji: iconType,
    label,
    nickname
  };
}
