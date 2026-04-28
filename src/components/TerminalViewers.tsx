import React, { useEffect, useRef, useState } from "react";

// ── ASCIIArtBlock ─────────────────────────────────────────────────────────────
// Loads an image onto an offscreen canvas, samples pixels, renders as colored █ chars

const COLS = 64;
const ROWS = 20;

interface ASCIIArtBlockProps {
  src: string;
}

type PixelGrid = { r: number; g: number; b: number; a: number }[][];

export const ASCIIArtBlock: React.FC<ASCIIArtBlockProps> = ({ src }) => {
  const [grid, setGrid] = useState<PixelGrid | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setGrid(null);
    setError(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = COLS;
        canvas.height = ROWS;
        const ctx = canvas.getContext("2d");
        if (!ctx) { setError(true); return; }
        ctx.drawImage(img, 0, 0, COLS, ROWS);
        const { data } = ctx.getImageData(0, 0, COLS, ROWS);
        const rows: PixelGrid = [];
        for (let y = 0; y < ROWS; y++) {
          const row: { r: number; g: number; b: number; a: number }[] = [];
          for (let x = 0; x < COLS; x++) {
            const i = (y * COLS + x) * 4;
            row.push({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] });
          }
          rows.push(row);
        }
        setGrid(rows);
      } catch {
        setError(true);
      }
    };
    img.onerror = () => setError(true);
    img.src = src;
  }, [src]);

  if (error) return <span className="text-red-500">[ ASCII render failed — image not accessible ]</span>;
  if (!grid) return <span className="text-cyan-400 animate-pulse">[ Rendering ASCII art... ]</span>;

  return (
    <div
      className="font-mono leading-none select-none"
      style={{ fontSize: "7px", lineHeight: "8px" }}
      aria-label="ASCII art image"
    >
      {grid.map((row, y) => (
        <div key={y} style={{ display: "flex" }}>
          {row.map((px, x) => (
            <span
              key={x}
              style={{
                color: `rgba(${px.r},${px.g},${px.b},${(px.a / 255).toFixed(2)})`,
                display: "inline-block",
                width: "7px",
                textAlign: "center",
              }}
            >
              █
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

// ── FullscreenDOSViewer ────────────────────────────────────────────────────────
// Simulates a 1994 DOS VGA image viewer that "hijacks" the screen

interface FullscreenDOSViewerProps {
  imagePath: string;
  fileName: string;
  onClose: () => void;
}

export const FullscreenDOSViewer: React.FC<FullscreenDOSViewerProps> = ({
  imagePath,
  fileName,
  onClose,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate the "mode switch" loading pause
  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 800);
    return () => clearTimeout(t);
  }, []);

  // Listen for any keypress to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus so keydown fires
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const safeFileName = fileName.toUpperCase();

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="absolute inset-0 z-50 flex flex-col bg-black font-mono outline-none select-none"
      style={{ cursor: "none" }}
      onClick={onClose}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.45) 1px,rgba(0,0,0,0.45) 2px)",
        }}
      />

      {/* Header bar */}
      <div
        className="shrink-0 flex items-center justify-between px-2 py-0.5 z-20"
        style={{
          backgroundColor: "#0000aa",
          color: "#ffffff",
          fontSize: "11px",
          fontFamily: "monospace",
          borderBottom: "1px solid #5555ff",
        }}
      >
        <span>■ VSVIEW.EXE v1.2 — VESPERA SYSTEMS GRAPHICS UTILITY</span>
        <span style={{ color: "#aaaaaa" }}>{safeFileName}</span>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-20 overflow-hidden">
        {phase === "loading" ? (
          <div style={{ color: "#00ff41", fontSize: "11px", fontFamily: "monospace" }}>
            <span className="animate-pulse">
              Switching video mode... VGA 320×200×256... ░░░░░░░░░░░░░░░░
            </span>
          </div>
        ) : imgError ? (
          <div style={{ color: "#ff5555", fontSize: "11px", fontFamily: "monospace", textAlign: "center" }}>
            <div>╔══════════════════════════════════════╗</div>
            <div>║  ERROR: Cannot read image data       ║</div>
            <div>║  File may be corrupted or protected  ║</div>
            <div>╚══════════════════════════════════════╝</div>
          </div>
        ) : (
          <>
            {/* Outer CRT-style frame */}
            <div
              style={{
                border: "2px solid #555",
                boxShadow: "0 0 0 1px #222, 0 0 20px rgba(0,200,80,0.15)",
                padding: "4px",
                backgroundColor: "#111",
                maxWidth: "90%",
                maxHeight: "75%",
              }}
            >
              <img
                src={imagePath}
                alt={fileName}
                onLoad={() => setLoaded(true)}
                onError={() => setImgError(true)}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  imageRendering: "pixelated",
                  opacity: loaded ? 1 : 0,
                  transition: "opacity 0.3s",
                }}
              />
              {!loaded && !imgError && (
                <div
                  style={{
                    color: "#555",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    padding: "20px 40px",
                  }}
                >
                  Loading bitmap...
                </div>
              )}
            </div>

            {/* File info */}
            {loaded && (
              <div
                style={{
                  color: "#aaaaaa",
                  fontSize: "10px",
                  fontFamily: "monospace",
                  marginTop: "6px",
                }}
              >
                {safeFileName} &nbsp;|&nbsp; VGA PALETTE MODE &nbsp;|&nbsp; 256 COLORS
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer bar */}
      <div
        className="shrink-0 flex items-center justify-center px-2 py-0.5 z-20"
        style={{
          backgroundColor: "#0000aa",
          borderTop: "1px solid #5555ff",
          fontSize: "11px",
          fontFamily: "monospace",
        }}
      >
        <BlinkText text="Press any key to return to AETHERIS OS..." color="#ffffff" />
      </div>
    </div>
  );
};

// Simple blinking text helper
const BlinkText: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setVisible(v => !v), 500);
    return () => clearInterval(t);
  }, []);
  return <span style={{ color, opacity: visible ? 1 : 0 }}>{text}</span>;
};
