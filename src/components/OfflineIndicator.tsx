import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-2xl bg-neutral-900/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg border border-neutral-700/60 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span className="text-[11px] text-neutral-200">Offline Mode · Flow is running locally</span>
    </div>
  );
};
