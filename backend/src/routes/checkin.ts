import { Router, Request, Response } from 'express';
import { getRegistrations, updateRegistrationStatus, getEventById } from '../lib/db';
import { requireAuth, requireOrganizer } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Valid QR Ticket Code or ID is required' }); return;
    }
    const trimmed = code.trim();
    const all = await getRegistrations();
    const match = all.find(
      (r) => r.qrCodeToken === trimmed || r.id.toLowerCase() === trimmed.toLowerCase()
    );
    if (!match) {
      res.status(404).json({ error: 'Ticket not found or invalid check-in QR code.' }); return;
    }
    if (match.status === 'Cancelled') {
      res.status(400).json({ error: 'This registration has been cancelled and cannot be checked in.' }); return;
    }
    const event = await getEventById(match.eventId);
    const alreadyAttended = match.status === 'Attended';
    const updated = await updateRegistrationStatus(match.id, 'Attended');
    res.json({
      success: true,
      alreadyAttended,
      registration: updated,
      eventTitle: event?.title || 'Community Event',
      message: alreadyAttended
        ? `Volunteer ${match.volunteerName} was already checked in!`
        : `Check-in successful! Welcome, ${match.volunteerName}!`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Check-in error' });
  }
});

export default router;
