import React from 'react';

export function Select({
  label,
  error,
  helperText,
  id,
  options = [],
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'Select an option',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-800">
          {label}
          {required && <span className="text-brand-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full rounded-lg border bg-white py-2.5 px-3.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent min-h-[44px] appearance-none cursor-pointer ${
            error ? 'border-brand-danger focus:ring-brand-danger' : 'border-brand-border'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-brand-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-brand-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
