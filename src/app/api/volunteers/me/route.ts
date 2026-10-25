import { NextResponse } from 'next/server';
import { getRegistrations, getEventById } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'volunteer') {
      return NextResponse.json(
        { error: 'Forbidden: Only volunteers have a My Events portfolio' },
        { status: 403 }
      );
    }

    const registrations = await getRegistrations({ volunteerId: user.id });

    // Join with event details
    const populated = await Promise.all(
      registrations.map(async (reg) => {
        const event = await getEventById(reg.eventId);
        return {
          ...reg,
          event: event || null,
        };
      })
    );

    return NextResponse.json({ registrations: populated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch registrations' }, { status: 500 });
  }
}
