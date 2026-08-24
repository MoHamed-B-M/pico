import React, { useState } from 'react';
import DoodleDropzone from './DoodleDropzone.jsx';

const PRESETS = [
  { label: '1920×1080', w: 1920, h: 1080 },
  { label: '1280×720', w: 1280, h: 720 },
  { label: '800×600', w: 800, h: 600 },
  { label: '640×480', w: 640, h: 480 },
  { label: '50%', w: 50, h: 50, percent: true },
  { label: '25%', w: 25, h: 25, percent: true },
];

export default function ResizePanel() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [lockAspect, setLockAspect] = useState(true);
  const [queue, setQueue] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">## resize</p>
        <h2 className="mt-2 text-xl font-bold uppercase tracking-tight text-ink">
          Change image dimensions
        </h2>
      </div>

      <DoodleDropzone onFilesSelected={(f) => setQueue((p) => [...p, ...f].slice(0, 30))} disabled={false} />

      <div className="term-panel p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="section-label block mb-1">width</label>
            <input
              type="number"
              value={width}
              onChange={(e) => {
                const w = Number(e.target.value);
                setWidth(w);
                if (lockAspect) setHeight(Math.round(w * 9 / 16));
              }}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink"
            />
          </div>
          <button
            type="button"
            onClick={() => setLockAspect(!lockAspect)}
            className={`mt-5 px-2 py-2 text-xs uppercase tracking-wider border ${lockAspect ? 'border-ink text-ink' : 'border-line text-ink-dim'}`}
          >
            {lockAspect ? '🔗' : '🔓'}
          </button>
          <div className="flex-1">
            <label className="section-label block mb-1">height</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink"
            />
          </div>
        </div>

        <div>
          <label className="section-label block mb-2">presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setWidth(p.w); setHeight(p.h); }}
                className="px-3 py-1.5 text-xs uppercase tracking-wider border border-line text-ink-dim hover:border-ink hover:text-ink transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" disabled={queue.length === 0} className="term-btn w-full disabled:opacity-40">
          [ resize {queue.length} file{queue.length !== 1 ? 's' : ''} ]
        </button>
      </div>
    </div>
  );
}
