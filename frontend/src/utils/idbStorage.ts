const DB_NAME = 'ShikshaSetuOfflineDB';
const DB_VERSION = 1;

export interface OfflineSubmissionRecord {
  client_idempotency_key: string;
  project_id: string;
  activity_id: string;
  day_number: number;
  class_id: string;
  answers: Record<string, any>;
  client_timestamp: string;
  sync_status: 'pending' | 'synced';
  server_submission_id?: string;
  server_timestamp?: string;
}

class IDBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result as IDBDatabase;
          if (!db.objectStoreNames.contains('offline_submissions')) {
            const store = db.createObjectStore('offline_submissions', { keyPath: 'client_idempotency_key' });
            store.createIndex('sync_status', 'sync_status', { unique: false });
          }
          if (!db.objectStoreNames.contains('cached_projects')) {
            db.createObjectStore('cached_projects', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('drafts')) {
            db.createObjectStore('drafts', { keyPath: 'activity_id' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  async saveOfflineSubmission(record: OfflineSubmissionRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_submissions', 'readwrite');
      const store = tx.objectStore('offline_submissions');
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getPendingSubmissions(): Promise<OfflineSubmissionRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_submissions', 'readonly');
      const store = tx.objectStore('offline_submissions');
      const index = store.index('sync_status');
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSubmissions(): Promise<OfflineSubmissionRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_submissions', 'readonly');
      const store = tx.objectStore('offline_submissions');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async markSubmissionSynced(client_idempotency_key: string, serverId: string, timestamp: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_submissions', 'readwrite');
      const store = tx.objectStore('offline_submissions');
      const getReq = store.get(client_idempotency_key);
      getReq.onsuccess = () => {
        if (getReq.result) {
          const updated = {
            ...getReq.result,
            sync_status: 'synced',
            server_submission_id: serverId,
            server_timestamp: timestamp
          };
          store.put(updated);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async saveDraft(activityId: string, draftData: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', 'readwrite');
      const store = tx.objectStore('drafts');
      store.put({ activity_id: activityId, data: draftData, updated_at: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getDraft(activityId: string): Promise<any | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', 'readonly');
      const store = tx.objectStore('drafts');
      const req = store.get(activityId);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => reject(req.error);
    });
  }

  async clearDraft(activityId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', 'readwrite');
      const store = tx.objectStore('drafts');
      store.delete(activityId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Safe sign-out: cleans up temporary student drafts from shared school device
   */
  async clearStudentTemporaryData(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['drafts'], 'readwrite');
      tx.objectStore('drafts').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const idbStorage = new IDBStorage();
