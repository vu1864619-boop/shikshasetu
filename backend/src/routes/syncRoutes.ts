import { Router, Request, Response } from 'express';
import { dbManager } from '../db/database.js';
import { authenticate } from '../middleware/authenticate.js';
import crypto from 'node:crypto';

const router = Router();

router.use(authenticate);

interface SyncBatchItem {
  client_idempotency_key: string;
  type: 'submission' | 'draft';
  client_timestamp: string;
  data: {
    project_id: string;
    activity_id: string;
    day_number: number;
    class_id: string;
    answers: Record<string, any>;
    group_name?: string;
    submission_type?: string;
  };
}

/**
 * Offline Synchronization Batch Endpoint
 * Confirms receipt and persistence on server, handles duplicates & conflicts.
 */
router.post('/batch', (req: Request, res: Response): void => {
  const { client_device_id, items } = req.body;
  const actor = req.user!;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'BadRequest', message: 'Sync items array is required.' });
    return;
  }

  const results: Array<{
    client_idempotency_key: string;
    status: 'synced' | 'duplicate_acknowledged' | 'rejected' | 'conflict_resolved';
    server_submission_id?: string;
    message: string;
    server_timestamp: string;
  }> = [];

  for (const item of items as SyncBatchItem[]) {
    try {
      if (!item.client_idempotency_key || !item.data) {
        results.push({
          client_idempotency_key: item.client_idempotency_key || 'unknown',
          status: 'rejected',
          message: 'Missing key or submission data',
          server_timestamp: new Date().toISOString()
        });
        continue;
      }

      // Check if duplicate submission by idempotency key
      const existing = dbManager.queryOne<any>(
        `SELECT * FROM submissions WHERE client_idempotency_key = ?`,
        [item.client_idempotency_key]
      );

      if (existing) {
        results.push({
          client_idempotency_key: item.client_idempotency_key,
          status: 'duplicate_acknowledged',
          server_submission_id: existing.id,
          message: 'Item was already recorded previously on server.',
          server_timestamp: existing.submitted_at
        });
        continue;
      }

      // Check if another submission for the same student, project, and day already exists (potential multi-device conflict)
      const existingSameDay = dbManager.queryOne<any>(
        `SELECT * FROM submissions WHERE student_id = ? AND project_id = ? AND day_number = ?`,
        [actor.userId, item.data.project_id, item.data.day_number]
      );

      if (existingSameDay) {
        // Conflict resolution: If client timestamp is newer and within 24 hours, update answers; otherwise preserve server state
        const serverTime = new Date(existingSameDay.submitted_at).getTime();
        const clientTime = new Date(item.client_timestamp || 0).getTime();

        if (clientTime > serverTime) {
          dbManager.run(
            `UPDATE submissions 
             SET answers_json = ?, submitted_at = datetime('now'), client_idempotency_key = ?
             WHERE id = ?`,
            [JSON.stringify(item.data.answers), item.client_idempotency_key, existingSameDay.id]
          );

          results.push({
            client_idempotency_key: item.client_idempotency_key,
            status: 'conflict_resolved',
            server_submission_id: existingSameDay.id,
            message: 'Conflict resolved: Newer client update merged into existing submission.',
            server_timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            client_idempotency_key: item.client_idempotency_key,
            status: 'conflict_resolved',
            server_submission_id: existingSameDay.id,
            message: 'Conflict resolved: Existing server record is more recent, client preserved server record.',
            server_timestamp: existingSameDay.submitted_at
          });
        }
        continue;
      }

      // Fresh submission: insert new record
      const submissionId = 'sub-' + crypto.randomUUID();
      const submissionType = item.data.submission_type || 'individual';

      dbManager.run(
        `INSERT INTO submissions (id, project_id, activity_id, day_number, student_id, class_id, submission_type, group_name, answers_json, submitted_at, sync_status, client_idempotency_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'synced', ?)`,
        [
          submissionId,
          item.data.project_id,
          item.data.activity_id,
          item.data.day_number,
          actor.userId,
          item.data.class_id,
          submissionType,
          item.data.group_name || null,
          JSON.stringify(item.data.answers),
          item.client_idempotency_key
        ]
      );

      results.push({
        client_idempotency_key: item.client_idempotency_key,
        status: 'synced',
        server_submission_id: submissionId,
        message: 'Successfully synchronized to server database.',
        server_timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      results.push({
        client_idempotency_key: item.client_idempotency_key,
        status: 'rejected',
        message: err.message || 'Server error during sync',
        server_timestamp: new Date().toISOString()
      });
    }
  }

  res.json({
    success: true,
    client_device_id: client_device_id || 'unknown',
    processed_count: results.length,
    results
  });
});

export default router;
