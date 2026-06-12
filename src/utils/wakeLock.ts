let lock: WakeLockSentinel | null = null;

export async function acquireWakeLock(): Promise<void> {
  if (!('wakeLock' in navigator)) return;
  try {
    lock = await navigator.wakeLock.request('screen');
  } catch {
    // Not critical — silently ignore (e.g. low battery mode, unsupported)
  }
}

export function releaseWakeLock(): void {
  lock?.release();
  lock = null;
}

// Re-acquire after the page becomes visible again (iOS releases lock on tab switch)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && lock === null) {
    // Only re-acquire if we previously held one (Timer is still active)
    // Callers handle this by calling acquireWakeLock() again on visibilitychange
  }
});
