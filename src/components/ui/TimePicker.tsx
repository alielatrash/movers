'use client';

interface TimePickerProps {
  value: string; // "HH:00" (24h format)
  onChange: (time: string) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6..22

function formatHour(h: number): string {
  if (h === 0 || h === 12) return `12 ${h < 12 ? 'AM' : 'PM'}`;
  return `${h > 12 ? h - 12 : h} ${h < 12 ? 'AM' : 'PM'}`;
}

function toValue(h: number): string {
  return `${h < 10 ? '0' : ''}${h}:00`;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {HOURS.map(h => {
        const val = toValue(h);
        const selected = value === val;
        return (
          <button
            key={h}
            type="button"
            onClick={() => onChange(val)}
            className={`
              px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer
              ${selected
                ? 'bg-orange text-white shadow-sm shadow-orange/30'
                : 'bg-surface text-navy hover:bg-orange/10 border border-border hover:border-orange/30'
              }
            `}
          >
            {formatHour(h)}
          </button>
        );
      })}
    </div>
  );
}
