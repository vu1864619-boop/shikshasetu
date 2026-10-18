import { Router, Request, Response } from 'express';
import { dbManager } from '../db/database.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRoles } from '../middleware/rbac.js';
import crypto from 'node:crypto';

const router = Router();

router.use(authenticate);

/**
 * Audit logs query
 * Platform admin: all logs. School admin: only their school logs.
 */
router.get('/audit-logs', requireRoles('school_admin', 'platform_admin'), (req: Request, res: Response): void => {
  const actor = req.user!;
  let query = `
    SELECT al.*, u.name as actor_name
    FROM audit_logs al
    LEFT JOIN users u ON al.actor_user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (actor.role !== 'platform_admin') {
    query += ` AND al.school_id = ?`;
    params.push(actor.schoolId);
  }

  query += ` ORDER BY al.created_at DESC LIMIT 100`;

  const logs = dbManager.query(query, params);
  res.json({ logs });
});

/**
 * School stats overview
 */
router.get('/school-stats', requireRoles('school_admin', 'platform_admin'), (req: Request, res: Response): void => {
  const actor = req.user!;
  const targetSchoolId = req.query.school_id as string || actor.schoolId;

  if (actor.role !== 'platform_admin' && targetSchoolId !== actor.schoolId) {
    res.status(403).json({ error: 'Forbidden', message: 'Cannot access stats of another school.' });
    return;
  }

  const school = dbManager.queryOne(`SELECT * FROM schools WHERE id = ?`, [targetSchoolId]);
  if (!school) {
    res.status(404).json({ error: 'NotFound', message: 'School not found.' });
    return;
  }

  const totalTeachers = dbManager.queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'teacher'`,
    [targetSchoolId]
  )?.count || 0;

  const totalStudents = dbManager.queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'student'`,
    [targetSchoolId]
  )?.count || 0;

  const totalClasses = dbManager.queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM classes WHERE school_id = ?`,
    [targetSchoolId]
  )?.count || 0;

  const totalSubmissions = dbManager.queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM submissions s JOIN classes c ON s.class_id = c.id WHERE c.school_id = ?`,
    [targetSchoolId]
  )?.count || 0;

  res.json({
    school,
    stats: {
      totalTeachers,
      totalStudents,
      totalClasses,
      totalSubmissions
    }
  });
});

/**
 * List all schools (Platform Admin or public select for student login)
 */
router.get('/schools', (req: Request, res: Response): void => {
  const schools = dbManager.query(`SELECT id, name, udise_code, district, state FROM schools WHERE is_active = 1`);
  res.json({ schools });
});

export default router;
