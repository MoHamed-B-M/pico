import React from 'react';
import { formatBytes } from '../lib/formatBytes.js';

function ResultCard({ file }) {
  return (
    <li className="result-card flex flex-col gap-4 border border-line bg-surf-muted p-4 sm:flex-row sm:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-line bg-surf-base">
        <img
          src={file.downloadUrl}
          alt={file.originalName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[length:var(--text-xl)] text-ink" title={file.originalName}>
          <span aria-hidden="true" className="text-ink-dim">✓ </span>
          {file.originalName}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[length:var(--text-md)] tabular-nums">
          <span className="text-ink-dim line-through decoration-line">
            {formatBytes(file.originalSize)}
          </span>
          <span aria-hidden="true" className="text-ink-dim">→</span>
          <span className="font-medium text-ink-mid">
            {formatBytes(file.compressedSize)}
          </span>
          <span className="text-ink-dim">
            {file.format.toLowerCase()} · q{file.quality}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <span className="savings-badge border border-line bg-surf-raised px-2.5 py-1 text-sm font-bold tabular-nums text-ink">
          −{file.savedPercentage}%
        </span>
        <a
          href={file.downloadUrl}
          download={file.originalName.replace(/\.(jpe?g|png|webp|avif)$/i, '.compressed$1')}
          className="border border-line px-3 py-1.5 text-[length:var(--text-md)] uppercase tracking-wider text-ink-inv no-underline transition-colors duration-[var(--dur-fast)] hover:border-ink-dim hover:bg-surf-raised hover:text-ink focus-visible:bg-surf-raised active:bg-ink active:text-[color:var(--color-accent-ink)]"
        >
          [ save ]
        </a>
      </div>
    </li>
  );
}

export default function ResultsList({ listRef, results, failures, onClear }) {
  if (results.length === 0 && failures.length === 0) return null;

  const totalOriginal = results.reduce((s, f) => s + f.originalSize, 0);
  const totalCompressed = results.reduce((s, f) => s + f.compressedSize, 0);
  const totalSaved =
    totalOriginal > 0
      ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
      : 0;

  return (
    <section ref={listRef} aria-live="polite" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[length:var(--text-lg)] uppercase tracking-wider text-ink-dim">
          results · {results.length} ·{' '}
          <span className="text-ink-inv">−{totalSaved}% total</span>
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-[length:var(--text-md)] uppercase tracking-wider text-ink-dim transition-colors duration-[var(--dur-fast)] hover:text-ink"
        >
          [ clear ]
        </button>
      </div>

      <ul className="space-y-3">
        {results.map((file) => (
          <ResultCard key={file.id} file={file} />
        ))}
      </ul>

      {failures.length > 0 && (
        <ul className="space-y-2">
          {failures.map((f, i) => (
            <li
              key={`${f.originalName}-${i}`}
              className="result-card border border-err/60 bg-surf-muted px-4 py-3 text-xs text-err"
            >
              ✕ {f.originalName} — {f.reason}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
