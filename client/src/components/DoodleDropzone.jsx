import React, { useRef, useState } from 'react';
import styled from 'styled-components';

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.avif';

const StyledWrapper = styled.div`
  /* --- Premium Coordinated Palette --- */
  .doodle-upload-container {
    --ink-color: var(--color-text-primary);
    --zone-bg: #070b08;
    --paper-line: oklch(0.58 0.09 140 / 0.35);

    --folder-back: oklch(0.4 0.09 145); /* deep phosphor */
    --folder-front: oklch(0.5 0.11 143); /* mid phosphor */

    --btn-default: var(--color-text-primary); /* accent fill */
    --btn-hover: var(--color-text-inverse);
    --accent-blue: oklch(0.8 0.13 160);

    --paper-file: oklch(0.15 0.022 145);

    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 280px;
    height: 280px;
    padding: 20px;
    cursor: pointer;
    margin: 0 auto;

    /* Lined Paper Background */
    background:
      linear-gradient(var(--zone-bg) 20px, transparent 20px) 0 0 / 100% 24px,
      linear-gradient(var(--paper-line) 2px, transparent 2px) 0 20px / 100% 24px
        var(--zone-bg);

    border: 3px dashed var(--ink-color);
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    box-shadow: 8px 8px 0 rgba(30, 30, 36, 0.15);

    transition:
      transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.4s ease;
    filter: url(#doodle-jitter);
  }

  .hidden-file-input {
    display: none;
  }

  /* --- FOLDER LAYERS --- */
  .doodle-folder {
    position: relative;
    width: 130px;
    height: 100px;
    margin-bottom: 25px;
    animation: doodleFloat 3.5s infinite ease-in-out;
    z-index: 2;
  }

  .folder-back {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 85px;
    background: var(--folder-back);
    border: 3px solid var(--ink-color);
    border-radius: 10px 255px 15px 225px / 255px 10px 225px 15px;
    box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.15);
    z-index: 1;
  }

  .folder-tab {
    position: absolute;
    top: -15px;
    left: 10px;
    width: 45px;
    height: 20px;
    background: var(--folder-back);
    border: 3px solid var(--ink-color);
    border-bottom: none;
    border-radius: 10px 15px 0 0 / 255px 255px 0 0;
  }

  .folder-front {
    position: absolute;
    bottom: -2px;
    left: -4px;
    width: calc(100% + 8px);
    height: 70px;
    background: var(--folder-front);
    border: 3px solid var(--ink-color);
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    box-shadow: 4px 4px 0 rgba(30, 30, 36, 0.15);
    z-index: 3;
    transform-origin: bottom center;
    transition:
      transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
      background 0.3s ease;
  }

  .folder-smile {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 30px;
  }

  /* --- PAPERS --- */
  .doodle-papers {
    position: absolute;
    bottom: 10px;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  .paper {
    position: absolute;
    bottom: 10px;
    width: 55px;
    height: 70px;
    background: var(--paper-file);
    border: 2px solid var(--ink-color);
    border-radius: 4px;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    padding: 8px;
    box-shadow: 2px 2px 0 rgba(30, 30, 36, 0.1);
  }

  .file-1 {
    left: 15px;
    transform: rotate(-5deg) translateY(0);
  }
  .file-2 {
    right: 15px;
    transform: rotate(5deg) translateY(0);
  }

  .scribble-line {
    height: 4px;
    background: var(--ink-color);
    margin-bottom: 6px;
    border-radius: 2px;
    width: 100%;
    opacity: 0.8;
  }
  .scribble-line.short {
    width: 60%;
  }
  .doodle-image-icon {
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }

  /* --- THE BUTTON --- */
  .doodle-btn {
    background: var(--btn-default);
    border: 3px solid var(--ink-color);
    padding: 12px 28px;
    border-radius: 15px 255px 15px 225px / 255px 15px 225px 15px;
    box-shadow: 4px 4px 0 var(--ink-color);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 3;
  }

  .btn-text {
    font-family: 'Permanent Marker', cursive, sans-serif;
    font-size: 19px;
    color: var(--color-accent-ink);
    letter-spacing: 1px;
    text-transform: uppercase;
    text-shadow: 2px 2px 0 var(--color-surface-base);
    transition: all 0.3s ease;
  }

  .doodle-hint {
    margin-top: 14px;
    z-index: 3;
    font-family: 'Permanent Marker', cursive, sans-serif;
    font-size: 12px;
    color: var(--color-text-tertiary);
    letter-spacing: 0.5px;
  }

  /* --- DECORATIONS --- */
  .doodle-decor {
    position: absolute;
    z-index: 5;
    pointer-events: none;
    opacity: 0;
    transition:
      transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
      opacity 0.3s ease;
  }

  .sparkle-1 {
    width: 24px;
    top: 30px;
    right: 40px;
    transform: scale(0) rotate(0deg);
  }
  .star-1 {
    width: 30px;
    top: 50px;
    left: 30px;
    transform: scale(0) rotate(0deg);
  }
  .doodle-paperclip {
    position: absolute;
    top: -15px;
    left: 20px;
    width: 40px;
    height: 40px;
    z-index: 10;
    transform: rotate(-15deg);
  }

  /* --- ANIMATIONS --- */
  @keyframes doodleFloat {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-6px) rotate(2deg);
    }
  }

  @keyframes paperWiggle {
    0%,
    100% {
      transform: rotate(-15deg) translateY(-40px);
    }
    50% {
      transform: rotate(-10deg) translateY(-45px);
    }
  }
  @keyframes paperWiggle2 {
    0%,
    100% {
      transform: rotate(18deg) translateY(-35px);
    }
    50% {
      transform: rotate(22deg) translateY(-30px);
    }
  }

  .doodle-upload-container:hover,
  .doodle-upload-container.is-dragging {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 10px 10px 0 var(--ink-color);
    border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px;
  }

  .doodle-upload-container:hover .folder-front,
  .doodle-upload-container.is-dragging .folder-front {
    transform: scaleY(0.85) skewX(-5deg);
    background: #ffe285;
  }

  .doodle-upload-container:hover .file-1,
  .doodle-upload-container.is-dragging .file-1 {
    animation: paperWiggle 1.5s infinite ease-in-out;
  }
  .doodle-upload-container:hover .file-2,
  .doodle-upload-container.is-dragging .file-2 {
    animation: paperWiggle2 1.5s infinite ease-in-out 0.2s;
  }

  .doodle-upload-container:hover .doodle-btn,
  .doodle-upload-container.is-dragging .doodle-btn {
    background: var(--btn-hover);
    transform: scale(1.08) rotate(-3deg) translateY(-4px);
    box-shadow: 6px 6px 0 var(--ink-color);
  }
  .doodle-upload-container:hover .btn-text,
  .doodle-upload-container.is-dragging .btn-text {
    color: var(--color-accent-ink);
    text-shadow: none;
  }

  .doodle-upload-container:hover .doodle-decor,
  .doodle-upload-container.is-dragging .doodle-decor {
    opacity: 1;
  }
  .doodle-upload-container:hover .sparkle-1,
  .doodle-upload-container.is-dragging .sparkle-1 {
    transform: scale(1.2) rotate(15deg);
  }
  .doodle-upload-container:hover .star-1,
  .doodle-upload-container.is-dragging .star-1 {
    transform: scale(1.3) rotate(-20deg);
  }

  .doodle-upload-container:active {
    transform: translate(6px, 6px);
    box-shadow: 2px 2px 0 var(--ink-color);
  }
  .doodle-upload-container:active .doodle-btn {
    transform: scale(0.95);
    box-shadow: 2px 2px 0 var(--ink-color);
  }

  .doodle-upload-container.is-disabled {
    cursor: not-allowed;
    opacity: 0.55;
    filter: grayscale(0.6) url(#doodle-jitter);
  }
`;

export default function DoodleDropzone({ onFilesSelected, disabled }) {
  const inputRef = useRef(null);
  const dragDepth = useRef(0);
  const [dragOver, setDragOver] = useState(false);

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    if (dragDepth.current === 1) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (disabled || dragDepth.current === 0) return;
    dragDepth.current -= 1;
    if (dragDepth.current === 0) setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files.length > 0) onFilesSelected(files);
  };

  return (
    <StyledWrapper>
      <div>
        <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <defs>
            <filter id="doodle-jitter" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={3} result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        <label
          className={`doodle-upload-container${dragOver ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label="Upload images"
          aria-disabled={disabled}
          onClick={openPicker}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            className="hidden-file-input"
            type="file"
            multiple
            accept={ACCEPTED}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length > 0) onFilesSelected(files);
              e.target.value = '';
            }}
          />

          <div className="doodle-folder">
            <div className="folder-back">
              <div className="folder-tab" />
            </div>
            <div className="doodle-papers">
              <div className="paper file-1">
                <div className="scribble-line" />
                <div className="scribble-line short" />
                <div className="scribble-line" />
              </div>
              <div className="paper file-2">
                <svg viewBox="0 0 24 24" className="doodle-image-icon">
                  <rect x={3} y={3} width={18} height={18} rx={2} fill="none" stroke="currentColor" strokeWidth={2} />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15l-5-5L5 21" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="folder-front">
              <svg className="folder-smile" viewBox="0 0 24 24">
                <path d="M 7 14 Q 12 19 17 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="doodle-btn">
            <span className="btn-text">Choose files</span>
          </div>

          <span className="doodle-hint">or drop them here</span>

          <svg className="doodle-decor sparkle-1" viewBox="0 0 24 24">
            <path d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z" fill="var(--btn-hover)" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <svg className="doodle-decor star-1" viewBox="0 0 24 24">
            <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9L12 2Z" fill="var(--accent-blue)" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <svg className="doodle-paperclip" viewBox="0 0 24 24">
            <path d="M 12 4 L 12 18 C 12 20 9 20 9 18 L 9 6 C 9 3 15 3 15 6 L 15 16 C 15 18 13 18 13 16 L 13 8" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </label>
      </div>
    </StyledWrapper>
  );
}
