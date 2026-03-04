'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface ToggleCardProps {
  enabled: boolean;
  onToggle: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}

export function ToggleCard({
  enabled,
  onToggle,
  icon,
  title,
  description,
  children,
}: ToggleCardProps) {
  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all duration-200 ${
        enabled ? 'border-orange bg-orange-light/10' : 'border-border bg-white'
      }`}
    >
      <div className="flex items-center gap-4 cursor-pointer" onClick={onToggle}>
        {/* Icon area */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
          enabled ? 'bg-orange text-white' : 'bg-surface text-navy/60'
        }`}>
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-navy text-sm">{title}</div>
          <div className="text-xs text-muted mt-0.5">{description}</div>
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`w-11 h-6 rounded-full transition-all duration-200 relative cursor-pointer shrink-0 ${
            enabled ? 'bg-orange' : 'bg-border'
          }`}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
            style={{ left: enabled ? 'calc(100% - 22px)' : '2px' }}
          />
        </button>
      </div>

      <AnimatePresence>
        {enabled && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border/50">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
