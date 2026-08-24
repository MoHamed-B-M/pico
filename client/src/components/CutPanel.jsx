import React, { useState } from 'react';
import DoodleDropzone from './DoodleDropzone.jsx';

export default function CutPanel() {
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [unit, setUnit] = useState('px');
  const [queue, setQueue] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">## cut</p>
        <h2 className="mt-2 text-xl font-bold uppercase tracking-tight text-ink">
          Crop & trim images
        </h2>
      </div>

      <DoodleDropzone onFilesSelected={(f) => setQueue((p) => [...p, ...f].slice(0, 30))} disabled={false} />

      <div className="term-panel p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="section-label block mb-1">x offset</label>
            <input
              type="number"
              value={crop.x}
              onChange={(e) => setCrop({ ...crop, x: Number(e.target.value) })}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink"
            />
          </div>
          <div className="flex-1">
            <label className="section-label block mb-1">y offset</label>
            <input
              type="number"
              value={crop.y}
              onChange={(e) => setCrop({ ...crop, y: Number(e.target.value) })}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink"
            />
          </div>
          <div className="flex-1">
            <label className="section-label block mb-1">width</label>
            <input
              type="number"
              value={crop.w}
              onChange={(e) => setCrop({ ...crop, w: Number(e.target.value) })}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink"
            />
          </div>
          <div className="flex-1">
            <label className="section-label block mb-1">height</label>
            <input
              type="number"
              value={crop.h}
              onChange={(e) => setCrop({ ...crop, h: Number(e.target.value) })}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {['px', '%'].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${unit === u ? 'border-ink text-ink' : 'border-line text-ink-dim'}`}
            >
              {u}
            </button>
          ))}
        </div>

        <button type="button" disabled={queue.length === 0} className="term-btn w-full disabled:opacity-40">
          [ cut {queue.length} file{queue.length !== 1 ? 's' : ''} ]
        </button>
      </div>
    </div>
  );
}
