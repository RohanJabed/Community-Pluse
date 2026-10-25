import { NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/db';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password, role, organization, bio, skills, interests } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    if (role !== 'organizer' && role !== 'volunteer') {
      return NextResponse.json(
        { error: 'Invalid role specified. Must be organizer or volunteer' },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    const newUser = await createUser({
      name,
      email,
      password,
      role,
      organization: organization || (role === 'organizer' ? 'Community Action Group' : undefined),
      bio: bio || (role === 'volunteer' ? 'Passionate community volunteer.' : 'Event organizer.'),
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
