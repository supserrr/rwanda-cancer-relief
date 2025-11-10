import { NextResponse } from 'next/server';

import { NotificationService } from '@/lib/api/notifications';

type SessionEventPayload = {
  sessionId?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as SessionEventPayload;

    if (!payload.sessionId || typeof payload.sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
    }

    await NotificationService.ensureSessionReminderForSession(payload.sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[notifications/events/session] Failed to ensure session reminder:', error);
    return NextResponse.json(
      { error: 'Failed to schedule session reminder notifications.' },
      { status: 500 },
    );
  }
}

