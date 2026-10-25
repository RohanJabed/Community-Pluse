import { NextResponse } from 'next/server';
import { updateRegistrationStatus, cancelRegistration, getRegistrationById } from '@/lib/db';
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
        { error: 'Forbidden: Only organizers can update volunteer participation status' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!['Registered', 'Confirmed', 'Attended', 'Cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid participation status. Must be Registered, Confirmed, Attended, or Cancelled' },
        { status: 400 }
      );
    }

    const updated = await updateRegistrationStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ registration: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update volunteer status' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getRegistrationById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (existing.volunteerId !== user.id && user.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Forbidden: You cannot cancel another volunteer\'s registration' },
        { status: 403 }
      );
    }

    const result = await cancelRegistration(id, existing.volunteerId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to cancel registration' }, { status: 500 });
  }
}
