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

describe('Project Submission & Rubric Assessment Engine Tests', () => {
  let teacherToken: string;
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

    const t = await makeRequest('/api/auth/staff-login', {
      method: 'POST',
      body: { email: 'anita.sharma@shikshasetu.org', pin: '123456' }
    });
    teacherToken = t.body.token;

    const s = await makeRequest('/api/auth/student-login', {
      method: 'POST',
      body: { student_id_code: 'STU-1002', pin: '4321' } // Priya Singh
    });
    studentToken = s.body.token;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  test('Student completes Day 1 Water Conservation worksheet', async () => {
    const res = await makeRequest('/api/submissions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        project_id: 'proj-water-01',
        activity_id: 'act-water-d1',
        day_number: 1,
        class_id: 'cls-rampur-6a',
        client_idempotency_key: 'idem-priya-d1',
        answers: {
          water_uses: 'पीने और पेड़-पौधों में डालने के लिए (Drinking and watering plants)',
          observed_waste: 'स्कूल के वॉशबेसिन का नल हल्का टपक रहा था।',
          initial_methods: 'नल की वॉशर बदलना और इस्तेमाल के बाद पूरा बंद करना।'
        }
      }
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.isDuplicate, false);
    assert.ok(res.body.submissionId);
  });

  test('Duplicate submission with same idempotency key is safely ignored (Idempotency check)', async () => {
    const res = await makeRequest('/api/submissions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        project_id: 'proj-water-01',
        activity_id: 'act-water-d1',
        day_number: 1,
        class_id: 'cls-rampur-6a',
        client_idempotency_key: 'idem-priya-d1', // SAME KEY
        answers: { water_uses: 'Duplicate request content' }
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.isDuplicate, true);
  });

  test('Teacher evaluates submission with 3-tier rubric and constructive comment', async () => {
    // List Priya's submissions to get submission ID
    const listRes = await makeRequest('/api/submissions?student_id=usr-student-02', {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(listRes.status, 200);
    const sub = listRes.body.submissions[0];
    assert.ok(sub);

    // Assess LO-WATER-01 (achieved) and LO-WATER-02 (developing)
    const assessRes = await makeRequest('/api/assessments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        submission_id: sub.id,
        evaluations: [
          {
            objective_id: 'lo-water-01',
            rubric: 'achieved',
            constructive_comment: 'पौधों में पानी के उपयोग का बहुत व्यावहारिक उदाहरण दिया। (Great practical example!)'
          },
          {
            objective_id: 'lo-water-02',
            rubric: 'developing',
            constructive_comment: 'रिसाव के कारणों का थोड़ा और विस्तार से वर्णन करें। (Expand more on leak causes.)'
          }
        ]
      }
    });

    assert.strictEqual(assessRes.status, 200);
    assert.strictEqual(assessRes.body.success, true);
    assert.strictEqual(assessRes.body.assessments.length, 2);
    assert.ok(assessRes.body.transparent_recommendation);
  });

  test('Class summary report clearly distinguishes missing work from poor performance', async () => {
    const reportRes = await makeRequest('/api/assessments/class-summary/cls-rampur-6a', {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });

    assert.strictEqual(reportRes.status, 200);
    assert.ok(reportRes.body.aggregate.total_enrolled >= 3);
    assert.ok(reportRes.body.students.length >= 3);

    const priyaReport = reportRes.body.students.find((s: any) => s.student_id_code === 'STU-1002');
    assert.ok(priyaReport);
    assert.deepStrictEqual(priyaReport.submitted_days, [1]);
    // Missing days 2 and 3 are clearly tracked!
    assert.deepStrictEqual(priyaReport.missing_days, [2, 3]);
  });

  test('Student views personal progress and teacher feedback', async () => {
    const progressRes = await makeRequest('/api/assessments/my-progress', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    assert.strictEqual(progressRes.status, 200);
    assert.strictEqual(progressRes.body.student.student_id_code, 'STU-1002');
    assert.ok(progressRes.body.submissions.length > 0);
    assert.ok(progressRes.body.assessments.length > 0);
    assert.strictEqual(progressRes.body.assessments[0].rubric, 'achieved');
  });
});
