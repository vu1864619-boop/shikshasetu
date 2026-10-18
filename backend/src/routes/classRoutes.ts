import { Router, Request, Response } from 'express';
import { dbManager } from '../db/database.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRoles } from '../middleware/rbac.js';
import { hashPin } from '../auth/hasher.js';
import { logAuditEvent } from '../middleware/auditLog.js';
import crypto from 'node:crypto';

const router = Router();

router.use(authenticate);

/**
 * List classes belonging to the authenticated user's school
 */
router.get('/', (req: Request, res: Response): void => {
  const user = req.user!;
  let classes = [];

  if (user.role === 'platform_admin') {
    classes = dbManager.query(`SELECT c.*, s.name as school_name FROM classes c JOIN schools s ON c.school_id = s.id ORDER BY c.created_at DESC`);
  } else if (user.role === 'teacher') {
    // Return classes assigned to teacher or within teacher's school
    classes = dbManager.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM student_enrollments se WHERE se.class_id = c.id) as student_count,
        (SELECT COUNT(*) FROM class_teachers ct WHERE ct.class_id = c.id AND ct.teacher_id = ?) as is_assigned
       FROM classes c
       WHERE c.school_id = ?
       ORDER BY c.grade_level, c.section`,
      [user.userId, user.schoolId]
    );
  } else {
    // School admin or student
    classes = dbManager.query(
      `SELECT c.*, (SELECT COUNT(*) FROM student_enrollments se WHERE se.class_id = c.id) as student_count
       FROM classes c
       WHERE c.school_id = ?
       ORDER BY c.grade_level, c.section`,
      [user.schoolId]
    );
  }

  res.json({ classes });
});

/**
 * Get class details and enrolled students list
 */
router.get('/:classId', (req: Request, res: Response): void => {
  const { classId } = req.params;
  const user = req.user!;

  const cls = dbManager.queryOne(
    `SELECT c.*, s.name as school_name 
     FROM classes c 
     JOIN schools s ON c.school_id = s.id 
     WHERE c.id = ?`,
    [classId]
  );

  if (!cls) {
    res.status(404).json({ error: 'NotFound', message: 'Class not found' });
    return;
  }

  // Cross-school isolation check
  if (user.role !== 'platform_admin' && cls.school_id !== user.schoolId) {
    res.status(403).json({ error: 'Forbidden', message: 'Access denied to classes outside your school.' });
    return;
  }

  const students = dbManager.query(
    `SELECT u.id, u.student_id_code, u.name, se.roll_number, se.enrolled_at,
       (SELECT COUNT(*) FROM submissions sub WHERE sub.student_id = u.id) as total_submissions
     FROM student_enrollments se
     JOIN users u ON se.student_id = u.id
     WHERE se.class_id = ?
     ORDER BY se.roll_number, u.name`,
    [classId]
  );

  res.json({ class: cls, students });
});

/**
 * Create a new class
 */
router.post('/', requireRoles('teacher', 'school_admin', 'platform_admin'), (req: Request, res: Response): void => {
  const { name, grade_level, section, academic_year } = req.body;
  const user = req.user!;

  if (!name) {
    res.status(400).json({ error: 'BadRequest', message: 'Class name is required' });
    return;
  }

  const classId = 'cls-' + crypto.randomUUID().substring(0, 8);
  const joinCode = 'SHIKSHA-' + Math.floor(1000 + Math.random() * 9000);

  dbManager.run(
    `INSERT INTO classes (id, school_id, name, grade_level, section, join_code, academic_year)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [classId, user.schoolId, name, grade_level || 6, section || 'A', joinCode, academic_year || '2026-27']
  );

  // If created by a teacher, automatically assign them
  if (user.role === 'teacher') {
    dbManager.run(
      `INSERT INTO class_teachers (id, class_id, teacher_id) VALUES (?, ?, ?)`,
      ['ct-' + crypto.randomUUID().substring(0, 8), classId, user.userId]
    );
  }

  logAuditEvent({
    schoolId: user.schoolId,
    actorUserId: user.userId,
    actorRole: user.role,
    action: 'CREATE_CLASS',
    targetResource: 'classes',
    targetId: classId,
    details: { name, grade_level, section }
  });

  res.status(201).json({
    success: true,
    classId,
    joinCode,
    message: 'Classroom created successfully.'
  });
});

/**
 * Enroll a student (creates account if new or enrolls existing)
 */
router.post('/:classId/enroll-student', requireRoles('teacher', 'school_admin', 'platform_admin'), (req: Request, res: Response): void => {
  const { classId } = req.params;
  const { name, student_id_code, initial_pin, roll_number } = req.body;
  const user = req.user!;

  if (!name || !student_id_code || !initial_pin) {
    res.status(400).json({ error: 'BadRequest', message: 'Name, Student ID code, and initial PIN are required.' });
    return;
  }

  const cls = dbManager.queryOne(`SELECT * FROM classes WHERE id = ?`, [classId]);
  if (!cls) {
    res.status(404).json({ error: 'NotFound', message: 'Class not found' });
    return;
  }

  // Cross-school check
  if (user.role !== 'platform_admin' && cls.school_id !== user.schoolId) {
    res.status(403).json({ error: 'Forbidden', message: 'Cross-school access denied.' });
    return;
  }

  const cleanId = student_id_code.trim().toUpperCase();

  // Check if student ID code already exists in this school
  const existingUser = dbManager.queryOne<any>(
    `SELECT id FROM users WHERE school_id = ? AND student_id_code = ?`,
    [cls.school_id, cleanId]
  );

  let studentUserId = existingUser?.id;

  if (!studentUserId) {
    // Create new student
    studentUserId = 'usr-stu-' + crypto.randomUUID().substring(0, 8);
    const { hash, salt } = hashPin(initial_pin);

    dbManager.run(
      `INSERT INTO users (id, role, school_id, student_id_code, name, salt, hashed_pin)
       VALUES (?, 'student', ?, ?, ?, ?, ?)`,
      [studentUserId, cls.school_id, cleanId, name.trim(), salt, hash]
    );
  }

  // Check if already enrolled in this class
  const existingEnrollment = dbManager.queryOne(
    `SELECT id FROM student_enrollments WHERE class_id = ? AND student_id = ?`,
    [classId, studentUserId]
  );

  if (existingEnrollment) {
    res.status(400).json({ error: 'BadRequest', message: 'Student is already enrolled in this class.' });
    return;
  }

  const enrollmentId = 'enr-' + crypto.randomUUID().substring(0, 8);
  dbManager.run(
    `INSERT INTO student_enrollments (id, class_id, student_id, roll_number)
     VALUES (?, ?, ?, ?)`,
    [enrollmentId, classId, studentUserId, roll_number || null]
  );

  logAuditEvent({
    schoolId: cls.school_id,
    actorUserId: user.userId,
    actorRole: user.role,
    action: 'ENROLL_STUDENT',
    targetResource: 'student_enrollments',
    targetId: enrollmentId,
    details: { student_id_code: cleanId, name, classId }
  });

  res.status(201).json({
    success: true,
    studentId: studentUserId,
    student_id_code: cleanId,
    name,
    message: 'Student enrolled successfully.'
  });
});

export default router;
