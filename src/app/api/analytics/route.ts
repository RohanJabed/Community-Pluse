import { NextResponse } from 'next/server';
import { getOrganizerAnalytics } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Forbidden: Analytics is reserved for organizers' },
        { status: 403 }
      );
    }

    const analytics = await getOrganizerAnalytics();
    return NextResponse.json({ analytics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to compute analytics' }, { status: 500 });
  }
}
