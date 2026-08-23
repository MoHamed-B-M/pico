# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-08-23

### Added
- Auto-update checking: shows toast notification when a newer version is available
- Push notification on compression start via toast pop-up
- TIFF/TIF image format support (LZW compression)
- Expanded accepted file types in dropzone, server validation, and Sharp pipeline

### Fixed
- `})}` → `))}` JSX syntax error in App.jsx build
- Health endpoint version now returns `1.0.2`

### Changed
- Description updated to reflect new format support
- Footer version bumped to `1.0.2`

## [1.0.1] - 2026-08-23

### Added
- Missing runtime dependencies: opentype.js, framer-motion, styled-components
- Handwriting SVG intro with Caveat font
- Typewriter tagline animation
- Boot splash with loading state
- Terminal-themed UI with phosphor green palette
- CLI flags: `--port`, `--no-open`, `--help`
- Shebang line for `npx` execution
- Professional README with badges, mermaid diagram, API docs
- License with attribution clause

### Fixed
- GitHub badge 404 (URL-encoded dashes)
- Mojibake in README (restored emoji glyphs)
- Tailwind `text-[length:...]` class warnings
- `.gitignore` excludes for `site/`, `node_modules/`, `compressed/`, `uploads/`
- Vite config absolute paths for Tailwind content

## [1.0.0] - 2026-08-23

### Added
- Initial release
- Express + Sharp compression backend
- React + Tailwind + GSAP terminal-themed frontend
- Support for JPG, PNG, WebP, AVIF formats
- Quality slider (10–100)
- Batch compression (up to 30 files)
- Auto-cleanup of uploads and compressed outputs
- Zero telemetry, localhost-only architecture
