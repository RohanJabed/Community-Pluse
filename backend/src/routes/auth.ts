import { Router, Request, Response } from 'express';
import { getUserByEmail, createUser } from '../lib/db';
import { AUTH_COOKIE_NAME, getCurrentUser } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }
    if (user.password && user.password !== password) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    res.cookie(AUTH_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, organization, bio, skills, interests } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Name, email, password, and role are required' });
      return;
    }
    if (role !== 'organizer' && role !== 'volunteer') {
      res.status(400).json({ error: 'Invalid role. Must be organizer or volunteer' });
      return;
    }
    const existing = await getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    const newUser = await createUser({
      name, email, password, role,
      organization: organization || (role === 'organizer' ? 'Community Action Group' : undefined),
      bio: bio || (role === 'volunteer' ? 'Passionate community volunteer.' : 'Event organizer.'),
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });
    res.cookie(AUTH_COOKIE_NAME, newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUser(req);
    res.json({ user: user || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
