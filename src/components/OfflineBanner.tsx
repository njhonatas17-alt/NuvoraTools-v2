import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-600 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-between shadow-md z-50 sticky top-0"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>{t('pwa.offlineMode', 'You are currently offline. Local tools are still fully functional!')}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-amber-700 rounded-md transition-colors"
        aria-label="Dismiss offline banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
