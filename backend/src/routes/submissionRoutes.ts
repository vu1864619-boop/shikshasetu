import { Router, Request, Response } from 'express';
import { dbManager } from '../db/database.js';
import { authenticate } from '../middleware/authenticate.js';
import crypto from 'node:crypto';
import { logAuditEvent } from '../middleware/auditLog.js';

const router = Router();

router.use(authenticate);

/**
 * Submit answers for a project activity
 * Handles idempotency keys for offline duplicate prevention.
 */
router.post('/', (req: Request, res: Response): void => {
  const {
    project_id,
    activity_id,
    day_number,
    student_id,
    class_id,
    submission_type,
    group_name,
    answers,
    client_idempotency_key
  } = req.body;

  const actor = req.user!;

  if (!project_id || !activity_id || !day_number || !class_id || !answers) {
    res.status(400).json({ error: 'BadRequest', message: 'Missing required submission fields.' });
    return;
  }

  // Determine target student ID
  let targetStudentId = student_id;
  if (actor.role === 'student') {
    targetStudentId = actor.userId; // Students can NEVER submit under another student's ID
  } else if (!targetStudentId) {
    res.status(400).json({ error: 'BadRequest', message: 'Target student_id is required when recorded by teacher.' });
    return;
  }

  // Check idempotency key to prevent duplicates during sync retries
  if (client_idempotency_key) {
    const existing = dbManager.queryOne<any>(
      `SELECT * FROM submissions WHERE client_idempotency_key = ?`,
      [client_idempotency_key]
    );

    if (existing) {
      // Return existing record idempotently
      res.status(200).json({
        success: true,
        submissionId: existing.id,
        isDuplicate: true,
        message: 'Submission already recorded (idempotent duplicate handled).',
        submittedAt: existing.submitted_at
      });
      return;
    }
  }

  // Verify class exists and matches school
  const cls = dbManager.queryOne(`SELECT * FROM classes WHERE id = ?`, [class_id]);
  if (!cls) {
    res.status(404).json({ error: 'NotFound', message: 'Class not found.' });
    return;
  }

  if (actor.role !== 'platform_admin' && cls.school_id !== actor.schoolId) {
    res.status(403).json({ error: 'Forbidden', message: 'Cross-school submission denied.' });
    return;
  }

  const submissionId = 'sub-' + crypto.randomUUID();
  const answersJson = typeof answers === 'string' ? answers : JSON.stringify(answers);
  const type = submission_type || (actor.role === 'teacher' ? 'paper_recorded_by_teacher' : 'individual');

  dbManager.run(
    `INSERT INTO submissions (id, project_id, activity_id, day_number, student_id, class_id, submission_type, group_name, answers_json, submitted_at, sync_status, client_idempotency_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'synced', ?)`,
    [
      submissionId,
      project_id,
      activity_id,
      day_number,
      targetStudentId,
      class_id,
      type,
      group_name || null,
      answersJson,
      client_idempotency_key || ('auto-' + crypto.randomUUID())
    ]
  );

  res.status(201).json({
    success: true,
    submissionId,
    isDuplicate: false,
    message: 'Submission successfully recorded on server.',
    submittedAt: new Date().toISOString()
  });
});

/**
 * List submissions with role-based filtering:
 * Students can only view their own submissions.
 * Teachers can view submissions for classes in their school.
 */
router.get('/', (req: Request, res: Response): void => {
  const actor = req.user!;
  const { class_id, project_id, day_number, student_id } = req.query;

  let query = `
    SELECT s.*, 
           u.name as student_name, 
           u.student_id_code,
           c.name as class_name,
           p.title_en as project_title_en,
           p.title_hi as project_title_hi
    FROM submissions s
    JOIN users u ON s.student_id = u.id
    JOIN classes c ON s.class_id = c.id
    JOIN projects p ON s.project_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (actor.role === 'student') {
    // Privacy enforcement: Students can ONLY view their own submissions
    query += ` AND s.student_id = ?`;
    params.push(actor.userId);
  } else {
    // Staff access: enforce same school
    if (actor.role !== 'platform_admin') {
      query += ` AND c.school_id = ?`;
      params.push(actor.schoolId);
    }
    if (student_id) {
      query += ` AND s.student_id = ?`;
      params.push(student_id);
    }
  }

  if (class_id) {
    query += ` AND s.class_id = ?`;
    params.push(class_id);
  }
  if (project_id) {
    query += ` AND s.project_id = ?`;
    params.push(project_id);
  }
  if (day_number) {
    query += ` AND s.day_number = ?`;
    params.push(day_number);
  }

  query += ` ORDER BY s.submitted_at DESC`;

  const rows = dbManager.query(query, params);
  const submissions = rows.map(r => ({
    ...r,
    answers: JSON.parse(r.answers_json || '{}')
  }));

  res.json({ submissions });
});

/**
 * Get individual submission details with assessment evaluations
 */
router.get('/:submissionId', (req: Request, res: Response): void => {
  const { submissionId } = req.params;
  const actor = req.user!;

  const sub = dbManager.queryOne<any>(
    `SELECT s.*, u.name as student_name, u.student_id_code, c.name as class_name, c.school_id
     FROM submissions s
     JOIN users u ON s.student_id = u.id
     JOIN classes c ON s.class_id = c.id
     WHERE s.id = ?`,
    [submissionId]
  );

  if (!sub) {
    res.status(404).json({ error: 'NotFound', message: 'Submission not found.' });
    return;
  }

  // Privacy: Student can only view their own
  if (actor.role === 'student' && sub.student_id !== actor.userId) {
    res.status(403).json({ error: 'Forbidden', message: 'Privacy violation: Cannot view other students submissions.' });
    return;
  }

  // Cross-school check
  if (actor.role !== 'platform_admin' && sub.school_id !== actor.schoolId) {
    res.status(403).json({ error: 'Forbidden', message: 'Cross-school access denied.' });
    return;
  }

  const assessments = dbManager.query(
    `SELECT a.*, lo.code as objective_code, lo.title_en as objective_title_en, lo.title_hi as objective_title_hi,
            t.name as evaluator_name
     FROM assessments a
     JOIN learning_objectives lo ON a.objective_id = lo.id
     JOIN users t ON a.evaluator_teacher_id = t.id
     WHERE a.submission_id = ?`,
    [submissionId]
  );

  res.json({
    submission: {
      ...sub,
      answers: JSON.parse(sub.answers_json || '{}')
    },
    assessments
  });
});

export default router;
