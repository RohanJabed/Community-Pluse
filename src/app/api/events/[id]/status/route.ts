import { NextResponse } from 'next/server';
import { getEventById, updateEvent } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Forbidden: Only organizers can change event status' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!['draft', 'published', 'closed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid event status' }, { status: 400 });
    }

    const updated = await updateEvent(id, { status });
    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update event status' }, { status: 500 });
  }
}
