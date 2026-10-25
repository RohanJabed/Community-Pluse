import { Router, Request, Response } from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getRegistrations, createRegistration } from '../lib/db';
import { requireAuth, requireOrganizer } from '../middleware/auth';
import { User } from '../lib/types';

const router = Router();

// GET /api/events
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, status, location, timeframe, organizerId } = req.query;
    const events = await getEvents({
      category: category as string,
      search: search as string,
      status: status as string,
      location: location as string,
      timeframe: timeframe as any,
      organizerId: organizerId as string,
    });
    res.json({ events });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch events' });
  }
});

// POST /api/events
router.post('/', requireAuth, requireOrganizer, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { title, description, date, endDate, location, isVirtual, category, maxCapacity, requiredSkills, registrationDeadline, imageUrl, status } = req.body;

    if (!title || !description || !date || !location || !category || !maxCapacity || !registrationDeadline) {
      res.status(400).json({ error: 'Missing required event fields' });
      return;
    }
    const capacityNum = parseInt(maxCapacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      res.status(400).json({ error: 'Maximum capacity must be a positive number' });
      return;
    }
    const newEvent = await createEvent({
      title, description, date,
      endDate: endDate || undefined,
      location,
      isVirtual: Boolean(isVirtual),
      category,
      maxCapacity: capacityNum,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      registrationDeadline,
      status: status || 'published',
      organizerId: user.id,
      organizerName: user.name,
      organizerEmail: user.email,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    });
    res.status(201).json({ event: newEvent });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create event' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
    res.json({ event });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch event' });
  }
});

// PUT /api/events/:id
router.put('/:id', requireAuth, requireOrganizer, async (req: Request, res: Response) => {
  try {
    const existing = await getEventById(req.params.id);
    if (!existing) { res.status(404).json({ error: 'Event not found' }); return; }
    const updated = await updateEvent(req.params.id, {
      ...req.body,
      maxCapacity: req.body.maxCapacity ? parseInt(req.body.maxCapacity, 10) : existing.maxCapacity,
    });
    res.json({ event: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update event' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', requireAuth, requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { deleteEvent: del } = await import('../lib/db');
    const success = await del(req.params.id);
    if (!success) { res.status(404).json({ error: 'Event not found' }); return; }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete event' });
  }
});

// PATCH /api/events/:id/status
router.patch('/:id/status', requireAuth, requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'closed', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ error: 'Invalid event status' }); return;
    }
    const updated = await updateEvent(req.params.id, { status });
    if (!updated) { res.status(404).json({ error: 'Event not found' }); return; }
    res.json({ event: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update event status' });
  }
});

// GET /api/events/:id/volunteers  (organizer only)
router.get('/:id/volunteers', requireAuth, requireOrganizer, async (req: Request, res: Response) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
    const volunteers = await getRegistrations({ eventId: req.params.id });
    res.json({ volunteers });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch volunteers' });
  }
});

// POST /api/events/:id/volunteers  (volunteer registration)
router.post('/:id/volunteers', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    if (user.role === 'organizer') {
      res.status(403).json({ error: 'Organizers cannot register as volunteers. Please switch to a volunteer account.' });
      return;
    }
    const { selectedSkill, notes, emergencyContact } = req.body;
    if (!selectedSkill) {
      res.status(400).json({ error: 'Please select a volunteer skill or contribution role.' });
      return;
    }
    const result = await createRegistration({
      eventId: req.params.id,
      volunteerId: user.id,
      volunteerName: user.name,
      volunteerEmail: user.email,
      selectedSkill,
      notes: notes || '',
      emergencyContact: emergencyContact || '',
      status: 'Registered',
    });
    if (!result.success) {
      res.status(400).json({ error: result.error }); return;
    }
    res.status(201).json({ message: 'Successfully registered for event!', registration: result.registration });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register' });
  }
});

export default router;
