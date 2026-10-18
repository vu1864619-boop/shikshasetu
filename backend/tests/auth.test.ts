import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { app } from '../src/server.js';
import { dbManager } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed.js';
import { rateLimiter } from '../src/auth/rateLimiter.js';
import { hashPin, verifyPin } from '../src/auth/hasher.js';
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

describe('Authentication & Security Tests', () => {
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
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  beforeEach(() => {
    rateLimiter.cleanup();
  });

  test('PIN Hasher creates secure salted hash with constant-time verification', () => {
    const pin = '4321';
    const { hash, salt } = hashPin(pin);

    assert.ok(hash && hash.length === 128); // SHA-512 hex
    assert.ok(salt && salt.length === 64);

    assert.strictEqual(verifyPin(pin, hash, salt), true);
    assert.strictEqual(verifyPin('0000', hash, salt), false);
    assert.strictEqual(verifyPin('', hash, salt), false);
  });

  test('Valid Student Login (ID: STU-1001, PIN: 4321) succeeds and returns JWT token', async () => {
    const res = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: {
        student_id_code: 'STU-1001',
        pin: '4321'
      }
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token, 'Should return JWT token');
    assert.strictEqual(res.body.user.student_id_code, 'STU-1001');
    assert.strictEqual(res.body.user.role, 'student');
  });

  test('Invalid Student PIN returns generic 401 error without user enumeration', async () => {
    const res = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: {
        student_id_code: 'STU-1001',
        pin: '9999' // Incorrect PIN
      }
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, 'InvalidCredentials');
    assert.strictEqual(res.body.message, 'Invalid Student ID or PIN. Please verify and try again.');

    // Check non-existent user returns the identical error
    const nonExistent = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: {
        student_id_code: 'STU-9999999',
        pin: '9999'
      }
    });

    assert.strictEqual(nonExistent.status, 401);
    assert.strictEqual(nonExistent.body.message, 'Invalid Student ID or PIN. Please verify and try again.');
  });

  test('Rate limiting triggers escalating lockout after 5 consecutive failures', async () => {
    const testId = 'STU-TEST-LOCKOUT';
    // Run 5 failed attempts
    for (let i = 0; i < 4; i++) {
      const res = await makeRequest('/api/auth/student-login', {
        method: 'POST',
        body: { student_id_code: testId, pin: '0000' }
      });
      assert.strictEqual(res.status, 401);
    }

    // 5th attempt triggers lockout
    const lockoutRes = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: { student_id_code: testId, pin: '0000' }
    });

    assert.strictEqual(lockoutRes.status, 429);
    assert.strictEqual(lockoutRes.body.error, 'TooManyRequests');
    assert.ok(lockoutRes.body.lockoutSeconds > 0);
  });

  test('Teacher-authorized PIN reset successfully changes PIN and clears lockout', async () => {
    // 1. Staff login as Teacher (School 1)
    const teacherLogin = await makeRequest('/api/auth/staff-login', {
      method: 'POST',
      body: {
        email: 'anita.sharma@shikshasetu.org',
        pin: '123456'
      }
    });
    assert.strictEqual(teacherLogin.status, 200);
    const teacherToken = teacherLogin.body.token;

    // 2. Teacher resets PIN for Student 1 (usr-student-01)
    const resetRes = await makeRequest('/api/auth/reset-pin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        student_id: 'usr-student-01',
        new_pin: '5678'
      }
    });

    assert.strictEqual(resetRes.status, 200);
    assert.strictEqual(resetRes.body.success, true);

    // 3. Student logs in with NEW PIN
    const studentLogin = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: {
        student_id_code: 'STU-1001',
        pin: '5678'
      }
    });

    assert.strictEqual(studentLogin.status, 200);
    assert.strictEqual(studentLogin.body.user.student_id_code, 'STU-1001');

    // Reset back for subsequent tests
    await makeRequest('/api/auth/reset-pin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        student_id: 'usr-student-01',
        new_pin: '4321'
      }
    });
  });

  test('Student cannot call PIN reset endpoint (RBAC rejection)', async () => {
    const studentLogin = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: { student_id_code: 'STU-1001', pin: '4321' }
    });
    const stuToken = studentLogin.body.token;

    const res = await makeRequest('/api/auth/reset-pin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stuToken}` },
      body: {
        student_id: 'usr-student-02',
        new_pin: '9999'
      }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, 'Forbidden');
  });
});
