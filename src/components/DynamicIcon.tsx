import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export default function DynamicIcon({ name, className = 'w-5 h-5' }: DynamicIconProps) {
  // Access Lucide icon dynamically
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Wrench;
  return <IconComponent className={className} />;
}
