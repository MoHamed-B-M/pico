import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useIntro } from './animations/useIntro.js';
import { useResultStagger } from './animations/useResultStagger.js';
import DoodleDropzone from './components/DoodleDropzone.jsx';
import QualitySlider from './components/QualitySlider.jsx';
import ResultsList from './components/ResultsList.jsx';
import LoadingState from './components/ui/loading-state.jsx';
import HandwritingSvg from './components/ui/handwriting-svg.jsx';
import Sidebar, { MobileNav } from './components/Sidebar.jsx';
import { TipButton } from './components/ToolTips.jsx';
import ResizePanel from './components/ResizePanel.jsx';
import CutPanel from './components/CutPanel.jsx';
import ConvertPanel from './components/ConvertPanel.jsx';

gsap.registerPlugin(useGSAP);

const IMAGE_ALLOWED = /\.(jpe?g|png|webp|avif|tiff?|jxl)$/i;
const VIDEO_ALLOWED = /\.(mp4|webm|mov|mkv|avi)$/i;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const TAGLINE = 'Local-first image & video compressor. No cloud, no limits, 100% private.';

export default function App() {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const pulseTween = useRef(null);

  const [tool, setTool] = useState('compress');
  const [queue, setQueue] = useState([]);
  const [quality, setQuality] = useState(75);
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [failures, setFailures] = useState([]);
  const [error, setError] = useState('');
  const [booting, setBooting] = useState(true);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (booting) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(TAGLINE.slice(0, i));
      if (i >= TAGLINE.length) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [booting]);

  useIntro(rootRef, !booting);

  useGSAP(
    () => {
      if (status === 'compressing') {
        pulseTween.current = gsap.to(buttonRef.current, {
          opacity: 0.75, repeat: -1, yoyo: true, duration: 0.6, ease: 'sine.inOut',
        });
      } else {
        pulseTween.current?.kill();
        gsap.set(buttonRef.current, { clearProps: 'opacity' });
      }
    },
    { scope: rootRef, dependencies: [status], revertOnUpdate: false }
  );

  useResultStagger(listRef, results);

  const handleFilesSelected = useCallback((files) => {
    const valid = [];
    const rejected = [];
    for (const f of files) {
      const isImage = IMAGE_ALLOWED.test(f.name);
      const isVideo = VIDEO_ALLOWED.test(f.name);
      const isMedia = f.type?.startsWith('image/') || f.type?.startsWith('video/');
      if ((!isImage && !isVideo) || !isMedia) {
        rejected.push(`${f.name} — unsupported type`);
      } else if (isImage && f.size > MAX_IMAGE_BYTES) {
        rejected.push(`${f.name} — image larger than 25 MB`);
      } else if (isVideo && f.size > MAX_VIDEO_BYTES) {
        rejected.push(`${f.name} — video larger than 200 MB`);
      } else if (f.size === 0) {
        rejected.push(`${f.name} — empty file`);
      } else {
        valid.push(f);
      }
    }
    setError(rejected.length ? `err: skipped ${rejected.join('; ')}` : '');
    if (valid.length > 0) setQueue((prev) => [...prev, ...valid].slice(0, 30));
  }, []);

  async function handleCompress() {
    if (queue.length === 0 || status === 'compressing') return;
    setStatus('compressing');
    setError('');
    try {
      const form = new FormData();
      queue.forEach((f) => form.append('images', f));
      form.append('quality', String(quality));
      const res = await fetch('/api/compress', { method: 'POST', body: form });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) throw new Error(payload?.error ?? `server responded with ${res.status}`);
      setResults((prev) => [...prev, ...payload.files]);
      setFailures(payload.failures ?? []);
      setStatus('done');
      setQueue([]);
    } catch (err) {
      setError(err.message || 'compression failed — is the pico server still running?');
      setStatus('error');
    }
  }

  function reset() { setQueue([]); setResults([]); setFailures([]); setError(''); setStatus('idle'); }

  const busy = status === 'compressing';

  function CompressView() {
    return (
      <>
        <header className="js-intro mb-4 border-b border-line pb-4">
          <p className="term-caret text-sm text-ink-mid sm:text-base">
            <span className="text-ink">pico</span> --compress --local --no-cloud
          </p>
          <p className="mt-2 min-h-[1.6em] text-xs text-ink-dim sm:text-sm" aria-live="polite">{typed}</p>
        </header>

        <main className="space-y-6">
          <div className="js-intro flex justify-end"><TipButton tool="compress" /></div>
          <div className="js-intro space-y-4">
            <DoodleDropzone onFilesSelected={handleFilesSelected} disabled={busy} />
            {queue.length > 0 && (
              <div className="term-panel flex flex-wrap items-center gap-2 p-3">
                <span className="bg-surf-raised px-2 py-1 text-[length:var(--text-md)] font-medium uppercase tracking-wider text-ink-inv">
                  {queue.length} staged
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-1.5 overflow-hidden">
                  {queue.slice(0, 6).map((f, i) => (
                    <span key={`${f.name}-${i}`} className="max-w-[180px] truncate bg-surf-muted px-2 py-1 text-[length:var(--text-md)] text-ink-dim">
                      {f.name}
                    </span>
                  ))}
                  {queue.length > 6 && (
                    <span className="bg-surf-muted px-2 py-1 text-[length:var(--text-md)] text-ink-dim">+{queue.length - 6} more</span>
                  )}
                </div>
                <button type="button" onClick={() => setQueue([])} disabled={busy}
                  className="px-2 py-1 text-[length:var(--text-md)] uppercase tracking-wider text-ink-dim transition-colors duration-[var(--dur-fast)] hover:text-ink disabled:pointer-events-none">
                  [ flush ]
                </button>
              </div>
            )}
          </div>

          <div className="js-intro"><QualitySlider value={quality} onChange={setQuality} disabled={busy} /></div>

          <button ref={buttonRef} type="button" onClick={handleCompress} disabled={busy || queue.length === 0}
            className={`term-btn relative w-full ${busy ? 'pico-shimmer overflow-hidden' : ''}`} aria-busy={busy}>
            {busy
              ? `compressing ${queue.length}…`
              : `[ compress ${queue.length > 0 ? `${queue.length} file${queue.length > 1 ? 's' : ''}` : ''} ]`}
          </button>

          {status === 'compressing' && (
            <div className="flex justify-center"><LoadingState label="running sharp" variant="Drive" /></div>
          )}

          {error && (
            <p role="alert" className="border border-err/60 bg-surf-muted px-4 py-3 text-xs leading-relaxed text-err">✕ {error}</p>
          )}

          <ResultsList listRef={listRef} results={results} failures={failures} onClear={reset} />
        </main>
      </>
    );
  }

  return (
    <div ref={rootRef} className="flex min-h-screen w-full">
      {booting ? (
        <div className="flex min-h-[70vh] flex-1 items-center justify-center">
          <HandwritingSvg text="pico" width={320} height={160} fontSize={96} strokeWidth={2} duration={1.8} className="h-40 w-72 text-ink" />
          <LoadingState label="booting pico" variant="Orbit" />
        </div>
      ) : (
        <>
          <Sidebar active={tool} onSelect={setTool} />

          <div className="flex-1 flex flex-col min-h-screen px-4 pb-20 pt-8 sm:px-6 md:pb-16">
            <div className="mx-auto w-full max-w-3xl">
              {tool === 'compress' && <CompressView />}
              {tool === 'resize' && <ResizePanel />}
              {tool === 'cut' && <CutPanel />}
              {tool === 'convert' && <ConvertPanel />}

              <footer className="border-t border-line pt-4 mt-8 text-center text-[length:var(--text-md)] leading-relaxed text-ink-dim">
                pico v1.1.0 · sharp/mozjpeg/ffmpeg · localhost only · uploads auto-cleaned · zero telemetry
              </footer>
            </div>
          </div>

          <MobileNav active={tool} onSelect={setTool} />
        </>
      )}
    </div>
  );
}
