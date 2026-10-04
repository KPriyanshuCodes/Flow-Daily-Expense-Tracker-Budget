import { registerSW } from 'virtual:pwa-register';

/**
 * Registers the Service Worker only in production.
 * Ensures Flow is fully cached for offline use in airplane mode,
 * and automatically updates when a new version is deployed.
 */
export function registerFlowServiceWorker() {
  if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[Flow SW] New version available. Refreshing to activate update...');
        // Automatically activate new service worker and refresh
        updateSW(true);
      },
      onOfflineReady() {
        console.log('[Flow SW] Flow application shell is cached and ready to run completely offline.');
      },
      onRegistered(registration) {
        console.log('[Flow SW] Service worker registered with scope:', registration?.scope);
        // Periodically check for updates (every 60 minutes)
        if (registration) {
          setInterval(() => {
            registration.update().catch(() => {});
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.warn('[Flow SW] Service worker registration failed:', error);
      },
    });
  }
}
