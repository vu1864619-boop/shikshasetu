import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types.js';

/**
 * Ensures authenticated user has one of the required roles
 */
export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`
      });
      return;
    }

    next();
  };
}

/**
 * Validates that an operation targeting a specific school is only allowed
 * if the user belongs to that school or is a platform admin.
 */
export function requireSameSchool(getTargetSchoolId: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (req.user.role === 'platform_admin') {
      return next(); // Platform admins have global access
    }

    const targetSchoolId = getTargetSchoolId(req);
    if (!targetSchoolId || targetSchoolId !== req.user.schoolId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Cross-school access denied. You may only access resources within your assigned school.'
      });
      return;
    }

    next();
  };
}

/**
 * Ensures that if a student is requesting student-specific data, they can ONLY access their own.
 * Teachers and school admins from the same school are permitted.
 */
export function enforceStudentSelfOrStaff(getStudentId: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const targetStudentId = getStudentId(req);
    if (req.user.role === 'student' && req.user.userId !== targetStudentId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Privacy violation: Students cannot view or modify other students records.'
      });
      return;
    }

    next();
  };
}
