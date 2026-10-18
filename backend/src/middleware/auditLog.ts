import { dbManager } from '../db/database.js';
import crypto from 'node:crypto';
import { UserRole } from '../types.js';

export interface AuditParams {
  schoolId?: string;
  actorUserId: string;
  actorRole: UserRole;
  action: string;
  targetResource: string;
  targetId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
}

export function logAuditEvent(params: AuditParams): void {
  try {
    const id = 'aud-' + crypto.randomUUID();
    // Sanitize details to never contain PINs or secrets
    let safeDetails = '';
    if (params.details) {
      const sanitized = { ...params.details };
      delete sanitized.pin;
      delete sanitized.new_pin;
      delete sanitized.password;
      delete sanitized.salt;
      delete sanitized.hashed_pin;
      safeDetails = JSON.stringify(sanitized);
    }

    dbManager.run(
      `INSERT INTO audit_logs (id, school_id, actor_user_id, actor_role, action, target_resource, target_id, ip_address, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.schoolId || null,
        params.actorUserId,
        params.actorRole,
        params.action,
        params.targetResource,
        params.targetId || null,
        params.ipAddress || null,
        safeDetails || null
      ]
    );
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}
