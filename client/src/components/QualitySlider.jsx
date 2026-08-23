import React from 'react';

export default function QualitySlider({ value, onChange, disabled }) {
  const label =
    value >= 90 ? 'lossless-ish' : value >= 60 ? 'balanced' : 'aggressive';

  return (
    <div className="term-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <label htmlFor="quality" className="text-[length:var(--text-2xl)] uppercase tracking-wider text-ink-mid">
          quality
        </label>
        <span
          className={`inline-flex items-baseline gap-1 border px-2.5 py-1 text-base font-bold tabular-nums ${
            disabled
              ? 'border-line text-ink-dim'
              : 'border-line bg-surf-raised text-ink'
          }`}
        >
          {value}
          <span className="text-[length:var(--text-md)] font-medium">%</span>
        </span>
      </div>

      <input
        id="quality"
        type="range"
        min="10"
        max="100"
        step="1"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="pico-range"
        aria-valuetext={`${value} percent quality`}
      />

      <div className="mt-2 flex justify-between text-[length:var(--text-sm)] uppercase tracking-wider text-ink-dim">
        <span>10 · tiny</span>
        <span className="text-ink-inv">{label}</span>
        <span>100 · fidelity</span>
      </div>
    </div>
  );
}
