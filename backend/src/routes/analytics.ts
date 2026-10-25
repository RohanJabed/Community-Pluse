import { Router, Request, Response } from 'express';
import { getOrganizerAnalytics } from '../lib/db';
import { requireAuth, requireOrganizer } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, requireOrganizer, async (_req: Request, res: Response) => {
  try {
    const analytics = await getOrganizerAnalytics();
    res.json({ analytics });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to compute analytics' });
  }
});

export default router;
