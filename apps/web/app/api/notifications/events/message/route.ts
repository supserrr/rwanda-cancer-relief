import { NextResponse } from 'next/server';

import { NotificationService } from '@/lib/api/notifications';

type MessageEventPayload = {
  messageId?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as MessageEventPayload;

    if (!payload.messageId || typeof payload.messageId !== 'string') {
      return NextResponse.json({ error: 'messageId is required.' }, { status: 400 });
    }

    await NotificationService.enqueueMessageNotifications({
      messageId: payload.messageId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[notifications/events/message] Failed to enqueue notification:', error);
    return NextResponse.json(
      { error: 'Failed to enqueue message notification.' },
      { status: 500 },
    );
  }
}

