import { Router, Request, Response } from 'express';
import { dbManager } from '../db/database.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

/**
 * List all published projects
 */
router.get('/', (req: Request, res: Response): void => {
  const projects = dbManager.query(
    `SELECT * FROM projects WHERE is_published = 1 ORDER BY created_at DESC`
  );

  res.json({ projects });
});

/**
 * Get project details including its 3 daily activities and learning objectives
 */
router.get('/:projectId', (req: Request, res: Response): void => {
  const { projectId } = req.params;

  const project = dbManager.queryOne(
    `SELECT * FROM projects WHERE id = ? AND is_published = 1`,
    [projectId]
  );

  if (!project) {
    res.status(404).json({ error: 'NotFound', message: 'Project not found.' });
    return;
  }

  const activities = dbManager.query(
    `SELECT id, project_id, day_number, title_en, title_hi, objective_en, objective_hi, instructions_en, instructions_hi, worksheet_template_json
     FROM project_activities
     WHERE project_id = ?
     ORDER BY day_number ASC`,
    [projectId]
  );

  const parsedActivities = activities.map(act => ({
    ...act,
    worksheet_template: JSON.parse(act.worksheet_template_json || '{}')
  }));

  const objectives = dbManager.query(
    `SELECT * FROM learning_objectives WHERE project_id = ? ORDER BY day_number, code`,
    [projectId]
  );

  res.json({
    project,
    activities: parsedActivities,
    objectives
  });
});

/**
 * Get specific daily activity worksheet
 */
router.get('/:projectId/activities/:dayNumber', (req: Request, res: Response): void => {
  const { projectId, dayNumber } = req.params;

  const activity = dbManager.queryOne(
    `SELECT * FROM project_activities WHERE project_id = ? AND day_number = ?`,
    [projectId, parseInt(dayNumber, 10)]
  );

  if (!activity) {
    res.status(404).json({ error: 'NotFound', message: 'Activity not found for specified day.' });
    return;
  }

  const objectives = dbManager.query(
    `SELECT * FROM learning_objectives WHERE project_id = ? AND day_number = ?`,
    [projectId, parseInt(dayNumber, 10)]
  );

  res.json({
    activity: {
      ...activity,
      worksheet_template: JSON.parse(activity.worksheet_template_json || '{}')
    },
    objectives
  });
});

export default router;
