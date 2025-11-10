'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { CheckCircle, Clock, Mail } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfileUpdates } from '@/hooks/useRealtime';

export default function CounselorPendingPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();

  useProfileUpdates(
    user?.id ? { ids: [user.id] } : null,
    (profile) => {
      if (profile.id === user?.id && profile.approval_status === 'approved') {
        checkAuth();
        router.replace('/dashboard/counselor');
      }
    },
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role !== 'counselor') {
      router.replace('/dashboard');
      return;
    }

    if (user.approvalStatus === 'approved') {
      router.replace('/dashboard/counselor');
    }
  }, [router, user]);

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl w-full text-center shadow-xl border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Your Application Is Under Review</CardTitle>
          <CardDescription className="text-base">
            Thanks for submitting your counselor onboarding details. Our team is reviewing your credentials to make sure everything is in order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-left md:text-center">
            <div className="flex flex-col gap-4 max-w-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  You will be notified by email as soon as your profile is approved.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Feel free to update your profile details in settings while you wait.
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 bg-background/70 border border-border rounded-2xl px-6 py-4">
              <Spinner className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">
                We usually approve new counselors within 24-48 hours.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/counselor/settings')}
            >
              Review Submitted Details
            </Button>
            <Button onClick={() => checkAuth()}>Check Status Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
