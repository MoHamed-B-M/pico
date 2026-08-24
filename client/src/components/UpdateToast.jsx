import React, { useState, useEffect } from 'react';

export default function UpdateToast() {
  const [info, setInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const check = async () => {
      try {
        const res = await fetch('/api/update-check');
        const data = await res.json();
        if (data.updateAvailable) setInfo(data);
      } catch {}
    };

    check();
    const interval = setInterval(check, 60 * 60 * 1000); // re-check every hour
    return () => clearInterval(interval);
  }, [dismissed]);

  if (!info || dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up">
      <div className="border border-ink/40 bg-surf-base/90 backdrop-blur-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-ink text-lg mt-0.5">↑</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink">update available</p>
            <p className="text-xs text-ink-dim mt-1">
              pico <span className="text-ink">{info.latest}</span> is out
              <span className="text-ink-dim"> (you have {info.current})</span>
            </p>
            <div className="flex items-center gap-3 mt-3">
              <a
                href="https://www.npmjs.com/package/pico-img"
                target="_blank"
                rel="noopener noreferrer"
                className="term-btn !px-3 !py-1 !text-[10px]"
              >
                view on npm
              </a>
              <code className="text-[10px] text-ink-dim bg-surf-muted px-2 py-1 font-mono">
                npm i -g pico-img@latest
              </code>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="ml-auto text-[10px] uppercase tracking-wider text-ink-dim hover:text-ink transition-colors"
              >
                [ dismiss ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
