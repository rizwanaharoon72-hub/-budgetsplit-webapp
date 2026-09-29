import React from 'react';

export function Input({
  label,
  error,
  helperText,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  className = '',
  icon: Icon,
  prefix,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-800 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-brand-danger ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm font-medium">
            {prefix}
          </div>
        )}

        {Icon && !prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-lg border bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent min-h-[44px] ${
            prefix ? 'pl-12' : Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-brand-danger focus:ring-brand-danger'
              : 'border-brand-border'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-brand-danger font-medium flex items-center gap-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-brand-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
