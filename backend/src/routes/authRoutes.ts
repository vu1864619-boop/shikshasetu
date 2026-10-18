import { Router, Request, Response } from 'express';
import { dbManager } from '../db/database.js';
import { verifyPin, hashPin } from '../auth/hasher.js';
import { rateLimiter } from '../auth/rateLimiter.js';
import { signToken } from '../auth/tokens.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRoles } from '../middleware/rbac.js';
import { logAuditEvent } from '../middleware/auditLog.js';
import { User } from '../types.js';

const router = Router();

/**
 * Student Login: Unique Student ID + Student PIN
 * Prevents user enumeration by returning identical generic error messages.
 * Enforces rate limiting and escalating lockout.
 */
router.post('/student-login', (req: Request, res: Response): void => {
  const { student_id_code, pin, school_id } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const trackingKey = `stu:${student_id_code || 'unknown'}:${clientIp}`;

  if (!student_id_code || !pin) {
    res.status(400).json({
      error: 'BadRequest',
      message: 'Student ID and PIN are required.'
    });
    return;
  }

  // Check rate limit & lockout
  const lockStatus = rateLimiter.isLocked(trackingKey);
  if (lockStatus.locked) {
    res.status(429).json({
      error: 'TooManyRequests',
      message: `Account temporarily locked due to repeated failed attempts. Please try again in ${Math.ceil(lockStatus.remainingSeconds / 60)} minutes, or ask your teacher to reset your PIN.`,
      lockoutSeconds: lockStatus.remainingSeconds
    });
    return;
  }

  // Find student (if school_id provided, scope by school; otherwise search across active schools)
  let user: User | null = null;
  if (school_id) {
    user = dbManager.queryOne<User>(
      `SELECT * FROM users WHERE student_id_code = ? AND school_id = ? AND role = 'student'`,
      [student_id_code.trim().toUpperCase(), school_id]
    );
  } else {
    user = dbManager.queryOne<User>(
      `SELECT * FROM users WHERE student_id_code = ? AND role = 'student'`,
      [student_id_code.trim().toUpperCase()]
    );
  }

  // Constant-time dummy verification if user not found to prevent timing enumeration
  const dummySalt = '00'.repeat(32);
  const dummyHash = '00'.repeat(64);
  const isValid = user
    ? verifyPin(pin.trim(), user.hashed_pin, user.salt)
    : verifyPin(pin.trim(), dummyHash, dummySalt);

  if (!user || !isValid) {
    const failureResult = rateLimiter.recordFailedAttempt(trackingKey);
    logAuditEvent({
      schoolId: user?.school_id,
      actorUserId: user ? user.id : 'unknown',
      actorRole: 'student',
      action: 'FAILED_STUDENT_LOGIN',
      targetResource: 'users',
      ipAddress: clientIp,
      details: { student_id_code, locked: failureResult.locked }
    });

    if (failureResult.locked) {
      res.status(429).json({
        error: 'TooManyRequests',
        message: `Too many failed attempts. Login locked for ${Math.ceil(failureResult.lockoutSeconds / 60)} minutes. Please contact your teacher.`,
        lockoutSeconds: failureResult.lockoutSeconds
      });
      return;
    }

    res.status(401).json({
      error: 'InvalidCredentials',
      message: 'Invalid Student ID or PIN. Please verify and try again.',
      remainingAttempts: failureResult.remainingAttempts
    });
    return;
  }

  // Success: Clear rate limiter
  rateLimiter.reset(trackingKey);

  // Fetch school details
  const school = dbManager.queryOne<{ id: string; name: string }>(
    `SELECT id, name FROM schools WHERE id = ?`,
    [user.school_id]
  );

  // Fetch student class enrollment
  const enrollment = dbManager.queryOne<{ class_id: string; class_name: string }>(
    `SELECT e.class_id, c.name as class_name
     FROM student_enrollments e
     JOIN classes c ON e.class_id = c.id
     WHERE e.student_id = ?`,
    [user.id]
  );

  const token = signToken({
    userId: user.id,
    role: user.role,
    schoolId: user.school_id,
    studentIdCode: user.student_id_code,
    name: user.name
  });

  res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      student_id_code: user.student_id_code,
      school_id: user.school_id,
      school_name: school?.name || '',
      class_id: enrollment?.class_id || null,
      class_name: enrollment?.class_name || null
    }
  });
});

/**
 * Staff Login: Email + PIN/Password for Teachers, School Admins, Platform Admins
 */
router.post('/staff-login', (req: Request, res: Response): void => {
  const { email, pin } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const trackingKey = `staff:${email || 'unknown'}:${clientIp}`;

  if (!email || !pin) {
    res.status(400).json({ error: 'BadRequest', message: 'Email and PIN are required.' });
    return;
  }

  const lockStatus = rateLimiter.isLocked(trackingKey);
  if (lockStatus.locked) {
    res.status(429).json({
      error: 'TooManyRequests',
      message: `Account locked due to repeated failed attempts. Please retry in ${Math.ceil(lockStatus.remainingSeconds / 60)} minutes.`
    });
    return;
  }

  const user = dbManager.queryOne<User>(
    `SELECT * FROM users WHERE email = ? AND role IN ('teacher', 'school_admin', 'platform_admin')`,
    [email.trim().toLowerCase()]
  );

  const isValid = user ? verifyPin(pin.trim(), user.hashed_pin, user.salt) : false;

  if (!user || !isValid) {
    const failureResult = rateLimiter.recordFailedAttempt(trackingKey);
    logAuditEvent({
      schoolId: user?.school_id,
      actorUserId: user ? user.id : 'unknown',
      actorRole: user ? user.role : 'teacher',
      action: 'FAILED_STAFF_LOGIN',
      targetResource: 'users',
      ipAddress: clientIp,
      details: { email, locked: failureResult.locked }
    });

    res.status(401).json({
      error: 'InvalidCredentials',
      message: 'Invalid email or PIN. Please verify your credentials.'
    });
    return;
  }

  rateLimiter.reset(trackingKey);

  const school = dbManager.queryOne<{ id: string; name: string }>(
    `SELECT id, name FROM schools WHERE id = ?`,
    [user.school_id]
  );

  const token = signToken({
    userId: user.id,
    role: user.role,
    schoolId: user.school_id,
    name: user.name
  });

  res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      school_id: user.school_id,
      school_name: school?.name || ''
    }
  });
});

/**
 * Teacher-Authorized PIN Reset
 * Only authorized Teachers and School Admins can reset a student PIN within their school.
 */
router.post('/reset-pin', authenticate, requireRoles('teacher', 'school_admin', 'platform_admin'), (req: Request, res: Response): void => {
  const { student_id, new_pin } = req.body;
  const actor = req.user!;

  if (!student_id || !new_pin) {
    res.status(400).json({ error: 'BadRequest', message: 'Student ID and new PIN are required.' });
    return;
  }

  if (new_pin.length < 4 || new_pin.length > 8 || !/^\d+$/.test(new_pin)) {
    res.status(400).json({ error: 'BadRequest', message: 'PIN must be between 4 and 8 digits.' });
    return;
  }

  // Find target student
  const student = dbManager.queryOne<User>(`SELECT * FROM users WHERE id = ? AND role = 'student'`, [student_id]);
  if (!student) {
    res.status(404).json({ error: 'NotFound', message: 'Student not found.' });
    return;
  }

  // Cross-school security check
  if (actor.role !== 'platform_admin' && student.school_id !== actor.schoolId) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Cross-school violation: You cannot reset PINs for students outside your school.'
    });
    return;
  }

  // Hash new PIN with fresh cryptographic salt
  const { hash, salt } = hashPin(new_pin);

  dbManager.run(
    `UPDATE users SET hashed_pin = ?, salt = ?, is_locked = 0, failed_attempts = 0, lockout_until = NULL, updated_at = datetime('now') WHERE id = ?`,
    [hash, salt, student_id]
  );

  // Clear any existing rate limiting for this student
  if (student.student_id_code) {
    rateLimiter.reset(`stu:${student.student_id_code}:unknown`);
  }

  // Audit log event WITHOUT the PIN value
  logAuditEvent({
    schoolId: student.school_id,
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: 'STUDENT_PIN_RESET',
    targetResource: 'users',
    targetId: student.id,
    details: {
      student_id_code: student.student_id_code,
      student_name: student.name,
      reset_by: actor.name
    }
  });

  res.json({
    success: true,
    message: `PIN successfully reset for student ${student.name} (${student.student_id_code}).`
  });
});

/**
 * Current user profile endpoint
 */
router.get('/me', authenticate, (req: Request, res: Response): void => {
  const user = dbManager.queryOne<User>(
    `SELECT id, role, school_id, student_id_code, name, email, created_at FROM users WHERE id = ?`,
    [req.user!.userId]
  );

  if (!user) {
    res.status(404).json({ error: 'NotFound', message: 'User record not found.' });
    return;
  }

  const school = dbManager.queryOne<{ id: string; name: string; district: string; state: string }>(
    `SELECT id, name, district, state FROM schools WHERE id = ?`,
    [user.school_id]
  );

  res.json({
    user,
    school
  });
});

export default router;
