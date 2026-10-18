import { Router, Request, Response } from 'express';
import { dbManager } from '../db/database.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRoles } from '../middleware/rbac.js';
import { logAuditEvent } from '../middleware/auditLog.js';
import crypto from 'node:crypto';

const router = Router();

router.use(authenticate);

/**
 * Record or update learning objective assessment
 * Rubric: 'achieved' | 'developing' | 'needs_support'
 */
router.post('/', requireRoles('teacher', 'school_admin', 'platform_admin'), (req: Request, res: Response): void => {
  const { submission_id, evaluations } = req.body;
  const teacher = req.user!;

  if (!submission_id || !Array.isArray(evaluations) || evaluations.length === 0) {
    res.status(400).json({ error: 'BadRequest', message: 'submission_id and evaluations array are required.' });
    return;
  }

  // Verify submission exists and belongs to teacher's school
  const sub = dbManager.queryOne<any>(
    `SELECT s.*, c.school_id 
     FROM submissions s 
     JOIN classes c ON s.class_id = c.id 
     WHERE s.id = ?`,
    [submission_id]
  );

  if (!sub) {
    res.status(404).json({ error: 'NotFound', message: 'Submission not found.' });
    return;
  }

  if (teacher.role !== 'platform_admin' && sub.school_id !== teacher.schoolId) {
    res.status(403).json({ error: 'Forbidden', message: 'Cross-school access denied.' });
    return;
  }

  const validRubrics = ['achieved', 'developing', 'needs_support'];
  const recordedAssessments = [];

  for (const evalItem of evaluations) {
    const { objective_id, rubric, constructive_comment } = evalItem;

    if (!objective_id || !validRubrics.includes(rubric)) {
      res.status(400).json({
        error: 'BadRequest',
        message: `Invalid evaluation for objective ${objective_id}. Rubric must be 'achieved', 'developing', or 'needs_support'.`
      });
      return;
    }

    const comment = constructive_comment?.trim() || 'कार्य का मूल्यांकन किया गया। (Work evaluated.)';

    // Upsert assessment (insert or replace)
    const existing = dbManager.queryOne(
      `SELECT id FROM assessments WHERE submission_id = ? AND objective_id = ?`,
      [submission_id, objective_id]
    );

    const assessmentId = existing ? existing.id : 'asm-' + crypto.randomUUID();

    if (existing) {
      dbManager.run(
        `UPDATE assessments 
         SET rubric = ?, constructive_comment = ?, evaluated_at = datetime('now'), evaluator_teacher_id = ?
         WHERE id = ?`,
        [rubric, comment, teacher.userId, assessmentId]
      );
    } else {
      dbManager.run(
        `INSERT INTO assessments (id, submission_id, student_id, evaluator_teacher_id, objective_id, rubric, constructive_comment, evaluated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [assessmentId, submission_id, sub.student_id, teacher.userId, objective_id, rubric, comment]
      );
    }

    recordedAssessments.push({ assessmentId, objective_id, rubric });
  }

  logAuditEvent({
    schoolId: sub.school_id,
    actorUserId: teacher.userId,
    actorRole: teacher.role,
    action: 'ASSESS_SUBMISSION',
    targetResource: 'assessments',
    targetId: submission_id,
    details: { evaluated_count: recordedAssessments.length, student_id: sub.student_id }
  });

  // Generate constructive next learning recommendation
  let nextRecommendation = 'विद्यार्थी ने इस परियोजना में सक्रिय भागीदारी की है। (Student actively participated.)';
  const hasNeedsSupport = evaluations.some(e => e.rubric === 'needs_support');
  const hasDeveloping = evaluations.some(e => e.rubric === 'developing');

  if (hasNeedsSupport) {
    nextRecommendation = 'अवधारणा को पुनः सुदृढ़ करने के लिए व्यावहारिक उदाहरणों और समूह चर्चा के साथ अतिरिक्त अभ्यास की सिफारिश की जाती है। (Recommended: Guided practical practice and peer discussion.)';
  } else if (hasDeveloping) {
    nextRecommendation = 'विद्यार्थी सही दिशा में बढ़ रहा है। डेटा की समझ और व्यावहारिक निष्कर्ष निकालने में थोड़ा और मार्गदर्शन लाभदायक होगा। (Recommended: Further guidance on interpreting data trends.)';
  } else {
    nextRecommendation = 'विद्यार्थी ने स्वतंत्र समझ प्रदर्शित की है। अगले स्तर पर सामुदायिक जल संचयन परियोजना का नेतृत्व करने के लिए प्रेरित करें। (Recommended: Advance to community rainwater harvesting exploration.)';
  }

  res.json({
    success: true,
    message: 'Assessment successfully saved.',
    assessments: recordedAssessments,
    transparent_recommendation: nextRecommendation
  });
});

/**
 * Class-level learning summary and reporting
 * Clearly distinguishes missing submissions from poor performance.
 * No automated ranking or punitive labels.
 */
router.get('/class-summary/:classId', (req: Request, res: Response): void => {
  const { classId } = req.params;
  const user = req.user!;

  const cls = dbManager.queryOne<any>(`SELECT * FROM classes WHERE id = ?`, [classId]);
  if (!cls) {
    res.status(404).json({ error: 'NotFound', message: 'Class not found.' });
    return;
  }

  if (user.role !== 'platform_admin' && cls.school_id !== user.schoolId) {
    res.status(403).json({ error: 'Forbidden', message: 'Cross-school access denied.' });
    return;
  }

  // Get enrolled students
  const students = dbManager.query<any>(
    `SELECT u.id, u.student_id_code, u.name, se.roll_number
     FROM student_enrollments se
     JOIN users u ON se.student_id = u.id
     WHERE se.class_id = ?
     ORDER BY se.roll_number, u.name`,
    [classId]
  );

  // For each student, compute participation vs assessment status
  const studentReports = students.map(student => {
    const submissions = dbManager.query<any>(
      `SELECT s.id, s.day_number, s.submitted_at, s.submission_type
       FROM submissions s
       WHERE s.student_id = ? AND s.class_id = ?
       ORDER BY s.day_number`,
      [student.id, classId]
    );

    const assessments = dbManager.query<any>(
      `SELECT a.rubric, a.constructive_comment, lo.code, lo.title_en, lo.title_hi
       FROM assessments a
       JOIN learning_objectives lo ON a.objective_id = lo.id
       WHERE a.student_id = ?`,
      [student.id]
    );

    const submittedDays = new Set(submissions.map(s => s.day_number));
    const totalDays = 3; // Water conservation project duration
    const missingDays: number[] = [];
    for (let day = 1; day <= totalDays; day++) {
      if (!submittedDays.has(day)) {
        missingDays.push(day);
      }
    }

    const counts = {
      achieved: assessments.filter(a => a.rubric === 'achieved').length,
      developing: assessments.filter(a => a.rubric === 'developing').length,
      needs_support: assessments.filter(a => a.rubric === 'needs_support').length,
    };

    // Flag for additional support (transparent pedagogical indicator, not a failure label)
    const mayNeedSupport = counts.needs_support > 0 || (missingDays.length > 0 && submittedDays.size > 0);

    return {
      student_id: student.id,
      student_id_code: student.student_id_code,
      name: student.name,
      roll_number: student.roll_number,
      total_submissions: submissions.length,
      submitted_days: Array.from(submittedDays),
      missing_days: missingDays, // Clearly distinguished from poor performance!
      assessment_counts: counts,
      may_need_support: mayNeedSupport,
      assessments
    };
  });

  // Summary aggregates
  const totalEnrolled = students.length;
  const participatedCount = studentReports.filter(s => s.total_submissions > 0).length;
  const needSupportCount = studentReports.filter(s => s.may_need_support).length;

  res.json({
    class_info: cls,
    aggregate: {
      total_enrolled: totalEnrolled,
      participated_count: participatedCount,
      participation_rate: totalEnrolled > 0 ? Math.round((participatedCount / totalEnrolled) * 100) : 0,
      students_needing_support: needSupportCount
    },
    students: studentReports
  });
});

/**
 * Student's personal progress overview (Students only view their own)
 */
router.get('/my-progress', (req: Request, res: Response): void => {
  const user = req.user!;

  const submissions = dbManager.query(
    `SELECT s.id, s.project_id, s.day_number, s.submitted_at, s.submission_type, p.title_en, p.title_hi
     FROM submissions s
     JOIN projects p ON s.project_id = p.id
     WHERE s.student_id = ?
     ORDER BY s.day_number ASC`,
    [user.userId]
  );

  const assessments = dbManager.query(
    `SELECT a.rubric, a.constructive_comment, a.evaluated_at,
            lo.code as objective_code, lo.title_en as objective_title_en, lo.title_hi as objective_title_hi,
            t.name as teacher_name
     FROM assessments a
     JOIN learning_objectives lo ON a.objective_id = lo.id
     JOIN users t ON a.evaluator_teacher_id = t.id
     WHERE a.student_id = ?
     ORDER BY a.evaluated_at DESC`,
    [user.userId]
  );

  res.json({
    student: {
      id: user.userId,
      name: user.name,
      student_id_code: user.studentIdCode
    },
    submissions,
    assessments
  });
});

export default router;
