import React from 'react';

const TOOLS = [
  { id: 'compress', icon: '⚡', label: 'compress', desc: 'shrink files' },
  { id: 'resize', icon: '⊞', label: 'resize', desc: 'change dimensions' },
  { id: 'cut', icon: '✂', label: 'cut', desc: 'crop & trim' },
  { id: 'convert', icon: '↻', label: 'convert', desc: 'change format' },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-line bg-surf-muted/50 shrink-0">
      {/* Logo */}
      <div className="px-4 pt-6 pb-4 border-b border-line">
        <span className="text-lg font-bold uppercase tracking-widest text-ink">pico</span>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-dim">v1.1.0</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {TOOLS.map((tool) => {
          const isActive = active === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelect(tool.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-[var(--dur-fast)]
                ${isActive
                  ? 'bg-surf-raised border-l-2 border-ink text-ink'
                  : 'border-l-2 border-transparent text-ink-dim hover:text-ink hover:bg-surf-base'
                }
              `}
            >
              <span className="text-base w-5 text-center">{tool.icon}</span>
              <div className="min-w-0">
                <span className={`block text-sm font-medium uppercase tracking-wider ${isActive ? 'text-ink' : ''}`}>
                  {tool.label}
                </span>
                <span className="block text-[10px] text-ink-dim">{tool.desc}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-line">
        <p className="text-[10px] uppercase tracking-wider text-ink-dim text-center">
          localhost only · zero telemetry
        </p>
      </div>
    </aside>
  );
}

export function MobileNav({ active, onSelect }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-line bg-surf-muted/95 backdrop-blur-sm">
      {TOOLS.map((tool) => {
        const isActive = active === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onSelect(tool.id)}
            className={`
              flex-1 flex flex-col items-center gap-1 py-3 transition-colors duration-[var(--dur-fast)]
              ${isActive ? 'text-ink' : 'text-ink-dim'}
            `}
          >
            <span className="text-base">{tool.icon}</span>
            <span className="text-[10px] uppercase tracking-wider font-medium">{tool.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
