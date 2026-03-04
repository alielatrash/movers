'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, selected, onClick, className = '' }: CardProps) {
  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`relative rounded-2xl border-2 p-5 transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-orange bg-orange-light/30 shadow-card-hover'
          : 'border-navy-light bg-white shadow-card hover:shadow-card-hover'
      } ${className}`}
    >
      {selected && (
        <div className="absolute top-3 ltr:right-3 rtl:left-3 w-6 h-6 rounded-full bg-orange flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {children}
    </motion.div>
  );
}
