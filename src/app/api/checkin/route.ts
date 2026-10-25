import { NextResponse } from 'next/server';
import { getRegistrations, updateRegistrationStatus, getEventById } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Forbidden: Only organizers can perform ticket check-in' },
        { status: 403 }
      );
    }

    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Valid QR Ticket Code or ID is required' }, { status: 400 });
    }

    const trimmed = code.trim();
    const all = await getRegistrations();
    const match = all.find(
      (r) => r.qrCodeToken === trimmed || r.id.toLowerCase() === trimmed.toLowerCase()
    );

    if (!match) {
      return NextResponse.json(
        { error: 'Ticket not found or invalid check-in QR code.' },
        { status: 404 }
      );
    }

    const event = await getEventById(match.eventId);

    if (match.status === 'Cancelled') {
      return NextResponse.json(
        { error: 'This registration has been cancelled and cannot be checked in.' },
        { status: 400 }
      );
    }

    const alreadyAttended = match.status === 'Attended';
    const updated = await updateRegistrationStatus(match.id, 'Attended');

    return NextResponse.json({
      success: true,
      alreadyAttended,
      registration: updated,
      eventTitle: event?.title || 'Community Event',
      message: alreadyAttended
        ? `Volunteer ${match.volunteerName} was already checked in!`
        : `Check-in successful! Welcome, ${match.volunteerName}!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Check-in error' }, { status: 500 });
  }
}
