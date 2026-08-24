#!/usr/bin/env node
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import sharp from 'sharp';
import open from 'open';

/* ------------------------------------------------------------------ */
/*  Optional deps: ffmpeg-static (video) + @jsquash/jxl (JPEG XL)     */
/* ------------------------------------------------------------------ */

let ffmpegPath = null;
try {
  ffmpegPath = (await import('ffmpeg-static')).default ?? null;
} catch {
  /* ffmpeg-static not installed — video compression disabled */
}

let jxlEncode = null;
let jxlDecode = null;
async function loadJxl() {
  if (!jxlEncode) {
    const mod = await import('@jsquash/jxl');
    jxlEncode = mod.default;
    // decode is a named export
    jxlDecode = (await import('@jsquash/jxl')).decode ?? mod.decode;
  }
}

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
    } else if (args[i] === '--version' || args[i] === '-v') {
      const root = path.dirname(fileURLToPath(import.meta.url));
      const pkg = JSON.parse(fsSync.readFileSync(path.join(root, 'package.json'), 'utf8'));
      console.log(pkg.version);
      process.exit(0);
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
⚡ pico - Local Image & Video Compressor

Usage: pico [options]

Options:
  -p, --port <number>   Port to serve on (default: 3000)
      --no-open         Do not auto-open the browser
  -v, --version         Show version number
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

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // multer per-file limit
const MAX_FILES = 30;
const MIN_QUALITY = 10;
const MAX_QUALITY = 100;

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif', '.jxl']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.mkv', '.avi']);
const ALL_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS]);

const IMAGE_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
  'image/tiff', 'image/jxl',
]);
const VIDEO_MIMES = new Set([
  'video/mp4', 'video/webm', 'video/quicktime',
  'video/x-matroska', 'video/x-msvideo',
]);
const ALL_MIMES = new Set([...IMAGE_MIMES, ...VIDEO_MIMES]);

function isImage(ext) { return IMAGE_EXTENSIONS.has(ext); }
function isVideo(ext) { return VIDEO_EXTENSIONS.has(ext); }

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
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALL_MIMES.has(file.mimetype) && ALL_EXTENSIONS.has(ext)) {
      return cb(null, true);
    }
    const err = new Error(
      `Unsupported file type "${ext || file.mimetype}". Allowed: jpg, jpeg, png, webp, avif, tiff, jxl, mp4, webm, mov, mkv, avi.`
    );
    err.status = 415;
    cb(err);
  },
});

/* ------------------------------------------------------------------ */
/*  Sharp compression pipeline (images except JXL)                     */
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
    case '.tiff':
    case '.tif':
      return image.tiff({ quality, compression: 'lzw' });
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/* ------------------------------------------------------------------ */
/*  JPEG XL pipeline (@jsquash/jxl)                                    */
/* ------------------------------------------------------------------ */

async function compressJxl(file, quality, outputName, outputPath) {
  await loadJxl();

  const inputBuf = await fs.readFile(file.path);
  const imageData = await jxlDecode(inputBuf.buffer);

  const encoded = await jxlEncode(imageData, { quality });
  await fs.writeFile(outputPath, Buffer.from(encoded));

  const [originalStat, compressedStat] = await Promise.all([
    fs.stat(file.path),
    fs.stat(outputPath),
  ]);

  return {
    id: path.basename(file.filename).split('__')[0],
    originalName: sanitizeName(path.basename(file.originalname)),
    downloadUrl: `/compressed/${encodeURIComponent(outputName)}`,
    format: 'JXL',
    quality,
    originalSize: originalStat.size,
    compressedSize: compressedStat.size,
    savedPercentage: originalStat.size > 0
      ? Math.max(0, Math.round(((originalStat.size - compressedStat.size) / originalStat.size) * 100))
      : 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Video pipeline (ffmpeg-static)                                     */
/* ------------------------------------------------------------------ */

function compressVideo(file, quality, outputName, outputPath) {
  if (!ffmpegPath) {
    throw new Error(
      'Video compression unavailable — ffmpeg-static not installed. ' +
      'Run: npm install ffmpeg-static'
    );
  }

  // quality 10–100 → CRF 48–18 (lower = better)
  const crf = Math.round(51 - (quality / 100) * 33);

  return new Promise((resolve, reject) => {
    const args = [
      '-y', '-i', file.path,
      '-c:v', 'libx264', '-crf', String(crf), '-preset', 'medium',
      '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart',
      outputPath,
    ];

    const proc = spawn(ffmpegPath, args, { stdio: 'pipe' });
    let stderr = '';
    proc.stderr?.on('data', (d) => { stderr += d; });
    proc.on('error', reject);
    proc.on('close', async (code) => {
      if (code !== 0) {
        return reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-300)}`));
      }
      try {
        const [originalStat, compressedStat] = await Promise.all([
          fs.stat(file.path),
          fs.stat(outputPath),
        ]);
        resolve({
          id: path.basename(file.filename).split('__')[0],
          originalName: sanitizeName(path.basename(file.originalname)),
          downloadUrl: `/compressed/${encodeURIComponent(outputName)}`,
          format: path.extname(file.originalname).replace('.', '').toUpperCase(),
          quality,
          originalSize: originalStat.size,
          compressedSize: compressedStat.size,
          savedPercentage: originalStat.size > 0
            ? Math.max(0, Math.round(((originalStat.size - compressedStat.size) / originalStat.size) * 100))
            : 0,
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Compress dispatcher                                                */
/* ------------------------------------------------------------------ */

async function compressOne(file, quality) {
  const ext = path.extname(file.originalname).toLowerCase();
  const outputName = path
    .basename(file.filename)
    .replace(ext, `.compressed${ext}`);
  const outputPath = path.join(COMPRESSED_DIR, outputName);

  if (isVideo(ext)) {
    if (!ffmpegPath) {
      throw new Error('Video compression unavailable — ffmpeg-static not installed.');
    }
    // Validate video size
    const stat = await fs.stat(file.path);
    if (stat.size > MAX_VIDEO_BYTES) {
      throw new Error(`Video too large (${(stat.size / (1024 * 1024)).toFixed(1)} MB). Max: ${MAX_VIDEO_BYTES / (1024 * 1024)} MB.`);
    }
    return compressVideo(file, quality, outputName, outputPath);
  }

  if (ext === '.jxl') {
    return compressJxl(file, quality, outputName, outputPath);
  }

  // Sharp pipeline for standard image formats
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
  res.json({
    success: true,
    service: 'pico',
    version: '1.1.0',
    formats: {
      images: [...IMAGE_EXTENSIONS],
      videos: ffmpegPath ? [...VIDEO_EXTENSIONS] : [],
    },
  });
});

// Compress endpoint (images + videos)
app.post('/api/compress', (req, res) => {
  upload.array('images', MAX_FILES)(req, res, async (uploadErr) => {
    if (uploadErr) {
      const status = uploadErr.status || (uploadErr.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
      const message =
        uploadErr.code === 'LIMIT_FILE_SIZE'
          ? `Each file must be ≤ ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`
          : uploadErr.message;
      return res.status(status).json({ success: false, error: message });
    }

    const files = req.files ?? [];
    if (files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'No files received. Attach them under the "images" field.' });
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
  const fmt = ffmpegPath
    ? 'images + video (ffmpeg)'
    : 'images only (ffmpeg-static not installed)';
  const line = '='.repeat(43);
  console.log(`
${line}
⚡ Pico - Local Image & Video Compressor
${line}
🚀 Server running at: ${url}
📺 Formats: ${fmt}
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