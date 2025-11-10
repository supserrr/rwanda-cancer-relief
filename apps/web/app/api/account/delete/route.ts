import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export async function DELETE() {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        {
          error:
            'Supabase client not configured. Please verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
        },
        { status: 500 },
      );
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[account/delete] Failed to fetch session:', sessionError);
    }

    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const serviceClient = getServiceClient();

    if (!serviceClient) {
      return NextResponse.json(
        {
          error:
            'Account administration is not configured. Please set SUPABASE_SERVICE_ROLE_KEY on the server.',
        },
        { status: 500 },
      );
    }

    const deleteResult = await serviceClient.auth.admin.deleteUser(user.id);

    if (deleteResult.error) {
      console.error('[account/delete] Failed to delete auth user:', deleteResult.error);
      return NextResponse.json(
        { error: deleteResult.error.message ?? 'Failed to delete account.' },
        { status: 500 },
      );
    }

    // Best effort sign-out to clear session cookies.
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.warn('[account/delete] Sign-out after deletion failed:', signOutError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[account/delete] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while deleting your account.' },
      { status: 500 },
    );
  }
}

