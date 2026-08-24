import React, { useState } from 'react';

function TipsPopup({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Popup */}
      <div
        className="relative z-10 w-full max-w-sm border border-line bg-surf-base/80 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <span className="section-label">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 px-2 py-1 text-xs uppercase tracking-wider text-ink-dim hover:text-ink transition-colors"
          >
            [ ✕ ]
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG Animations                                                     */
/* ------------------------------------------------------------------ */

function CompressSvg() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mx-auto">
      {/* Top arrow pushing down */}
      <path d="M60 8V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-dim">
        <animate attributeName="d" values="M60 8V28;M60 12V28;M60 8V28" dur="1s" repeatCount="indefinite" />
      </path>
      <path d="M54 22L60 28L66 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-dim">
        <animate attributeName="transform" values="translate(0,0);translate(0,4);translate(0,0)" dur="1s" repeatCount="indefinite" />
      </path>

      {/* File being compressed — shrinks */}
      <rect x="30" y="32" width="60" height="60" rx="3" stroke="currentColor" strokeWidth="2" className="text-ink">
        <animate attributeName="height" values="60;40;60" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y" values="32;52;32" dur="2s" repeatCount="indefinite" />
      </rect>

      {/* Compression lines */}
      <line x1="40" y1="44" x2="80" y2="44" stroke="currentColor" strokeWidth="1.5" className="text-ink-dim">
        <animate attributeName="y1" values="44;54;44" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y2" values="44;54;44" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="40" y1="56" x2="72" y2="56" stroke="currentColor" strokeWidth="1.5" className="text-ink-dim">
        <animate attributeName="y1" values="56;62;56" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y2" values="56;62;56" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="40" y1="68" x2="76" y2="68" stroke="currentColor" strokeWidth="1.5" className="text-ink-dim">
        <animate attributeName="y1" values="68;70;68" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y2" values="68;70;68" dur="2s" repeatCount="indefinite" />
      </line>
    </svg>
  );
}

function ResizeSvg() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mx-auto">
      {/* Outer box (original size) */}
      <rect x="15" y="10" width="90" height="80" rx="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 3" className="text-ink-dim" />

      {/* Inner box (resized) — animates */}
      <rect x="35" y="25" width="50" height="50" rx="2" stroke="currentColor" strokeWidth="2" className="text-ink">
        <animate attributeName="x" values="35;25;35" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y" values="25;15;25" dur="2s" repeatCount="indefinite" />
        <animate attributeName="width" values="50;70;50" dur="2s" repeatCount="indefinite" />
        <animate attributeName="height" values="50;70;50" dur="2s" repeatCount="indefinite" />
      </rect>

      {/* Corner arrows */}
      <path d="M25 10L15 10L15 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M85 90L95 90L95 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </path>

      {/* Dimension labels */}
      <text x="60" y="58" textAnchor="middle" fontSize="8" fill="currentColor" className="text-ink-dim" fontFamily="monospace">
        w×h
      </text>
    </svg>
  );
}

function CutSvg() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mx-auto">
      {/* Full image */}
      <rect x="15" y="10" width="90" height="80" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-ink-dim" />

      {/* Crop selection — animates */}
      <rect x="25" y="20" width="40" height="35" rx="2" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" className="text-ink">
        <animate attributeName="x" values="25;45;25" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="y" values="20;40;20" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="width" values="40;55;40" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="height" values="35;45;35" dur="2.5s" repeatCount="indefinite" />
      </rect>

      {/* Corner handles */}
      <circle r="3" fill="currentColor" className="text-ink">
        <animate attributeName="cx" values="25;45;25" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="20;40;20" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle r="3" fill="currentColor" className="text-ink">
        <animate attributeName="cx" values="65;100;65" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="55;85;55" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle r="3" fill="currentColor" className="text-ink-dim">
        <animate attributeName="cx" values="65;100;65" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="20;40;20" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle r="3" fill="currentColor" className="text-ink-dim">
        <animate attributeName="cx" values="25;45;25" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="55;85;55" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function ConvertSvg() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mx-auto">
      {/* Source format */}
      <rect x="10" y="25" width="30" height="50" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-ink-dim" />
      <text x="25" y="55" textAnchor="middle" fontSize="10" fill="currentColor" className="text-ink-dim" fontWeight="bold" fontFamily="monospace">JPG</text>

      {/* Arrow — animates */}
      <path d="M48 50H68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink">
        <animate attributeName="d" values="M46 50H66;M50 50H70;M46 50H66" dur="1.5s" repeatCount="indefinite" />
      </path>
      <path d="M63 44L70 50L63 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
        <animate attributeName="transform" values="translate(0,0);translate(4,0);translate(0,0)" dur="1.5s" repeatCount="indefinite" />
      </path>

      {/* Target format — pulses */}
      <rect x="80" y="25" width="30" height="50" rx="3" stroke="currentColor" strokeWidth="2" className="text-ink">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
      </rect>

      {/* Morphing format labels */}
      <text x="95" y="51" textAnchor="middle" fontSize="10" fill="currentColor" className="text-ink" fontWeight="bold" fontFamily="monospace">
        <animate attributeName="textContent" values="WEBP;PNG;AVIF;WEBP" dur="3s" repeatCount="indefinite" />
        WEBP
      </text>
      <text x="95" y="64" textAnchor="middle" fontSize="6" fill="currentColor" className="text-ink-dim" fontFamily="monospace">.webp</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tooltip content configs                                            */
/* ------------------------------------------------------------------ */

const TIPS = {
  compress: {
    title: '## how to compress',
    svg: CompressSvg,
    lines: [
      { text: 'Drag images or videos onto the dropzone', highlight: false },
      { text: 'Set quality (10 = tiny, 100 = near-lossless)', highlight: true, key: 'quality' },
      { text: 'Press compress — results show original vs compressed', highlight: false },
    ],
  },
  resize: {
    title: '## how to resize',
    svg: ResizeSvg,
    lines: [
      { text: 'Select images to resize', highlight: false },
      { text: 'Set target width and/or height in pixels', highlight: true, key: 'width/height' },
      { text: 'Lock aspect ratio to scale proportionally', highlight: false },
    ],
  },
  cut: {
    title: '## how to cut',
    svg: CutSvg,
    lines: [
      { text: 'Select images to crop', highlight: false },
      { text: 'Set x/y offset for crop origin', highlight: true, key: 'x/y' },
      { text: 'Set width and height of the crop area', highlight: true, key: 'width/height' },
      { text: 'Everything outside the box is removed', highlight: false },
    ],
  },
  convert: {
    title: '## how to convert',
    svg: ConvertSvg,
    lines: [
      { text: 'Select images to convert', highlight: false },
      { text: 'Pick a target format from the grid', highlight: true, key: 'format' },
      { text: 'Adjust quality — WebP/AVIF give best compression', highlight: false },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Public components                                                  */
/* ------------------------------------------------------------------ */

function TipButton({ tool }) {
  const [open, setOpen] = useState(false);
  const tip = TIPS[tool];
  if (!tip) return null;
  const Svg = tip.svg;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs uppercase tracking-wider text-ink-dim hover:border-ink hover:text-ink transition-colors"
      >
        <span className="text-ink">?</span> show tips
      </button>

      {open && (
        <TipsPopup title={tip.title} onClose={() => setOpen(false)}>
          <div className="text-ink">
            <Svg />
          </div>
          <ul className="space-y-2">
            {tip.lines.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                <span className="text-ink-dim mt-0.5">›</span>
                {line.highlight ? (
                  <span>{line.text.split(line.key)[0]}<span className="text-ink font-medium">{line.key}</span>{line.text.split(line.key).slice(1).join(line.key)}</span>
                ) : (
                  <span className="text-ink-dim">{line.text}</span>
                )}
              </li>
            ))}
          </ul>
        </TipsPopup>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline tips (compressed view in main compress flow)                */
/* ------------------------------------------------------------------ */

function InlineTip({ tool }) {
  const [open, setOpen] = useState(false);
  const tip = TIPS[tool];
  if (!tip) return null;
  const Svg = tip.svg;

  return (
    <>
      <div className="flex items-center justify-between term-panel px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-ink text-sm">?</span>
          <span className="text-xs text-ink-dim">Quick tip: {tip.lines[0].text.toLowerCase()}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs uppercase tracking-wider text-ink-dim hover:text-ink transition-colors"
        >
          [ expand ]
        </button>
      </div>

      {open && (
        <TipsPopup title={tip.title} onClose={() => setOpen(false)}>
          <div className="text-ink">
            <Svg />
          </div>
          <ul className="space-y-2">
            {tip.lines.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                <span className="text-ink-dim mt-0.5">›</span>
                {line.highlight ? (
                  <span>{line.text.split(line.key)[0]}<span className="text-ink font-medium">{line.key}</span>{line.text.split(line.key).slice(1).join(line.key)}</span>
                ) : (
                  <span className="text-ink-dim">{line.text}</span>
                )}
              </li>
            ))}
          </ul>
        </TipsPopup>
      )}
    </>
  );
}

export { TipButton, InlineTip };
