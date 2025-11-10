import { NextResponse } from 'next/server';

import { NotificationService } from '@/lib/api/notifications';

type PatientAssignmentPayload = {
  patientId?: string;
  counselorId?: string;
  assignedBy?: string | null;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as PatientAssignmentPayload;

    if (!payload.patientId || !payload.counselorId) {
      return NextResponse.json(
        { error: 'patientId and counselorId are required.' },
        { status: 400 },
      );
    }

    await NotificationService.enqueuePatientAssignmentNotifications({
      patientId: payload.patientId,
      counselorId: payload.counselorId,
      assignedBy: payload.assignedBy ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[notifications/events/patient-assignment] Failed to enqueue notification:', error);
    return NextResponse.json(
      { error: 'Failed to enqueue patient assignment notifications.' },
      { status: 500 },
    );
  }
}

