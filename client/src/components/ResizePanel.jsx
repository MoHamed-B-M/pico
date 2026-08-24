import React, { useState } from 'react';
import LoadingState from './ui/loading-state.jsx';
import { ResizeTip } from './ToolTips.jsx';

const PRESETS = [
  { label: '1920×1080', w: 1920, h: 1080 },
  { label: '1280×720', w: 1280, h: 720 },
  { label: '800×600', w: 800, h: 600 },
  { label: '640×480', w: 640, h: 480 },
  { label: '400×300', w: 400, h: 300 },
];

export default function ResizePanel() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockAspect, setLockAspect] = useState(true);
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) setQueue((p) => [...p, ...files].slice(0, 30));
    e.target.value = '';
  }

  async function handleResize() {
    if (queue.length === 0 || status === 'processing') return;
    setStatus('processing');
    setError('');
    try {
      const form = new FormData();
      queue.forEach((f) => form.append('images', f));
      form.append('width', String(width));
      form.append('height', String(height));
      const res = await fetch('/api/resize', { method: 'POST', body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResults((p) => [...p, ...data.files]);
      setQueue([]);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'resize failed');
      setStatus('error');
    }
  }

  function reset() { setQueue([]); setResults([]); setError(''); setStatus('idle'); }

  const busy = status === 'processing';

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">## resize</p>
        <h2 className="mt-2 text-xl font-bold uppercase tracking-tight text-ink">Change image dimensions</h2>
      </div>

      <ResizeTip />

      {/* Upload */}
      <label className="term-panel flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-surf-muted transition-colors">
        <span className="text-2xl mb-2">⊞</span>
        <span className="text-sm uppercase tracking-wider text-ink-dim">
          {queue.length > 0 ? `${queue.length} file${queue.length !== 1 ? 's' : ''} staged` : 'click to select images'}
        </span>
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
      </label>

      {/* Settings */}
      <div className="term-panel p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="section-label block mb-1">width (px)</label>
            <input type="number" value={width} min={1} max={10000}
              onChange={(e) => { const w = Number(e.target.value); setWidth(w); if (lockAspect && w > 0) setHeight(Math.round(w * 3 / 4)); }}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink" />
          </div>
          <button type="button" onClick={() => setLockAspect(!lockAspect)}
            className={`mt-5 px-2 py-2 text-xs border ${lockAspect ? 'border-ink text-ink' : 'border-line text-ink-dim'}`}>
            {lockAspect ? 'link' : 'unlinked'}
          </button>
          <div className="flex-1">
            <label className="section-label block mb-1">height (px)</label>
            <input type="number" value={height} min={1} max={10000}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink" />
          </div>
        </div>

        <div>
          <label className="section-label block mb-2">presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} type="button"
                onClick={() => { setWidth(p.w); setHeight(p.h); }}
                className="px-3 py-1.5 text-xs uppercase tracking-wider border border-line text-ink-dim hover:border-ink hover:text-ink transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleResize} disabled={busy || queue.length === 0}
          className={`term-btn w-full ${busy ? 'pico-shimmer overflow-hidden' : ''} disabled:opacity-40`}>
          {busy ? 'resizing...' : `[ resize ${queue.length} file${queue.length !== 1 ? 's' : ''} ]`}
        </button>

        {busy && <div className="flex justify-center"><LoadingState label="resizing" variant="Drive" /></div>}
        {error && <p className="border border-err/60 bg-surf-muted px-4 py-3 text-xs text-err">✕ {error}</p>}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="section-label">results ({results.length})</p>
            <button type="button" onClick={reset} className="text-xs uppercase tracking-wider text-ink-dim hover:text-ink">[ clear ]</button>
          </div>
          {results.map((r) => (
            <div key={r.id} className="term-panel flex items-center justify-between p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink truncate">{r.originalName}</p>
                <p className="text-xs text-ink-dim">
                  {r.dimensions?.width}×{r.dimensions?.height}px · {r.format}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-xs text-ink-dim">{(r.originalSize / 1024).toFixed(0)}KB → {(r.compressedSize / 1024).toFixed(0)}KB</span>
                <a href={r.downloadUrl} download className="term-btn !px-3 !py-1 !text-xs">↓ save</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
