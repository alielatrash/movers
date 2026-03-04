'use client';

import { motion } from 'framer-motion';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-bold text-base rounded-xl px-6 py-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none';

  const variants = {
    primary: 'bg-orange text-white hover:bg-orange-dark shadow-sm',
    secondary: 'bg-navy text-white hover:bg-navy-mid',
    ghost: 'bg-transparent text-navy-mid hover:text-navy hover:bg-navy-light',
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
