import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'No data available',
  description = 'There are no items to show here yet.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 ${className}`}>
      <div className="p-3.5 bg-slate-100 rounded-full text-slate-500 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="font-semibold text-slate-900 text-base mb-1">{title}</h4>
      <p className="text-sm text-brand-muted max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
