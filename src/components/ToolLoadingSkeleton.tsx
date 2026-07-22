import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ToolLoadingSkeleton() {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 space-y-4 animate-pulse">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="text-xs font-semibold text-slate-500">Loading Utility Tool...</p>
    </div>
  );
}
