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

describe('Role-Based Access Control & Cross-School Isolation Tests', () => {
  let teacherSchool1Token: string;
  let teacherSchool2Token: string;
  let student1Token: string;
  let student2Token: string;

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

    // Obtain tokens
    const t1 = await makeRequest('/api/auth/staff-login', {
      method: 'POST',
      body: { email: 'anita.sharma@shikshasetu.org', pin: '123456' }
    });
    teacherSchool1Token = t1.body.token;

    const t2 = await makeRequest('/api/auth/staff-login', {
      method: 'POST',
      body: { email: 'vikram.singh@shikshasetu.org', pin: '123456' }
    });
    teacherSchool2Token = t2.body.token;

    const s1 = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: { student_id_code: 'STU-1001', pin: '4321' }
    });
    student1Token = s1.body.token;

    const s2 = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: { student_id_code: 'STU-1002', pin: '4321' }
    });
    student2Token = s2.body.token;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  test('Cross-school isolation: Teacher in School 2 cannot view School 1 class roster', async () => {
    // Class cls-rampur-6a belongs to School 1
    const res = await makeRequest('/api/classes/cls-rampur-6a', {
      headers: { Authorization: `Bearer ${teacherSchool2Token}` }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, 'Forbidden');
    assert.ok(res.body.message.includes('outside your school'));
  });

  test('Cross-school isolation: Teacher in School 2 cannot reset PIN for student in School 1', async () => {
    // usr-student-01 belongs to School 1
    const res = await makeRequest('/api/auth/reset-pin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherSchool2Token}` },
      body: {
        student_id: 'usr-student-01',
        new_pin: '9999'
      }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, 'Forbidden');
    assert.ok(res.body.message.includes('Cross-school violation'));
  });

  test('Authorized Teacher in School 1 CAN view School 1 class and students', async () => {
    const res = await makeRequest('/api/classes/cls-rampur-6a', {
      headers: { Authorization: `Bearer ${teacherSchool1Token}` }
    });

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.students));
    assert.ok(res.body.students.length > 0);
  });

  test('Student record privacy: Student 1 cannot view Student 2 private submissions', async () => {
    // Student 1 submits Day 1 answers
    const subRes = await makeRequest('/api/submissions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: {
        project_id: 'proj-water-01',
        activity_id: 'act-water-d1',
        day_number: 1,
        class_id: 'cls-rampur-6a',
        answers: { note: 'Aarav Kumar private notes' }
      }
    });
    assert.strictEqual(subRes.status, 201);
    const subId = subRes.body.submissionId;

    // Student 2 attempts to fetch Student 1's submission directly
    const accessRes = await makeRequest(`/api/submissions/${subId}`, {
      headers: { Authorization: `Bearer ${student2Token}` }
    });

    assert.strictEqual(accessRes.status, 403);
    assert.strictEqual(accessRes.body.error, 'Forbidden');
    assert.ok(accessRes.body.message.includes('Privacy violation'));
  });

  test('Student cannot create a new class (Role permission check)', async () => {
    const res = await makeRequest('/api/classes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: {
        name: 'Unauthorized Student Class',
        grade_level: 6,
        section: 'Z'
      }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, 'Forbidden');
  });
});
