import React, { useEffect, useMemo, useState } from 'react';
import { parse as parseFont } from 'opentype.js';
import { motion } from 'framer-motion';

const FONT_URL = '/fonts/Caveat-wght.ttf';
let fontCache = null;
let fontPromise = null;

function loadFont() {
  if (fontCache) return Promise.resolve(fontCache);
  if (fontPromise) return fontPromise;
  fontPromise = fetch(FONT_URL)
    .then((res) => res.arrayBuffer())
    .then((buf) => {
      fontCache = parseFont(buf);
      return fontCache;
    })
    .catch(() => null);
  return fontPromise;
}

/**
 * HandwritingSvg — draws `text` as animated handwriting strokes on mount.
 * Converts glyphs to SVG paths via opentype.js and animates pathLength
 * with framer-motion. Falls back to a plain fade-in <text> if the font
 * cannot be loaded, so it never blocks the UI.
 */
export function HandwritingSvg({
  text = 'pico',
  width = 320,
  height = 160,
  fontSize = 72,
  strokeWidth = 1.5,
  duration = 2.5,
  className = '',
}) {
  const [paths, setPaths] = useState(null); // null = loading, [] = fallback
  const [viewBox, setViewBox] = useState(`0 0 ${width} ${height}`);

  useEffect(() => {
    let alive = true;
    loadFont().then((font) => {
      if (!alive) return;
      if (!font) {
        setPaths([]);
        return;
      }
      const built = [];
      let x = 0;
      const finite = (...nums) => nums.every((n) => Number.isFinite(n));
      for (const ch of text) {
        const advance = font.getAdvanceWidth(ch, fontSize);
        try {
          // Sanitize: variable fonts can emit NaN control points.
          const cmds = font
            .getPath(ch, x, fontSize * 0.8, fontSize)
            .commands.filter((c) =>
              c.type === 'Z'
                ? true
                : c.type === 'C'
                  ? finite(c.x, c.y, c.x1, c.y1, c.x2, c.y2)
                  : c.type === 'Q'
                    ? finite(c.x, c.y, c.x1, c.y1)
                    : finite(c.x, c.y)
            );
          if (cmds.length > 0) {
            built.push(
              cmds
                .map((c) =>
                  c.type === 'Z'
                    ? 'Z'
                    : c.type === 'C'
                      ? `C${c.x1} ${c.y1} ${c.x2} ${c.y2} ${c.x} ${c.y}`
                      : c.type === 'Q'
                        ? `Q${c.x1} ${c.y1} ${c.x} ${c.y}`
                        : `${c.type}${c.x} ${c.y}`
                )
                .join(' ')
            );
          }
        } catch {
          /* skip unrenderable glyph */
        }
        x += advance + fontSize * 0.04;
      }
      setPaths(built);
      // Fit viewBox tightly around the rendered text so it always centers.
      try {
        const bb = font.getPath(text, 0, fontSize * 0.8, fontSize).getBoundingBox();
        const pad = fontSize * 0.12;
        setViewBox(
          `${(bb.x1 - pad).toFixed(1)} ${(bb.y1 - pad).toFixed(1)} ${(
            bb.x2 - bb.x1 + pad * 2
          ).toFixed(1)} ${(bb.y2 - bb.y1 + pad * 2).toFixed(1)}`
        );
      } catch {
        /* keep default viewBox */
      }
    });
    return () => {
      alive = false;
    };
  }, [text, fontSize]);

  const perPath = paths ? duration / Math.max(1, paths.length) : 0;
  const strokeColor = useMemo(() => 'currentColor', []);

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={text}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths === null || paths.length === 0 ? (
        <motion.text
          x="50%"
          y="62%"
          textAnchor="middle"
          dominantBaseline="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ fill: strokeColor, stroke: 'none', fontFamily: 'cursive', fontSize }}
        >
          {text}
        </motion.text>
      ) : (
        paths.map((d, i) => (
          <motion.path
            key={`${i}-${d.slice(0, 12)}`}
            d={d}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              pathLength: {
                delay: i * perPath,
                duration: perPath * 1.4,
                ease: 'easeInOut',
              },
            }}
          />
        ))
      )}
    </svg>
  );
}

export default HandwritingSvg;
