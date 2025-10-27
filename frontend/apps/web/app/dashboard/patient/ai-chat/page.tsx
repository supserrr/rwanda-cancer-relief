'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AIChatSimpleDemo } from '@workspace/ui/components/ai-chat-simple-demo';
import { useAuth } from '../../../../hooks/use-auth';

export default function PatientAIChatPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleClose = () => {
    router.push('/dashboard/patient');
  };

  if (!user) return null;

  return <AIChatSimpleDemo onClose={handleClose} />;
}