import { NextResponse } from 'next/server';

import { NotificationService } from '@/lib/api/notifications';

export async function POST() {
  try {
    await NotificationService.seedUpcomingSessionReminders();
    const dispatched = await NotificationService.dispatchDueNotifications();

    return NextResponse.json({
      success: true,
      dispatched,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[notifications/dispatch] Dispatch run failed:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch notifications.' },
      { status: 500 },
    );
  }
}

