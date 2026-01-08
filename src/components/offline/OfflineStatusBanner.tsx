/**
 * Offline Status Banner
 * 
 * Shows when app is offline.
 * AEZUIR RULE: Do NOT force re-onboarding offline.
 */

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { onConnectivityChange, isOnline } from '@/lib/offlineMode';
import { cn } from '@/lib/utils';

export function OfflineStatusBanner() {
  const [online, setOnline] = useState(isOnline());
  
  useEffect(() => {
    return onConnectivityChange(setOnline);
  }, []);
  
  if (online) return null;
  
  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
      "bg-amber-900/90 border border-amber-700 rounded-lg",
      "px-4 py-2 flex items-center gap-2",
      "animate-in slide-in-from-bottom-2 duration-300"
    )}>
      <WifiOff className="h-4 w-4 text-amber-400" />
      <span className="text-sm text-amber-100">
        Offline mode is active. Some features will return when internet is available.
      </span>
    </div>
  );
}
