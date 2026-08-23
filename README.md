# Pico

A local-first image compressor for JPG, PNG, WebP, AVIF and TIFF. Pico runs a small Express server on your machine, compresses everything with Sharp, and shows the results in a terminal style web UI. Nothing is uploaded, there are no accounts, and nothing leaves your computer.

It exists because "free image compressor" usually means sending your photos to someone else's server. Pico does the same work offline.

[![npm version](https://img.shields.io/npm/v/pico-img?style=for-the-badge&color=22c55e)](https://www.npmjs.com/package/pico-img)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Stars](https://img.shields.io/github/stars/MoHamed-B-M/pico?style=for-the-badge&color=yellow&logo=github)](https://github.com/MoHamed-B-M/pico/stargazers)
[![Visitors](https://komarev.com/ghpvc/?username=MoHamed-B-M&repo=pico&color=22c55e&style=for-the-badge&label=visitors)](https://github.com/MoHamed-B-M/pico)
[![Website](https://img.shields.io/badge/Website-mohamed--b--m.github.io-22c55e?style=for-the-badge&logo=github&logoColor=white)](https://mohamed-b-m.github.io/pico/)

### Built with

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Sharp](https://img.shields.io/badge/Sharp-22c55e?style=for-the-badge&logo=sharp&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

### GitHub Insights

<p align="center">
  <a href="https://git.io/streak-stats">
    <img src="https://streak-stats.demolab.com?user=MoHamed-B-M&theme=chartreuse-dark&hide_border=true&background=0d1117&ring=22c55e&fire=22c55e&currStreakLabel=22c55e&sideLabels=c9d1d9&dates=8b949e" alt="GitHub Streak" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/commit-activity/m/MoHamed-B-M/pico?style=for-the-badge&color=22c55e&label=Commits" alt="Commits" />
  <img src="https://img.shields.io/github/commits-since/MoHamed-B-M/pico/v1.0.2?style=for-the-badge&color=22c55e&label=Since%20v1.0.2" alt="Since v1.0.2" />
  <img src="https://img.shields.io/github/last-commit/MoHamed-B-M/pico?style=for-the-badge&color=22c55e" alt="Last Commit" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/forks/MoHamed-B-M/pico?style=for-the-badge&color=22c55e" alt="Forks" />
  <img src="https://img.shields.io/github/watchers/MoHamed-B-M/pico?style=for-the-badge&color=22c55e" alt="Watchers" />
  <img src="https://img.shields.io/github/issues/MoHamed-B-M/pico?style=for-the-badge&color=22c55e" alt="Issues" />
</p>

<p align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1000&color=22C55E&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=100&lines=Full+Stack+Developer;Open+Source+Enthusiast;Always+Learning" alt="Typing SVG" />
  </a>
</p>

## Features

- Compresses JPG, JPEG, PNG, WebP, AVIF and TIFF, up to 25 MB per file and 30 files per batch
- Uses mozjpeg for JPEG, compression level 9 with palette mode for PNG, and tuned encoders for WebP and AVIF
- Quality control from 10 to 100, from tiny files to near-lossless
- Shows original size, compressed size and savings for every file
- Keeps the original format, respects EXIF orientation
- Deletes temporary uploads automatically after processing
- REST API if you prefer scripts over clicking

## Requirements

- Node.js 18.17 or newer
- A browser, for the web UI

## Installation

Run it once without installing:

```bash
npx pico-img
```

Or install it globally:

```bash
npm install -g pico-img
pico
```

The server starts on port 3000 and your browser opens automatically.

To work on the source code instead:

```bash
git clone https://github.com/MoHamed-B-M/pico.git
cd pico
npm install
npm run build
npm run dev
```

## Usage

1. Run `pico` in a terminal
2. Drag your images into the upload card, or click to browse
3. Pick a quality level. 10 gives the smallest files, 100 keeps the most detail
4. Press compress and wait for the results
5. Download what you need

### Command line options

```text
Usage: pico [options]

Options:
  -p, --port <number>   Port to serve on (default: 3000)
      --no-open         Do not auto-open the browser
  -h, --help            Show this help
```

## How it works

```mermaid
flowchart LR
    A[Drop images] --> B[Multer temp store]
    B --> C{Sharp}
    C -->|JPG| D[mozjpeg]
    C -->|PNG| E[level 9 + palette]
    C -->|WebP| F[effort 5]
    C -->|AVIF| G[effort 4]
    C -->|TIFF| H[lzw compression]
    D --> I[compressed folder]
    E --> I
    F --> I
    G --> I
    H --> I
    I --> J[JSON stats and downloads]
    B -. auto delete .-> K[cleanup]
```

Compression happens in-process through libvips. There are no workers, queues or external services involved.

## Results you can expect

Measured on a 1600x1200 test image at quality 60:

| Format | Before | After | Saved |
|--------|-------:|------:|------:|
| JPG | 1.82 MB | 383 KB | 79% |
| PNG | 113 KB | 18 KB | 84% |

## API

Compress files with a POST request. The `images` field is repeatable, `quality` accepts an integer from 10 to 100.

```bash
curl -X POST -F "images=@photo.jpg" -F "quality=60" http://localhost:3000/api/compress
```

The response contains one entry per file:

```json
{
  "success": true,
  "quality": 60,
  "files": [
    {
      "id": "d38c9894",
      "originalName": "photo.jpg",
      "downloadUrl": "/compressed/d38c9894__photo.compressed.jpg",
      "format": "JPG",
      "quality": 60,
      "originalSize": 1823679,
      "compressedSize": 383140,
      "savedPercentage": 79
    }
  ]
}
```

Files that fail are listed under `failures` and do not stop the rest of the batch. A health probe is available at `GET /api/health`.

## Project structure

```text
pico/
|-- server.js               Express server and Sharp pipeline
|-- vite.config.js          Vite config, client root
|-- client/
|   |-- index.html
|   |-- tailwind.config.js
|   +-- src/
|       |-- components/     Upload card, quality slider, results
|       |-- animations/     GSAP hooks
|       |-- tokens.css      Design tokens
|       +-- App.jsx
|-- uploads/                Temporary storage, auto cleaned
+-- compressed/             Output folder, served statically
```

## Contributing

Pull requests are welcome. Fork the repo, make your changes, and open a PR. Some ideas that would be nice: resize presets, a CLI-only batch mode, GIF support, a Docker image.

## License

This project is licensed under the MIT license with an attribution clause. See [LICENSE](LICENSE) for details.

## Author

Made by Hamma, IT student.

[![Gmail](https://img.shields.io/badge/Gmail-benmohamedm715%40gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:benmohamedm715@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-MoHamed--B--M-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/MoHamed-B-M)

Disclaimer: TinyPNG is a registered trademark of Tinify B.V. Pico is an independent, open-source project and is not affiliated with or endorsed by Tinify.
