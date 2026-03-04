'use client';

import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-navy-mid mb-1.5">{label}</label>
      )}
      <textarea
        className={`w-full rounded-xl border-2 border-navy-light bg-white px-4 py-3.5 text-base text-navy placeholder:text-navy-mid/50 transition-all duration-200 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 resize-none ${
          error ? 'border-error focus:border-error focus:ring-error/20' : ''
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
    </div>
  );
}
