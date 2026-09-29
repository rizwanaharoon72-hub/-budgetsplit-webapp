import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon,
  fullWidth = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary: 'bg-brand-accent text-white hover:bg-brand-accent-hover focus:ring-brand-accent shadow-sm',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-800 shadow-sm',
    outline: 'border border-brand-border text-brand-dark bg-white hover:bg-slate-50 focus:ring-slate-400',
    danger: 'bg-brand-danger text-white hover:bg-red-700 focus:ring-brand-danger shadow-sm',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}
