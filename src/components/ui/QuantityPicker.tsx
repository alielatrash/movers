'use client';

interface QuantityPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
}: QuantityPickerProps) {
  return (
    <div className="flex items-center gap-4">
      {label && <span className="text-sm text-navy-mid">{label}</span>}
      <div className="flex items-center gap-0 rounded-xl border-2 border-navy-light overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-11 h-11 flex items-center justify-center text-lg font-bold text-navy hover:bg-navy-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          −
        </button>
        <span className="w-12 h-11 flex items-center justify-center text-base font-bold text-navy bg-surface border-x-2 border-navy-light">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-11 h-11 flex items-center justify-center text-lg font-bold text-navy hover:bg-navy-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
