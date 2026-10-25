import { NextResponse } from 'next/server';
import { getRegistrations, createRegistration, getEventById } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (user.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Forbidden: Volunteers cannot access organizer registration rosters' },
        { status: 403 }
      );
    }

    const volunteers = await getRegistrations({ eventId: id });
    return NextResponse.json({ volunteers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch volunteers' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to register for this event.' }, { status: 401 });
    }

    if (user.role === 'organizer') {
      return NextResponse.json(
        { error: 'Organizers cannot register as volunteers. Please switch to a volunteer account to register.' },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { selectedSkill, notes, emergencyContact } = body;

    if (!selectedSkill) {
      return NextResponse.json(
        { error: 'Please select a volunteer skill or contribution role.' },
        { status: 400 }
      );
    }

    const result = await createRegistration({
      eventId,
      volunteerId: user.id,
      volunteerName: user.name,
      volunteerEmail: user.email,
      selectedSkill,
      notes: notes || '',
      emergencyContact: emergencyContact || '',
      status: 'Registered',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: 'Successfully registered for event!',
        registration: result.registration,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to register' }, { status: 500 });
  }
}
