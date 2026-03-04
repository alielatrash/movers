'use client';

import { useState, useMemo } from 'react';

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function todayStr(): string {
  const t = new Date();
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date();
  const todayS = todayStr();

  // Calendar view month — default to selected date or today
  const initial = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const monthName = new Date(viewYear, viewMonth).toLocaleString('en', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; month: number; year: number; current: boolean; dateStr: string }[] = [];

    // Previous month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth - 1;
      const y = m < 0 ? viewYear - 1 : viewYear;
      cells.push({ day: d, month: (m + 12) % 12, year: y, current: false, dateStr: toDateStr(y, (m + 12) % 12, d) });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: viewMonth, year: viewYear, current: true, dateStr: toDateStr(viewYear, viewMonth, d) });
    }

    // Next month fill
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const m = viewMonth + 1;
        const y = m > 11 ? viewYear + 1 : viewYear;
        cells.push({ day: d, month: m % 12, year: y, current: false, dateStr: toDateStr(y, m % 12, d) });
      }
    }

    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isPast = (dateStr: string) => dateStr < todayS;

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          onClick={prevMonth}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface transition-colors cursor-pointer text-navy"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-xs font-bold text-navy">{monthName}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface transition-colors cursor-pointer text-navy"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-muted py-0.5">
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((cell, i) => {
          const isSelected = cell.dateStr === value;
          const isToday = cell.dateStr === todayS;
          const past = isPast(cell.dateStr);
          const disabled = past || !cell.current;

          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => {
                if (!past) onChange(cell.dateStr);
              }}
              className={`
                relative h-7 flex items-center justify-center text-[11px] rounded-md transition-all cursor-pointer
                ${disabled && !isSelected ? 'cursor-default' : ''}
                ${!cell.current ? 'text-muted/30' : ''}
                ${cell.current && !isSelected && !isToday && !past ? 'text-navy hover:bg-orange/10' : ''}
                ${cell.current && past && !isSelected ? 'text-muted/40 cursor-not-allowed' : ''}
                ${isToday && !isSelected ? 'font-bold text-navy' : ''}
                ${isSelected ? 'bg-orange text-white font-bold shadow-sm shadow-orange/30' : ''}
              `}
            >
              {cell.day}
              {isToday && !isSelected && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
