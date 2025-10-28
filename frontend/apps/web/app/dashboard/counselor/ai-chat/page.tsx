'use client';

import React from 'react';
import { useAuth } from '../../../../hooks/use-auth';

export default function CounselorAIChatPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="h-full">
      {/* AI Chat content will go here */}
    </div>
  );
}