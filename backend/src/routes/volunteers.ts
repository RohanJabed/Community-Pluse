import { Router, Request, Response } from 'express';
import { getRegistrations, getEventById, updateRegistrationStatus, cancelRegistration, getRegistrationById } from '../lib/db';
import { requireAuth, requireOrganizer } from '../middleware/auth';
import { User } from '../lib/types';

const router = Router();

// GET /api/volunteers/me
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    if (user.role !== 'volunteer') {
      res.status(403).json({ error: 'Forbidden: Only volunteers have a My Events portfolio' });
      return;
    }
    const registrations = await getRegistrations({ volunteerId: user.id });
    const populated = await Promise.all(
      registrations.map(async (reg) => ({
        ...reg,
        event: (await getEventById(reg.eventId)) || null,
      }))
    );
    res.json({ registrations: populated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch registrations' });
  }
});

// PATCH /api/volunteers/:id  (organizer updates status)
router.patch('/:id', requireAuth, requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['Registered', 'Confirmed', 'Attended', 'Cancelled'].includes(status)) {
      res.status(400).json({ error: 'Invalid participation status' });
      return;
    }
    const updated = await updateRegistrationStatus(req.params.id, status);
    if (!updated) { res.status(404).json({ error: 'Registration not found' }); return; }
    res.json({ registration: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update volunteer status' });
  }
});

// DELETE /api/volunteers/:id  (volunteer cancels own, organizer cancels any)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const existing = await getRegistrationById(req.params.id);
    if (!existing) { res.status(404).json({ error: 'Registration not found' }); return; }
    if (existing.volunteerId !== user.id && user.role !== 'organizer') {
      res.status(403).json({ error: "Forbidden: You cannot cancel another volunteer's registration" });
      return;
    }
    const result = await cancelRegistration(req.params.id, existing.volunteerId);
    if (!result.success) { res.status(400).json({ error: result.error }); return; }
    res.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cancel registration' });
  }
});

export default router;
