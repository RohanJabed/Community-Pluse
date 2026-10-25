import { getDb } from './mongodb';
import { User, CommunityEvent, Registration, EventCategory, ParticipationStatus } from './types';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Fallback memory data if offline
function getFallbackData() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch {}
  return { users: [], events: [], registrations: [] };
}

// ======================== USER FUNCTIONS ========================

export async function getUsers(): Promise<User[]> {
  try {
    const db = await getDb();
    const users = await db.collection('users').find().toArray();
    return users.map(({ _id, ...u }: any) => u as User);
  } catch (error) {
    console.error('MongoDB error in getUsers, using fallback:', error);
    return getFallbackData().users;
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ id });
    if (!user) return undefined;
    const { _id, ...safe } = user;
    return safe as User;
  } catch (error) {
    console.error('MongoDB error in getUserById, using fallback:', error);
    return getFallbackData().users.find((u: any) => u.id === id);
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') },
    });
    if (!user) return undefined;
    const { _id, ...safe } = user;
    return safe as User;
  } catch (error) {
    console.error('MongoDB error in getUserByEmail, using fallback:', error);
    return getFallbackData().users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  }
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const newUser: User = {
    ...user,
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    await db.collection('users').insertOne({ ...newUser });
  } catch (error) {
    console.error('MongoDB error in createUser, saving to local json:', error);
    const fb = getFallbackData();
    fb.users.push(newUser);
    fs.writeFileSync(DB_PATH, JSON.stringify(fb, null, 2));
  }
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const db = await getDb();
    await db.collection('users').updateOne({ id }, { $set: updates });
    const updated = await db.collection('users').findOne({ id });
    if (!updated) return null;
    const { _id, ...safe } = updated;
    return safe as User;
  } catch (error) {
    console.error('MongoDB error in updateUser:', error);
    return null;
  }
}

// ======================== EVENT FUNCTIONS ========================

export async function getEvents(filters?: {
  category?: string;
  search?: string;
  status?: string;
  location?: string;
  organizerId?: string;
  timeframe?: 'upcoming' | 'past' | 'all';
}): Promise<CommunityEvent[]> {
  try {
    const db = await getDb();
    let query: any = {};

    if (filters?.category && filters.category !== 'All') {
      query.category = filters.category;
    }

    if (filters?.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters?.organizerId) {
      query.organizerId = filters.organizerId;
    }

    if (filters?.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    const now = new Date();
    if (filters?.timeframe === 'upcoming') {
      query.date = { $gte: now.toISOString() };
    } else if (filters?.timeframe === 'past') {
      query.date = { $lt: now.toISOString() };
    }

    const docs = await db.collection('events').find(query).sort({ date: 1 }).toArray();
    let events = docs.map(({ _id, ...e }: any) => e as CommunityEvent);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Synchronize registeredCount with active registrations in DB
    const registrations = await db.collection('registrations').find({ status: { $ne: 'Cancelled' } }).toArray();
    events = events.map((evt) => {
      const count = registrations.filter((r: any) => r.eventId === evt.id).length;
      return {
        ...evt,
        registeredCount: Math.max(evt.registeredCount, count),
      };
    });

    return events;
  } catch (error) {
    console.error('MongoDB error in getEvents, using fallback:', error);
    return getFallbackData().events;
  }
}

export async function getEventById(id: string): Promise<CommunityEvent | undefined> {
  try {
    const db = await getDb();
    const evt = await db.collection('events').findOne({ id });
    if (!evt) return undefined;
    const { _id, ...event } = evt;

    // Recalculate registeredCount from active registrations
    const activeCount = await db.collection('registrations').countDocuments({
      eventId: id,
      status: { $ne: 'Cancelled' },
    });

    return {
      ...(event as CommunityEvent),
      registeredCount: Math.max(event.registeredCount, activeCount),
    };
  } catch (error) {
    console.error('MongoDB error in getEventById, using fallback:', error);
    return getFallbackData().events.find((e: any) => e.id === id);
  }
}

export async function createEvent(
  eventData: Omit<CommunityEvent, 'id' | 'createdAt' | 'updatedAt' | 'registeredCount'>
): Promise<CommunityEvent> {
  const newEvent: CommunityEvent = {
    ...eventData,
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    registeredCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    await db.collection('events').insertOne({ ...newEvent });
  } catch (error) {
    console.error('MongoDB error in createEvent:', error);
    const fb = getFallbackData();
    fb.events.unshift(newEvent);
    fs.writeFileSync(DB_PATH, JSON.stringify(fb, null, 2));
  }
  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<CommunityEvent>): Promise<CommunityEvent | null> {
  try {
    const db = await getDb();
    await db.collection('events').updateOne(
      { id },
      {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      }
    );
    const updated = await db.collection('events').findOne({ id });
    if (!updated) return null;
    const { _id, ...safe } = updated;
    return safe as CommunityEvent;
  } catch (error) {
    console.error('MongoDB error in updateEvent:', error);
    return null;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    const res = await db.collection('events').deleteOne({ id });
    await db.collection('registrations').deleteMany({ eventId: id });
    return (res.deletedCount || 0) > 0;
  } catch (error) {
    console.error('MongoDB error in deleteEvent:', error);
    return false;
  }
}

// ======================== REGISTRATION FUNCTIONS ========================

export async function getRegistrations(filters?: {
  eventId?: string;
  volunteerId?: string;
  status?: string;
}): Promise<Registration[]> {
  try {
    const db = await getDb();
    let query: any = {};
    if (filters?.eventId) query.eventId = filters.eventId;
    if (filters?.volunteerId) query.volunteerId = filters.volunteerId;
    if (filters?.status && filters.status !== 'all') query.status = filters.status;

    const docs = await db.collection('registrations').find(query).sort({ registeredAt: -1 }).toArray();
    return docs.map(({ _id, ...r }: any) => r as Registration);
  } catch (error) {
    console.error('MongoDB error in getRegistrations:', error);
    return getFallbackData().registrations;
  }
}

export async function getRegistrationById(id: string): Promise<Registration | undefined> {
  try {
    const db = await getDb();
    const reg = await db.collection('registrations').findOne({ id });
    if (!reg) return undefined;
    const { _id, ...safe } = reg;
    return safe as Registration;
  } catch (error) {
    console.error('MongoDB error in getRegistrationById:', error);
    return getFallbackData().registrations.find((r: any) => r.id === id);
  }
}

export async function createRegistration(
  data: Omit<Registration, 'id' | 'registeredAt' | 'updatedAt' | 'qrCodeToken'>
): Promise<{ success: boolean; registration?: Registration; error?: string }> {
  try {
    const db = await getDb();
    const event = await db.collection('events').findOne({ id: data.eventId });

    if (!event) {
      return { success: false, error: 'Event not found.' };
    }

    if (event.status !== 'published') {
      return { success: false, error: `Registrations are currently closed (${event.status}).` };
    }

    // Check deadline
    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      return { success: false, error: 'Registration deadline has passed for this event.' };
    }

    // Check duplicate registration
    const existing = await db.collection('registrations').findOne({
      eventId: data.eventId,
      status: { $ne: 'Cancelled' },
      $or: [
        { volunteerId: data.volunteerId },
        { volunteerEmail: { $regex: new RegExp(`^${data.volunteerEmail.trim()}$`, 'i') } },
      ],
    });

    if (existing) {
      return { success: false, error: 'You are already registered for this event.' };
    }

    // Check capacity
    const activeCount = await db.collection('registrations').countDocuments({
      eventId: data.eventId,
      status: { $ne: 'Cancelled' },
    });

    if (activeCount >= event.maxCapacity) {
      return { success: false, error: 'This event has reached its maximum volunteer capacity.' };
    }

    const token = `CP-TICKET-${data.eventId}-${data.volunteerId}-${Date.now().toString(36).toUpperCase()}`;
    const regId = `REG-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;

    const newReg: Registration = {
      ...data,
      id: regId,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      qrCodeToken: token,
    };

    await db.collection('registrations').insertOne({ ...newReg });

    // Update event registeredCount
    await db.collection('events').updateOne(
      { id: data.eventId },
      { $set: { registeredCount: activeCount + 1 } }
    );

    return { success: true, registration: newReg };
  } catch (error: any) {
    console.error('MongoDB error in createRegistration:', error);
    return { success: false, error: error.message || 'Database error creating registration' };
  }
}

export async function updateRegistrationStatus(
  id: string,
  newStatus: ParticipationStatus
): Promise<Registration | null> {
  try {
    const db = await getDb();
    const reg = await db.collection('registrations').findOne({ id });
    if (!reg) return null;

    await db.collection('registrations').updateOne(
      { id },
      {
        $set: {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    // Update event active count
    const activeCount = await db.collection('registrations').countDocuments({
      eventId: reg.eventId,
      status: { $ne: 'Cancelled' },
    });

    await db.collection('events').updateOne(
      { id: reg.eventId },
      { $set: { registeredCount: activeCount } }
    );

    const updated = await db.collection('registrations').findOne({ id });
    if (!updated) return null;
    const { _id, ...safe } = updated;
    return safe as Registration;
  } catch (error) {
    console.error('MongoDB error in updateRegistrationStatus:', error);
    return null;
  }
}

export async function cancelRegistration(
  id: string,
  volunteerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    const reg = await db.collection('registrations').findOne({ id });

    if (!reg) {
      return { success: false, error: 'Registration not found' };
    }

    if (reg.volunteerId !== volunteerId) {
      return { success: false, error: 'Unauthorized to cancel this registration' };
    }

    const event = await db.collection('events').findOne({ id: reg.eventId });
    if (event) {
      const eventDate = new Date(event.date);
      if (eventDate < new Date()) {
        return { success: false, error: 'Cannot cancel registration for a past event' };
      }
    }

    await db.collection('registrations').updateOne(
      { id },
      {
        $set: {
          status: 'Cancelled',
          updatedAt: new Date().toISOString(),
        },
      }
    );

    // Recalculate event count
    const activeCount = await db.collection('registrations').countDocuments({
      eventId: reg.eventId,
      status: { $ne: 'Cancelled' },
    });

    await db.collection('events').updateOne(
      { id: reg.eventId },
      { $set: { registeredCount: activeCount } }
    );

    return { success: true };
  } catch (error: any) {
    console.error('MongoDB error in cancelRegistration:', error);
    return { success: false, error: error.message || 'Database error cancelling registration' };
  }
}

// ======================== ANALYTICS ========================

export async function getOrganizerAnalytics() {
  try {
    const db = await getDb();
    const now = new Date();

    const events = await db.collection('events').find().toArray();
    const registrations = await db.collection('registrations').find().toArray();

    const totalEvents = events.length;
    const upcomingEvents = events.filter((e) => new Date(e.date) >= now && e.status !== 'cancelled').length;
    const completedEvents = events.filter((e) => new Date(e.date) < now || e.status === 'completed').length;

    const activeRegistrations = registrations.filter((r) => r.status !== 'Cancelled');
    const totalVolunteers = activeRegistrations.length;

    const totalSlots = events.reduce((sum, e) => sum + (e.maxCapacity || 0), 0);
    const totalOccupiedSlots = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
    const availableSlots = Math.max(0, totalSlots - totalOccupiedSlots);
    const utilizationRate = totalSlots > 0 ? Math.round((totalOccupiedSlots / totalSlots) * 100) : 0;

    // Events by Category
    const categoryCounts: Record<string, number> = {};
    events.forEach((e) => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Registrations per Event
    const registrationsByEvent = events
      .filter((e) => e.status !== 'draft')
      .slice(0, 7)
      .map((e) => ({
        eventTitle: e.title.length > 22 ? e.title.substring(0, 20) + '...' : e.title,
        registered: e.registeredCount || 0,
        capacity: e.maxCapacity || 20,
        rate: Math.round(((e.registeredCount || 0) / (e.maxCapacity || 20)) * 100),
      }));

    // Status breakdown
    const statusMap: Record<string, number> = {
      Registered: 0,
      Confirmed: 0,
      Attended: 0,
      Cancelled: 0,
    };
    registrations.forEach((r) => {
      if (statusMap[r.status] !== undefined) {
        statusMap[r.status] += 1;
      }
    });
    const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalVolunteers,
      totalSlots,
      availableSlots,
      utilizationRate,
      categoryDistribution,
      registrationsByEvent,
      statusBreakdown,
    };
  } catch (error) {
    console.error('MongoDB error in getOrganizerAnalytics:', error);
    return {
      totalEvents: 0,
      upcomingEvents: 0,
      completedEvents: 0,
      totalVolunteers: 0,
      totalSlots: 0,
      availableSlots: 0,
      utilizationRate: 0,
      categoryDistribution: [],
      registrationsByEvent: [],
      statusBreakdown: [],
    };
  }
}
