import React from 'react';

export function ResizeTip() {
  return (
    <div className="flex items-center gap-3 term-panel px-4 py-3 overflow-hidden">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="shrink-0">
        {/* Outer box (original size) */}
        <rect x="4" y="4" width="40" height="40" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" className="text-ink-dim" />

        {/* Inner box (resized) — animates */}
        <rect x="14" y="14" width="20" height="20" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-ink">
          <animate attributeName="x" values="14;10;14" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y" values="14;10;14" dur="2s" repeatCount="indefinite" />
          <animate attributeName="width" values="20;28;20" dur="2s" repeatCount="indefinite" />
          <animate attributeName="height" values="20;28;20" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Corner arrows */}
        <path d="M10 4L4 4L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-ink">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M38 44L44 44L44 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-ink">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </path>
      </svg>
      <p className="text-xs text-ink-dim leading-relaxed">
        Set target <span className="text-ink font-medium">width</span> and <span className="text-ink font-medium">height</span> in pixels.
        Lock aspect ratio to scale proportionally, or use a preset.
      </p>
    </div>
  );
}

export function CutTip() {
  return (
    <div className="flex items-center gap-3 term-panel px-4 py-3 overflow-hidden">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="shrink-0">
        {/* Full image */}
        <rect x="4" y="4" width="40" height="40" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-ink-dim" />

        {/* Crop selection — animates */}
        <rect x="8" y="8" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="text-ink">
          <animate attributeName="x" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="y" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="width" values="16;24;16" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="height" values="16;24;16" dur="2.5s" repeatCount="indefinite" />
        </rect>

        {/* Crop handle dots */}
        <circle cx="8" cy="8" r="2" fill="currentColor" className="text-ink">
          <animate attributeName="cx" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="cy" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="24" cy="24" r="2" fill="currentColor" className="text-ink">
          <animate attributeName="cx" values="24;40;24" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="cy" values="24;40;24" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Scissors icon */}
        <text x="20" y="30" fontSize="10" className="text-ink-dim">✂</text>
      </svg>
      <p className="text-xs text-ink-dim leading-relaxed">
        Set <span className="text-ink font-medium">x</span> and <span className="text-ink font-medium">y</span> offset, then <span className="text-ink font-medium">width</span> and <span className="text-ink font-medium">height</span> of the crop area.
        Everything outside the box is removed.
      </p>
    </div>
  );
}

export function ConvertTip() {
  return (
    <div className="flex items-center gap-3 term-panel px-4 py-3 overflow-hidden">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="shrink-0">
        {/* Source format */}
        <rect x="2" y="12" width="16" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-ink-dim" />
        <text x="10" y="27" textAnchor="middle" fontSize="6" fill="currentColor" className="text-ink-dim" fontWeight="bold">JPG</text>

        {/* Arrow — animates */}
        <path d="M22 24H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-ink">
          <animate attributeName="d" values="M20 24H28;M22 24H30;M20 24H28" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M27 21L30 24L27 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
          <animate attributeName="transform" values="translate(0,0);translate(2,0);translate(0,0)" dur="1.5s" repeatCount="indefinite" />
        </path>

        {/* Target format — pulses */}
        <rect x="32" y="12" width="16" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-ink">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </rect>
        <text x="40" y="27" textAnchor="middle" fontSize="6" fill="currentColor" className="text-ink" fontWeight="bold">
          WEBP
          <animate attributeName="textContent" values="WEBP;PNG;AVIF;WEBP" dur="3s" repeatCount="indefinite" />
        </text>
      </svg>
      <p className="text-xs text-ink-dim leading-relaxed">
        Pick a <span className="text-ink font-medium">target format</span> and adjust <span className="text-ink font-medium">quality</span>.
        WebP and AVIF give the best compression. TIFF preserves maximum detail.
      </p>
    </div>
  );
}

export function CompressTip() {
  return (
    <div className="flex items-center gap-3 term-panel px-4 py-3 overflow-hidden">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="shrink-0">
        {/* Top arrow pushing down */}
        <path d="M24 4V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-ink-dim">
          <animate attributeName="d" values="M24 4V14;M24 6V14;M24 4V14" dur="1s" repeatCount="indefinite" />
        </path>
        <path d="M20 10L24 14L28 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-dim">
          <animate attributeName="transform" values="translate(0,0);translate(0,2);translate(0,0)" dur="1s" repeatCount="indefinite" />
        </path>

        {/* File being compressed — shrinks */}
        <rect x="12" y="16" width="24" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-ink">
          <animate attributeName="height" values="28;20;28" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y" values="16;24;16" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Compression lines */}
        <line x1="16" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="1" className="text-ink-dim">
          <animate attributeName="y1" values="22;26;22" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="22;26;22" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="16" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="1" className="text-ink-dim">
          <animate attributeName="y1" values="28;30;28" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="28;30;28" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="16" y1="34" x2="30" y2="34" stroke="currentColor" strokeWidth="1" className="text-ink-dim">
          <animate attributeName="y1" values="34;35;34" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="34;35;34" dur="2s" repeatCount="indefinite" />
        </line>
      </svg>
      <p className="text-xs text-ink-dim leading-relaxed">
        Drag images or videos onto the dropzone. Set <span className="text-ink font-medium">quality</span> (10 = tiny, 100 = near-lossless) and press compress.
        Results show original vs compressed size.
      </p>
    </div>
  );
}
