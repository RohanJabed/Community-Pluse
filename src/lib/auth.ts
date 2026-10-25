import { cookies } from 'next/headers';
import { getUserById, getUserByEmail } from './db';
import { User } from './types';

export const AUTH_COOKIE_NAME = 'cp_session_user';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (!userCookie || !userCookie.value) {
      return null;
    }
    const userId = userCookie.value;
    const user = await getUserById(userId);
    if (!user) return null;
    // Don't leak password
    const { password: _, ...safeUser } = user;
    return safeUser as User;
  } catch {
    return null;
  }
}
