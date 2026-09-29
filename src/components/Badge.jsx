import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { getBudgetStatus } from '../utils/getBudgetStatus';

export function Badge({ spent, limit, status: explicitStatus, className = '' }) {
  const statusInfo = explicitStatus || getBudgetStatus(spent, limit);

  const getIcon = () => {
    switch (statusInfo.status) {
      case 'OVER_BUDGET':
        return <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-red-700" />;
      case 'NEAR_LIMIT':
        return <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-700" />;
      case 'ON_TRACK':
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-700" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.badgeClass} ${className}`}
    >
      {getIcon()}
      <span>{statusInfo.label}</span>
    </span>
  );
}
