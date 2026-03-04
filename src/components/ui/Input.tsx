'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-navy-mid mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute top-1/2 -translate-y-1/2 ltr:left-3.5 rtl:right-3.5 text-orange pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-xl bg-input-bg border-2 border-transparent px-4 py-3.5 text-base text-navy placeholder:text-muted transition-all duration-200 focus:border-orange focus:bg-white focus:outline-none ${
            icon ? 'ltr:pl-11 rtl:pr-11' : ''
          } ${error ? 'border-error bg-red-50' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}
