import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export function Alert({ variant = 'info', title, message, onClose, className = '' }) {
  const variantMap = {
    success: {
      bg: 'bg-green-50 border-green-200 text-green-900',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    danger: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: AlertOctagon,
      iconColor: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
    },
  };

  const currentVariant = variantMap[variant] || variantMap.info;
  const IconComponent = currentVariant.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${currentVariant.bg} ${className}`}>
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${currentVariant.iconColor}`} />
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        {message && <p className="leading-relaxed opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
