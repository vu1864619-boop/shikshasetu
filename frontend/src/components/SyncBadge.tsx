import React from 'react';
import { useOfflineSync } from '../context/OfflineSyncContext.js';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SyncBadge: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, syncNow } = useOfflineSync();

  return (
    <div className="flex items-center gap-2">
      {/* Network indicator */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isOnline
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-800 border border-amber-300'
        }`}
        title={isOnline ? 'इंटरनेट से जुड़ा हुआ (Online)' : 'ऑफ़लाइन मोड (Offline Mode)'}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>ऑनलाइन (Online)</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-700" />
            <span>ऑफ़लाइन (Offline)</span>
          </>
        )}
      </div>

      {/* Pending Sync badge & manual sync button */}
      {pendingCount > 0 ? (
        <button
          onClick={() => syncNow()}
          disabled={!isOnline || isSyncing}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isOnline
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm cursor-pointer'
              : 'bg-slate-200 text-slate-600 cursor-not-allowed'
          }`}
          title="लंबित डेटा सर्वर पर सिंक करने के लिए क्लिक करें"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {isSyncing ? 'सिंक हो रहा है...' : `${pendingCount} लंबित सिंक`}
          </span>
        </button>
      ) : lastSyncedAt ? (
        <div
          className="hidden md:flex items-center gap-1 text-xs text-slate-500"
          title={`अंतिम सिंक समय: ${lastSyncedAt}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>सिंक पूर्ण ({lastSyncedAt})</span>
        </div>
      ) : null}
    </div>
  );
};
