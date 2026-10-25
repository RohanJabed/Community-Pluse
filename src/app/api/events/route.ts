import { NextResponse } from 'next/server';
import { getEvents, createEvent } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const location = searchParams.get('location') || undefined;
    const timeframe = (searchParams.get('timeframe') as any) || undefined;
    const organizerId = searchParams.get('organizerId') || undefined;

    const events = await getEvents({
      category,
      search,
      status,
      location,
      timeframe,
      organizerId,
    });

    return NextResponse.json({ events });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Forbidden: Only organizers can create events' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      endDate,
      location,
      isVirtual,
      category,
      maxCapacity,
      requiredSkills,
      registrationDeadline,
      imageUrl,
      status,
    } = body;

    if (!title || !description || !date || !location || !category || !maxCapacity || !registrationDeadline) {
      return NextResponse.json(
        { error: 'Missing required event fields (title, description, date, location, category, maxCapacity, registrationDeadline)' },
        { status: 400 }
      );
    }

    const capacityNum = parseInt(maxCapacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return NextResponse.json(
        { error: 'Maximum capacity must be a positive number' },
        { status: 400 }
      );
    }

    const newEvent = await createEvent({
      title,
      description,
      date,
      endDate: endDate || undefined,
      location,
      isVirtual: Boolean(isVirtual),
      category,
      maxCapacity: capacityNum,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      registrationDeadline,
      status: status || 'published',
      organizerId: user.id,
      organizerName: user.name,
      organizerEmail: user.email,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    });

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create event' }, { status: 500 });
  }
}
