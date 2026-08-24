import React, { useState } from 'react';
import DoodleDropzone from './DoodleDropzone.jsx';

const FORMATS = [
  { ext: 'jpg', label: 'JPEG', mime: 'image/jpeg' },
  { ext: 'png', label: 'PNG', mime: 'image/png' },
  { ext: 'webp', label: 'WebP', mime: 'image/webp' },
  { ext: 'avif', label: 'AVIF', mime: 'image/avif' },
  { ext: 'tiff', label: 'TIFF', mime: 'image/tiff' },
  { ext: 'jxl', label: 'JPEG XL', mime: 'image/jxl' },
];

export default function ConvertPanel() {
  const [target, setTarget] = useState('webp');
  const [quality, setQuality] = useState(80);
  const [queue, setQueue] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">## convert</p>
        <h2 className="mt-2 text-xl font-bold uppercase tracking-tight text-ink">
          Change image format
        </h2>
      </div>

      <DoodleDropzone onFilesSelected={(f) => setQueue((p) => [...p, ...f].slice(0, 30))} disabled={false} />

      <div className="term-panel p-4 space-y-4">
        <div>
          <label className="section-label block mb-2">convert to</label>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map((fmt) => (
              <button
                key={fmt.ext}
                type="button"
                onClick={() => setTarget(fmt.ext)}
                className={`
                  px-3 py-2.5 text-sm uppercase tracking-wider border transition-colors
                  ${target === fmt.ext
                    ? 'border-ink bg-surf-raised text-ink font-bold'
                    : 'border-line text-ink-dim hover:border-ink hover:text-ink'
                  }
                `}
              >
                {fmt.label}
                <span className="block text-[10px] font-normal normal-case tracking-normal">.{fmt.ext}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="section-label block mb-1">quality ({quality})</label>
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-ink"
          />
        </div>

        <button type="button" disabled={queue.length === 0} className="term-btn w-full disabled:opacity-40">
          [ convert {queue.length} file{queue.length !== 1 ? 's' : ''} → {target} ]
        </button>
      </div>
    </div>
  );
}
