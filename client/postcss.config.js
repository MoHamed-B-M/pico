import { fileURLToPath } from 'node:url';
import path from 'node:path';

const tailwindConfig = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tailwind.config.js');

export default {
  config: tailwindConfig,
  plugins: {
    tailwindcss: { config: tailwindConfig },
    autoprefixer: {},
  },
};
