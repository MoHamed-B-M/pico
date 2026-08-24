import React, { useState } from 'react';
import LoadingState from './ui/loading-state.jsx';
import { TipButton } from './ToolTips.jsx';

export default function CutPanel() {
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(400);
  const [cropH, setCropH] = useState(400);
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) setQueue((p) => [...p, ...files].slice(0, 30));
    e.target.value = '';
  }

  async function handleCrop() {
    if (queue.length === 0 || status === 'processing') return;
    setStatus('processing');
    setError('');
    try {
      const form = new FormData();
      queue.forEach((f) => form.append('images', f));
      form.append('x', String(cropX));
      form.append('y', String(cropY));
      form.append('width', String(cropW));
      form.append('height', String(cropH));
      const res = await fetch('/api/crop', { method: 'POST', body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResults((p) => [...p, ...data.files]);
      setQueue([]);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'crop failed');
      setStatus('error');
    }
  }

  function reset() { setQueue([]); setResults([]); setError(''); setStatus('idle'); }

  const busy = status === 'processing';

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">## cut</p>
        <h2 className="mt-2 text-xl font-bold uppercase tracking-tight text-ink">Crop & trim images</h2>
      </div>

      <div className="flex justify-end"><TipButton tool="cut" /></div>

      {/* Upload */}
      <label className="term-panel flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-surf-muted transition-colors">
        <span className="text-2xl mb-2">✂</span>
        <span className="text-sm uppercase tracking-wider text-ink-dim">
          {queue.length > 0 ? `${queue.length} file${queue.length !== 1 ? 's' : ''} staged` : 'click to select images'}
        </span>
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
      </label>

      {/* Settings */}
      <div className="term-panel p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="section-label block mb-1">x offset</label>
            <input type="number" value={cropX} min={0}
              onChange={(e) => setCropX(Number(e.target.value))}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink" />
          </div>
          <div>
            <label className="section-label block mb-1">y offset</label>
            <input type="number" value={cropY} min={0}
              onChange={(e) => setCropY(Number(e.target.value))}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink" />
          </div>
          <div>
            <label className="section-label block mb-1">width</label>
            <input type="number" value={cropW} min={1}
              onChange={(e) => setCropW(Number(e.target.value))}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink" />
          </div>
          <div>
            <label className="section-label block mb-1">height</label>
            <input type="number" value={cropH} min={1}
              onChange={(e) => setCropH(Number(e.target.value))}
              className="w-full bg-surf-base border border-line px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-ink" />
          </div>
        </div>

        <p className="text-xs text-ink-dim">
          crop area: {cropW}×{cropH}px from ({cropX},{cropY})
        </p>

        <button type="button" onClick={handleCrop} disabled={busy || queue.length === 0}
          className={`term-btn w-full ${busy ? 'pico-shimmer overflow-hidden' : ''} disabled:opacity-40`}>
          {busy ? 'cropping...': `[ cut ${queue.length} file${queue.length !== 1 ? 's' : ''} ]`}
        </button>

        {busy && <div className="flex justify-center"><LoadingState label="cropping" variant="Drive" /></div>}
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
