// PWA utilities for client-side PWA features
// This can be used in your components to provide PWA functionality

interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: PWAInstallPromptEvent | null = null;
  private installPromptShown = false;

  constructor() {
    this.initializeInstallPrompt();
    this.registerNotificationListeners();
  }

  /**
   * Initialize the install prompt handling
   */
  private initializeInstallPrompt() {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as PWAInstallPromptEvent;
      this.onInstallPromptAvailable();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.deferredPrompt = null;
      this.installPromptShown = false;
      this.onAppInstalled();
    });
  }

  /**
   * Register notification-related listeners
   */
  private registerNotificationListeners() {
    if (typeof window === 'undefined') return;

    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;
        if (type === 'SYNC_COMPLETED') {
          this.onSyncCompleted(data);
        }
      });
    }
  }

  /**
   * Check if PWA is installable
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  /**
   * Trigger install prompt
   */
  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the PWA install');
        this.deferredPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error triggering install prompt:', error);
      return false;
    }
  }

  /**
   * Check if running as installed PWA
   */
  isInstalledPWA(): boolean {
    if (typeof window === 'undefined') return false;

    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  /**
   * Check if PWA is running in fullscreen mode
   */
  isFullscreen(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: fullscreen)').matches;
  }

  /**
   * Register for push notifications
   */
  async registerNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = this.urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      );
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      console.log('Subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Error registering notifications:', error);
      return false;
    }
  }

  /**
   * Request background sync
   */
  async requestBackgroundSync(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.log('Background sync not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('sync-data');
      console.log('Background sync registered');
      return true;
    } catch (error) {
      console.error('Error registering background sync:', error);
      return false;
    }
  }

  /**
   * Request periodic background sync
   */
  async requestPeriodicBackgroundSync(tagName: string, minInterval: number): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PeriodicSyncManager' in window)) {
      console.log('Periodic background sync not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const syncManager = (registration as any).periodicSync;
      await syncManager.register(tagName, { minInterval });
      console.log(`Periodic sync registered: ${tagName}`);
      return true;
    } catch (error) {
      console.error('Error registering periodic sync:', error);
      return false;
    }
  }

  /**
   * Share data using Web Share API
   */
  async share(data: ShareData): Promise<boolean> {
    if (!navigator.share) {
      console.log('Web Share API not supported');
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  }

  /**
   * Check if shared target is available
   */
  isShareTargetAvailable(): boolean {
    // This would be true if the app is registered as a share target
    // The check is done through manifest.json configuration
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): any {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Callback when install prompt is available
   */
  private onInstallPromptAvailable() {
    console.log('Install prompt is available');
    // Dispatch custom event or call callback
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    }
  }

  /**
   * Callback when app is installed
   */
  private onAppInstalled() {
    console.log('App has been installed');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    }
  }

  /**
   * Callback when sync is completed
   */
  private onSyncCompleted(data: unknown) {
    console.log('Background sync completed:', data);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pwa-sync-completed', { detail: data })
      );
    }
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();

// Export type for use
export type ShareData = {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
};

export default pwaManager;
