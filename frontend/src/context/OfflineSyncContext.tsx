import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { idbStorage, OfflineSubmissionRecord } from '../utils/idbStorage.js';
import { apiRequest } from '../utils/api.js';
import { useAuth } from './AuthContext.js';
import { generateUUID } from '../utils/safeUUID.js';

interface OfflineSyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  syncNow: () => Promise<{ success: boolean; syncedCount: number; message: string }>;
  refreshPendingCount: () => Promise<number>;
  saveSubmissionOffline: (data: {
    project_id: string;
    activity_id: string;
    day_number: number;
    class_id: string;
    answers: Record<string, any>;
  }) => Promise<{ idempotencyKey: string; savedOffline: boolean }>;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();

  const refreshPendingCount = useCallback(async (): Promise<number> => {
    try {
      const pending = await idbStorage.getPendingSubmissions();
      setPendingCount(pending.length);
      return pending.length;
    } catch {
      return 0;
    }
  }, []);

  const syncNow = useCallback(async (): Promise<{ success: boolean; syncedCount: number; message: string }> => {
    if (!navigator.onLine) {
      return { success: false, syncedCount: 0, message: 'उपकरण ऑफ़लाइन है। नेटवर्क उपलब्ध होने पर पुनः प्रयास करें।' };
    }

    if (!token) {
      return { success: false, syncedCount: 0, message: 'कृपया सिंक करने से पहले साइन इन करें।' };
    }

    setIsSyncing(true);
    try {
      const pendingItems = await idbStorage.getPendingSubmissions();
      if (pendingItems.length === 0) {
        setIsSyncing(false);
        return { success: true, syncedCount: 0, message: 'कोई लंबित कार्यपत्रक नहीं है।' };
      }

      // Prepare batch payload
      const batchPayload = {
        client_device_id: 'web-pwa-' + (localStorage.getItem('shikshasetu_device_id') || 'gen'),
        items: pendingItems.map(item => ({
          client_idempotency_key: item.client_idempotency_key,
          type: 'submission',
          client_timestamp: item.client_timestamp,
          data: {
            project_id: item.project_id,
            activity_id: item.activity_id,
            day_number: item.day_number,
            class_id: item.class_id,
            answers: item.answers
          }
        }))
      };

      const res = await apiRequest('/sync/batch', 'POST', batchPayload, token);

      if (res.ok && res.data && res.data.results) {
        let confirmedCount = 0;
        for (const r of res.data.results) {
          if (r.status === 'synced' || r.status === 'duplicate_acknowledged' || r.status === 'conflict_resolved') {
            await idbStorage.markSubmissionSynced(
              r.client_idempotency_key,
              r.server_submission_id || 'server-ack',
              r.server_timestamp
            );
            confirmedCount++;
          }
        }

        const now = new Date().toLocaleTimeString();
        setLastSyncedAt(now);
        await refreshPendingCount();
        setIsSyncing(false);
        return {
          success: true,
          syncedCount: confirmedCount,
          message: `${confirmedCount} कार्यपत्रक सफलतापूर्वक सर्वर पर सिंक हुए।`
        };
      } else {
        setIsSyncing(false);
        return { success: false, syncedCount: 0, message: res.message || 'सिंक विफल रहा।' };
      }
    } catch (err: any) {
      setIsSyncing(false);
      return { success: false, syncedCount: 0, message: 'सिंक के दौरान त्रुटि आई।' };
    }
  }, [token, refreshPendingCount]);

  // Save submission locally first (Offline-First Paradigm)
  const saveSubmissionOffline = async (data: {
    project_id: string;
    activity_id: string;
    day_number: number;
    class_id: string;
    answers: Record<string, any>;
  }) => {
    const idempotencyKey = 'offline-sub-' + generateUUID();
    const record: OfflineSubmissionRecord = {
      client_idempotency_key: idempotencyKey,
      project_id: data.project_id,
      activity_id: data.activity_id,
      day_number: data.day_number,
      class_id: data.class_id,
      answers: data.answers,
      client_timestamp: new Date().toISOString(),
      sync_status: 'pending'
    };

    await idbStorage.saveOfflineSubmission(record);
    await refreshPendingCount();

    // If online, immediately attempt background sync
    if (navigator.onLine && token) {
      syncNow().catch(() => {});
    }

    return { idempotencyKey, savedOffline: true };
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-synchronize when reconnected
      if (isAuthenticated && token) {
        syncNow();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial count
    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, token, syncNow, refreshPendingCount]);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingCount,
        lastSyncedAt,
        syncNow,
        refreshPendingCount,
        saveSubmissionOffline
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = (): OfflineSyncContextType => {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
};
