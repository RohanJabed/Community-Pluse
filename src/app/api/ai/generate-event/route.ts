import { NextResponse } from 'next/server';
import { generateEventWithAi } from '@/lib/ai-assistant';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Forbidden: Only organizers can use the AI Event Assistant' },
        { status: 403 }
      );
    }

    const { prompt, category } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a short description or prompt for your event idea.' },
        { status: 400 }
      );
    }

    const generated = await generateEventWithAi({ prompt, category });
    return NextResponse.json({ data: generated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to generate event suggestions' },
      { status: 500 }
    );
  }
}
