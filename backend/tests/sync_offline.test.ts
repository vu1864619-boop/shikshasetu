import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { app } from '../src/server.js';
import { dbManager } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed.js';
import http from 'node:http';

let server: http.Server;
let baseUrl = '';

function makeRequest(path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode || 500, body: parsed });
          } catch {
            resolve({ status: res.statusCode || 500, body: rawData });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

describe('Offline Synchronization & Conflict Engine Tests', () => {
  let studentToken: string;

  before(async () => {
    dbManager.init(':memory:');
    seedDatabase();

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    const s = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: { student_id_code: 'STU-1003', pin: '4321' } // Rohan Verma
    });
    studentToken = s.body.token;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  test('Batch sync processes queued offline submissions and confirms with server timestamp', async () => {
    const batchPayload = {
      client_device_id: 'tablet-gov-school-042',
      items: [
        {
          client_idempotency_key: 'offline-rohan-d1-uuid-001',
          type: 'submission',
          client_timestamp: new Date().toISOString(),
          data: {
            project_id: 'proj-water-01',
            activity_id: 'act-water-d1',
            day_number: 1,
            class_id: 'cls-rampur-6a',
            answers: {
              water_uses: 'हाथ धोने और खाना बनाने के लिए',
              observed_waste: 'स्कूल में पानी की टंकी ओवरफ्लो हो रही थी।',
              initial_methods: 'टंकी में फ्लोट वाल्व लगाना।'
            }
          }
        },
        {
          client_idempotency_key: 'offline-rohan-d2-uuid-002',
          type: 'submission',
          client_timestamp: new Date().toISOString(),
          data: {
            project_id: 'proj-water-01',
            activity_id: 'act-water-d2',
            day_number: 2,
            class_id: 'cls-rampur-6a',
            answers: {
              table_data: { leaking_tap: 3, running_tap: 5, overflow: 2 },
              highest_issue: 'Tap left running',
              data_explanation: 'खुला नल सबसे बड़ी समस्या है क्योंकि लोग अक्सर बंद करना भूल जाते हैं।'
            }
          }
        }
      ]
    };

    const res = await makeRequest('/api/sync/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: batchPayload
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.processed_count, 2);
    assert.strictEqual(res.body.results[0].status, 'synced');
    assert.strictEqual(res.body.results[1].status, 'synced');
    assert.ok(res.body.results[0].server_timestamp);
  });

  test('Re-syncing the same offline items returns duplicate_acknowledged without creating redundant records', async () => {
    const duplicatePayload = {
      client_device_id: 'tablet-gov-school-042',
      items: [
        {
          client_idempotency_key: 'offline-rohan-d1-uuid-001', // Already synced in previous test
          type: 'submission',
          client_timestamp: new Date().toISOString(),
          data: {
            project_id: 'proj-water-01',
            activity_id: 'act-water-d1',
            day_number: 1,
            class_id: 'cls-rampur-6a',
            answers: { water_uses: 'Duplicate content' }
          }
        }
      ]
    };

    const res = await makeRequest('/api/sync/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: duplicatePayload
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.results[0].status, 'duplicate_acknowledged');
  });

  test('Multi-device conflict: newer client submission updates existing server record', async () => {
    // Newer timestamp (future time by 10 minutes)
    const newerTime = new Date(Date.now() + 600000).toISOString();

    const conflictPayload = {
      client_device_id: 'phone-home-099',
      items: [
        {
          client_idempotency_key: 'offline-rohan-d2-revised',
          type: 'submission',
          client_timestamp: newerTime,
          data: {
            project_id: 'proj-water-01',
            activity_id: 'act-water-d2',
            day_number: 2, // Day 2 was submitted earlier
            class_id: 'cls-rampur-6a',
            answers: {
              table_data: { leaking_tap: 4, running_tap: 6, overflow: 2 },
              highest_issue: 'Tap left running',
              data_explanation: 'संशोधित अवलोकन: खुला नल अब भी सबसे बड़ी समस्या है।'
            }
          }
        }
      ]
    };

    const res = await makeRequest('/api/sync/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: conflictPayload
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.results[0].status, 'conflict_resolved');
    assert.ok(res.body.results[0].message.includes('Newer client update merged'));
  });
});
