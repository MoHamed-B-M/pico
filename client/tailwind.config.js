/** @type {import('tailwindcss').Config} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientDir = path.dirname(fileURLToPath(import.meta.url));

export default {
  content: [
    path.join(clientDir, 'index.html'),
    path.join(clientDir, 'src', '**', '*.{js,jsx}'),
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: 'var(--color-text-primary)',
          mid: 'var(--color-text-secondary)',
          dim: 'var(--color-text-tertiary)',
          inv: 'var(--color-text-inverse)',
        },
        surf: {
          base: 'var(--color-surface-base)',
          muted: 'var(--color-surface-muted)',
          raised: 'var(--color-surface-raised)',
        },
        line: 'var(--color-border-muted)',
        err: 'var(--color-error)',
      },
    },
  },
  plugins: [],
};
