import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../lib/db';
import { User } from '../lib/types';

export const AUTH_COOKIE_NAME = 'cp_session_user';

export async function getCurrentUser(req: Request): Promise<User | null> {
  const userId = req.cookies?.[AUTH_COOKIE_NAME];
  if (!userId) return null;
  const user = await getUserById(userId);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser as User;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  (req as any).user = user;
  next();
}

export async function requireOrganizer(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (user.role !== 'organizer') {
    res.status(403).json({ error: 'Forbidden: Organizers only' });
    return;
  }
  next();
}

export async function requireVolunteer(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (user.role !== 'volunteer') {
    res.status(403).json({ error: 'Forbidden: Volunteers only' });
    return;
  }
  next();
}
