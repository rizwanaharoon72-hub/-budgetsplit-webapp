import React from 'react';

export function Card({ children, className = '', header, footer, padding = 'normal' }) {
  const paddingStyles = {
    none: '',
    compact: 'p-3 sm:p-4',
    normal: 'p-4 sm:p-6',
    spacious: 'p-5 sm:p-8',
  };

  return (
    <div className={`bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden ${className}`}>
      {header && <div className="border-b border-brand-border px-4 sm:px-6 py-3 sm:py-4">{header}</div>}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && <div className="border-t border-brand-border px-4 sm:px-6 py-3 sm:py-4 bg-slate-50">{footer}</div>}
    </div>
  );
}
