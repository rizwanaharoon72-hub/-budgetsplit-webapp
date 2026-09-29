import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this view.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-xl border border-red-200">
      <div className="p-3 bg-red-100 rounded-full text-red-600 mb-3">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h4 className="font-semibold text-red-900 text-base mb-1">{title}</h4>
      <p className="text-sm text-red-700 max-w-md mb-5">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="md">
          Try Again
        </Button>
      )}
    </div>
  );
}
