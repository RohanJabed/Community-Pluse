import { Router, Request, Response } from 'express';
import { generateEventWithAi } from '../lib/ai-assistant';
import { requireAuth, requireOrganizer } from '../middleware/auth';

const router = Router();

router.post('/generate-event', requireAuth, requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { prompt, category } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({ error: 'Please provide a short description or prompt for your event idea.' });
      return;
    }
    const generated = await generateEventWithAi({ prompt, category });
    res.json({ data: generated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate event suggestions' });
  }
});

export default router;
