#!/usr/bin/env node
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import open from 'open';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------ */
/*  CLI flags: pico [-p, --port <n>] [--no-open] [-h, --help]          */
/* ------------------------------------------------------------------ */

{
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' || args[i] === '-p') {
      const port = Number.parseInt(args[i + 1], 10);
      if (Number.isFinite(port)) {
        process.env.PORT = String(port);
        i++;
      }
    } else if (args[i] === '--no-open') {
      process.env.PICO_NO_OPEN = '1';
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
⚡ pico - Local Image Compressor

Usage: pico [options]

Options:
  -p, --port <number>   Port to serve on (default: 3000)
      --no-open         Do not auto-open the browser
  -h, --help            Show this help
`);
      process.exit(0);
    }
  }
}

const ROOT = __dirname;
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const COMPRESSED_DIR = path.join(ROOT, 'compressed');
const CLIENT_DIR = path.join(ROOT, 'client');
const CLIENT_DIST = path.join(CLIENT_DIR, 'dist');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || 'localhost';
const IS_DEV = process.env.PICO_DEV === '1';
const AUTO_OPEN = process.env.PICO_NO_OPEN !== '1';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB per image
const MAX_FILES = 30;
const MIN_QUALITY = 10;
const MAX_QUALITY = 100;

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

/* ------------------------------------------------------------------ */
/*  Bootstrap directories                                              */
/* ------------------------------------------------------------------ */

async function ensureDirectories() {
  await Promise.all(
    [UPLOAD_DIR, COMPRESSED_DIR].map((dir) =>
      fs.mkdir(dir, { recursive: true })
    )
  );
}

/* ------------------------------------------------------------------ */
/*  Multer upload pipeline                                             */
/* ------------------------------------------------------------------ */

function sanitizeName(name) {
  return (
    name
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f<>:"/\\|?*]+/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || 'image'
  );
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const id = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    const base = sanitizeName(path.basename(file.originalname, ext));
    cb(null, `${id}__${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
      return cb(null, true);
    }
    const err = new Error(
      `Unsupported file type "${ext || file.mimetype}". Allowed: jpg, jpeg, png, webp, avif.`
    );
    err.status = 415;
    cb(err);
  },
});

/* ------------------------------------------------------------------ */
/*  Sharp compression pipeline                                         */
/* ------------------------------------------------------------------ */

function clampQuality(raw) {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return 80;
  return Math.min(MAX_QUALITY, Math.max(MIN_QUALITY, parsed));
}

function buildSharpPipeline(inputPath, format, quality) {
  const image = sharp(inputPath).rotate(); // respect EXIF orientation

  switch (format) {
    case '.jpg':
    case '.jpeg':
      return image.jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:2:0' });
    case '.png':
      return image.png({
        compressionLevel: 9,
        quality,
        palette: quality < 100,
        effort: 7,
      });
    case '.webp':
      return image.webp({ quality, effort: 5 });
    case '.avif':
      return image.avif({ quality, effort: 4 });
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

async function compressOne(file, quality) {
  const ext = path.extname(file.originalname).toLowerCase();
  const outputName = path
    .basename(file.filename)
    .replace(ext, `.compressed${ext}`); // uuid__name.compressed.ext
  const outputPath = path.join(COMPRESSED_DIR, outputName);

  const pipeline = buildSharpPipeline(file.path, ext, quality);
  await pipeline.toFile(outputPath);

  const [originalStat, compressedStat] = await Promise.all([
    fs.stat(file.path),
    fs.stat(outputPath),
  ]);

  const originalSize = originalStat.size;
  const compressedSize = compressedStat.size;
  const savedPercentage =
    originalSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  return {
    id: path.basename(file.filename).split('__')[0],
    originalName: sanitizeName(path.basename(file.originalname)),
    downloadUrl: `/compressed/${encodeURIComponent(outputName)}`,
    format: ext.replace('.', '').toUpperCase(),
    quality,
    originalSize,
    compressedSize,
    savedPercentage,
  };
}

/** Remove the temporary upload; never let cleanup mask real errors. */
async function safeCleanup(file) {
  if (!file?.path) return;
  try {
    await fs.unlink(file.path);
  } catch {
    /* already gone or locked — nothing else to do */
  }
}

/* ------------------------------------------------------------------ */
/*  Express app                                                        */
/* ------------------------------------------------------------------ */

const app = express();
app.disable('x-powered-by');
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, service: 'pico', version: '1.0.0' });
});

// Compress endpoint
app.post('/api/compress', (req, res) => {
  upload.array('images', MAX_FILES)(req, res, async (uploadErr) => {
    if (uploadErr) {
      const status = uploadErr.status || (uploadErr.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
      const message =
        uploadErr.code === 'LIMIT_FILE_SIZE'
          ? `Each file must be ≤ ${MAX_FILE_BYTES / (1024 * 1024)} MB.`
          : uploadErr.message;
      return res.status(status).json({ success: false, error: message });
    }

    const files = req.files ?? [];
    if (files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'No images received. Attach them under the "images" field.' });
    }

    const quality = clampQuality(req.body?.quality);

    const results = [];
    const failures = [];

    for (const file of files) {
      try {
        results.push(await compressOne(file, quality));
      } catch (err) {
        console.error(`✖ Failed to compress "${file.originalname}":`, err.message);
        failures.push({
          originalName: sanitizeName(path.basename(file.originalname)),
          reason: err.message,
        });
      } finally {
        await safeCleanup(file);
      }
    }

    if (results.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Every file failed to compress.',
        failures,
      });
    }

    res.json({ success: true, quality, files: results, ...(failures.length && { failures }) });
  });
});

// Serve compressed outputs
app.use(
  '/compressed',
  express.static(COMPRESSED_DIR, { maxAge: '1h', fallthrough: true })
);

// Malformed JSON & generic API 404s
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, error: 'Unknown API route.' });
});

/* ------------------------------------------------------------------ */
/*  Frontend delivery — Vite middleware (dev) or built assets (prod)   */
/* ------------------------------------------------------------------ */

async function attachFrontend() {
  if (IS_DEV) {
    try {
      const vite = await import('vite');
      const server = await vite.createServer({
        root: CLIENT_DIR,
        appType: 'spa',
        server: { middlewareMode: true },
      });
      app.use(server.middlewares);
      console.log('◈ Vite dev middleware attached (HMR enabled)');
      return;
    } catch (err) {
      console.warn('⚠ Vite unavailable, falling back to static build:', err.message);
    }
  }

  const indexHtml = path.join(CLIENT_DIST, 'index.html');
  if (!fsSync.existsSync(indexHtml)) {
    app.use((_req, res) => {
      res
        .status(503)
        .send('<h3>Pico</h3><p>No frontend build found. Run <code>npm run build</code> first.</p>');
    });
    return;
  }

  app.use(express.static(CLIENT_DIST));
  app.use((_req, res) => res.sendFile(indexHtml));
}

/* ------------------------------------------------------------------ */
/*  Startup                                                            */
/* ------------------------------------------------------------------ */

function printBanner(url) {
  const line = '='.repeat(43);
  console.log(`
${line}
⚡ Pico - Local Image Compressor
${line}
🚀 Server running at: ${url}
==========================================`);
}

async function start() {
  await ensureDirectories();

  globalThis.__picoVite = null;
  try {
    await attachFrontend();
  } catch (err) {
    console.error('✖ Failed to attach frontend:', err);
    process.exitCode = 1;
    return;
  }

  app.listen(PORT, HOST, async () => {
    const url = `http://${HOST}:${PORT}`;
    printBanner(url);

    if (AUTO_OPEN) {
      try {
        await open(url);
      } catch {
        // Graceful fallback for headless environments — user opens the URL manually.
      }
    }
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`✖ Port ${PORT} is already in use. Set PORT=<other-port> and retry.`);
    } else {
      console.error('✖ Server error:', err.message);
    }
    process.exitCode = 1;
  });
}

start();

export default app;
