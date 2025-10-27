'use client';

import React from 'react';
import { AIChatSimpleDemo } from '@workspace/ui/components/ai-chat-simple-demo';

export default function AIChatDemoPage() {
  const [isOpen, setIsOpen] = React.useState(true);

  if (!isOpen) return null;

  return <AIChatSimpleDemo onClose={() => setIsOpen(false)} />;
}
