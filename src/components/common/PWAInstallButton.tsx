'use client';

import { useEffect, useState } from 'react';
import { pwaManager } from '@/lib/pwaManager';

/**
 * PWA Install Button Component
 * Shows an install button when the PWA can be installed
 */
export default function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalledPWA, setIsInstalledPWA] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check initial states
    setCanInstall(pwaManager.canInstall());
    setIsInstalledPWA(pwaManager.isInstalledPWA());

    // Listen for install prompt availability
    const handleInstallAvailable = () => {
      setCanInstall(true);
    };

    // Listen for successful installation
    const handleInstalled = () => {
      setCanInstall(false);
      setIsInstalledPWA(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await pwaManager.installApp();
    setIsInstalling(false);

    if (success) {
      setCanInstall(false);
      setIsInstalledPWA(true);
    }
  };

  // Don't show button if already installed or can't install
  if (isInstalledPWA || !canInstall) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title="Install LifeBalanceOS as an app on your device"
    >
      {isInstalling ? 'Installing...' : '⬇️ Install App'}
    </button>
  );
}
