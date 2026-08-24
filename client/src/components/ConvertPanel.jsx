import React, { useState } from 'react';
import LoadingState from './ui/loading-state.jsx';
import { TipButton } from './ToolTips.jsx';

const FORMATS = [
  { ext: 'jpg', label: 'JPEG' },
  { ext: 'png', label: 'PNG' },
  { ext: 'webp', label: 'WebP' },
  { ext: 'avif', label: 'AVIF' },
  { ext: 'tiff', label: 'TIFF' },
];

export default function ConvertPanel() {
  const [target, setTarget] = useState('webp');
  const [quality, setQuality] = useState(80);
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) setQueue((p) => [...p, ...files].slice(0, 30));
    e.target.value = '';
  }

  async function handleConvert() {
    if (queue.length === 0 || status === 'processing') return;
    setStatus('processing');
    setError('');
    try {
      const form = new FormData();
      queue.forEach((f) => form.append('images', f));
      form.append('format', target);
      form.append('quality', String(quality));
      const res = await fetch('/api/convert', { method: 'POST', body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResults((p) => [...p, ...data.files]);
      setQueue([]);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'convert failed');
      setStatus('error');
    }
  }

  function reset() { setQueue([]); setResults([]); setError(''); setStatus('idle'); }

  const busy = status === 'processing';

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">## convert</p>
        <h2 className="mt-2 text-xl font-bold uppercase tracking-tight text-ink">Change image format</h2>
      </div>

      <div className="flex justify-end"><TipButton tool="convert" /></div>

      {/* Upload */}
      <label className="term-panel flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-surf-muted transition-colors">
        <span className="text-2xl mb-2">↻</span>
        <span className="text-sm uppercase tracking-wider text-ink-dim">
          {queue.length > 0 ? `${queue.length} file${queue.length !== 1 ? 's' : ''} staged` : 'click to select images'}
        </span>
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
      </label>

      {/* Settings */}
      <div className="term-panel p-4 space-y-4">
        <div>
          <label className="section-label block mb-2">convert to</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {FORMATS.map((fmt) => (
              <button key={fmt.ext} type="button" onClick={() => setTarget(fmt.ext)}
                className={`px-3 py-2.5 text-sm uppercase tracking-wider border transition-colors
                  ${target === fmt.ext
                    ? 'border-ink bg-surf-raised text-ink font-bold'
                    : 'border-line text-ink-dim hover:border-ink hover:text-ink'
                  }`}>
                {fmt.label}
                <span className="block text-[10px] font-normal normal-case tracking-normal">.{fmt.ext}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="section-label block mb-1">quality ({quality})</label>
          <input type="range" min={10} max={100} value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-ink" />
        </div>

        <button type="button" onClick={handleConvert} disabled={busy || queue.length === 0}
          className={`term-btn w-full ${busy ? 'pico-shimmer overflow-hidden' : ''} disabled:opacity-40`}>
          {busy ? 'converting...' : `[ convert ${queue.length} file${queue.length !== 1 ? 's' : ''} → ${target} ]`}
        </button>

        {busy && <div className="flex justify-center"><LoadingState label="converting" variant="Drive" /></div>}
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
                <p className="text-xs text-ink-dim">{r.format}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-xs text-ink-dim">{(r.originalSize / 1024).toFixed(0)}KB → {(r.compressedSize / 1024).toFixed(0)}KB ({r.savedPercentage}% saved)</span>
                <a href={r.downloadUrl} download className="term-btn !px-3 !py-1 !text-xs">↓ save</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
