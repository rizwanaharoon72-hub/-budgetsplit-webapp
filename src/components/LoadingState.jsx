import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading budget details...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <Loader2 className="w-10 h-10 text-brand-accent animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
