"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ImageDropzone } from "@/components/tool-ui/ImageDropzone";
import { Download, Lock, Unlock, RefreshCw, LayoutGrid } from "lucide-react";

// All dimensions in inches for internal math
const PAPER_SIZES = {
  "4x6": { label: "4 × 6 in", w: 4, h: 6 },
  "5x7": { label: "5 × 7 in", w: 5, h: 7 },
  "8x10": { label: "8 × 10 in", w: 8, h: 10 },
  letter: { label: "Letter (8.5 × 11 in)", w: 8.5, h: 11 },
  a4: { label: "A4 (8.27 × 11.7 in)", w: 8.27, h: 11.69 },
  a5: { label: "A5 (5.83 × 8.27 in)", w: 5.83, h: 8.27 },
} as const;

const PHOTO_PRESETS = [
  { label: "Wallet (2 × 2.5 in)", w: 2, h: 2.5 },
  { label: "2 × 2 in", w: 2, h: 2 },
  { label: "2 × 3 in", w: 2, h: 3 },
  { label: "3 × 4 in", w: 3, h: 4 },
  { label: "4 × 6 in", w: 4, h: 6 },
];

type PaperKey = keyof typeof PAPER_SIZES;

const DPI = 300;

function inToPx(inches: number) {
  return Math.round(inches * DPI);
}

interface GridConfig {
  paperW: number; // px
  paperH: number; // px
  photoW: number; // px
  photoH: number; // px
  cols: number;
  rows: number;
  gap: number; // px
  pad: number; // px
}

function calcGrid(
  paperWin: number,
  paperHin: number,
  photoWin: number,
  photoHin: number,
  gapIn: number,
  padIn: number
): GridConfig {
  const paperW = inToPx(paperWin);
  const paperH = inToPx(paperHin);
  const photoW = inToPx(photoWin);
  const photoH = inToPx(photoHin);
  const gap = inToPx(gapIn);
  const pad = inToPx(padIn);

  const usableW = paperW - 2 * pad;
  const usableH = paperH - 2 * pad;

  const cols = Math.max(1, Math.floor((usableW + gap) / (photoW + gap)));
  const rows = Math.max(1, Math.floor((usableH + gap) / (photoH + gap)));

  return { paperW, paperH, photoW, photoH, cols, rows, gap, pad };
}

function drawGrid(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  cfg: GridConfig
) {
  const { paperW, paperH, photoW, photoH, cols, rows, gap, pad } = cfg;
  canvas.width = paperW;
  canvas.height = paperH;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, paperW, paperH);

  // Center the grid on the page
  const gridW = cols * photoW + (cols - 1) * gap;
  const gridH = rows * photoH + (rows - 1) * gap;
  const offsetX = Math.max(pad, (paperW - gridW) / 2);
  const offsetY = Math.max(pad, (paperH - gridH) / 2);

  // Cover-fit the source image into each cell
  const scale = Math.max(photoW / img.naturalWidth, photoH / img.naturalHeight);
  const srcW = photoW / scale;
  const srcH = photoH / scale;
  const srcX = (img.naturalWidth - srcW) / 2;
  const srcY = (img.naturalHeight - srcH) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * (photoW + gap);
      const y = offsetY + r * (photoH + gap);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, photoW, photoH);
      // Subtle cut-line border
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, photoW - 1, photoH - 1);
    }
  }
}

export default function PrintGridTool() {
  const [hasImage, setHasImage] = useState(false);
  const [paper, setPaper] = useState<PaperKey>("4x6");
  const [photoW, setPhotoW] = useState(2);
  const [photoH, setPhotoH] = useState(2.5);
  const [gapIn, setGapIn] = useState(0.05);
  const [padIn, setPadIn] = useState(0.1);
  const [lockRatio, setLockRatio] = useState(true);
  const [gridInfo, setGridInfo] = useState({ cols: 0, rows: 0, total: 0 });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const paperRef = useRef<PaperKey>("4x6");
  const photoWRef = useRef(2);
  const photoHRef = useRef(2.5);
  const gapRef = useRef(0.05);
  const padRef = useRef(0.1);

  // Keep refs in sync
  useEffect(() => { paperRef.current = paper; }, [paper]);
  useEffect(() => { photoWRef.current = photoW; }, [photoW]);
  useEffect(() => { photoHRef.current = photoH; }, [photoH]);
  useEffect(() => { gapRef.current = gapIn; }, [gapIn]);
  useEffect(() => { padRef.current = padIn; }, [padIn]);

  const render = useCallback(() => {
    const img = imgRef.current;
    const canvas = previewRef.current;
    if (!img || !canvas) return;

    const ps = PAPER_SIZES[paperRef.current];
    const cfg = calcGrid(ps.w, ps.h, photoWRef.current, photoHRef.current, gapRef.current, padRef.current);
    setGridInfo({ cols: cfg.cols, rows: cfg.rows, total: cfg.cols * cfg.rows });

    // Draw at full res then scale canvas via CSS
    drawGrid(canvas, img, cfg);
  }, []);

  // Re-render on any control change
  useEffect(() => {
    if (imgRef.current) render();
  }, [paper, photoW, photoH, gapIn, padIn, render]);

  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        imgRef.current = img;
        setHasImage(true);
        requestAnimationFrame(render);
      };
      img.src = url;
    },
    [render]
  );

  function applyPreset(w: number, h: number) {
    setPhotoW(w);
    setPhotoH(h);
  }

  function changePhotoW(val: number) {
    if (lockRatio && photoH > 0) {
      const ratio = photoH / photoW;
      setPhotoH(parseFloat((val * ratio).toFixed(2)));
    }
    setPhotoW(val);
  }

  function changePhotoH(val: number) {
    if (lockRatio && photoW > 0) {
      const ratio = photoW / photoH;
      setPhotoW(parseFloat((val * ratio).toFixed(2)));
    }
    setPhotoH(val);
  }

  const download = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const ps = PAPER_SIZES[paperRef.current];
    const cfg = calcGrid(ps.w, ps.h, photoWRef.current, photoHRef.current, gapRef.current, padRef.current);
    const out = document.createElement("canvas");
    drawGrid(out, img, cfg);
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `print-grid-${paperRef.current}-${cfg.cols}x${cfg.rows}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {!hasImage ? (
        <ImageDropzone
          onFile={handleFile}
          label="Drop an image here to start your print grid"
          accept="image/*"
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Controls */}
          <div className="flex flex-col gap-5 lg:w-72 flex-shrink-0">
            {/* Paper size */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Paper Size</label>
              <select
                value={paper}
                onChange={(e) => setPaper(e.target.value as PaperKey)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {(Object.keys(PAPER_SIZES) as PaperKey[]).map((k) => (
                  <option key={k} value={k}>{PAPER_SIZES[k].label}</option>
                ))}
              </select>
            </div>

            {/* Photo size presets */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Photo Size</label>
              <div className="flex flex-wrap gap-1.5">
                {PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.w, p.h)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      photoW === p.w && photoH === p.h
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Width / Height inputs */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-xs text-muted-foreground">Width (in)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="12"
                    value={photoW}
                    onChange={(e) => changePhotoW(parseFloat(e.target.value) || photoW)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={() => setLockRatio((v) => !v)}
                  className="mt-5 flex-shrink-0 rounded-lg border border-border p-1.5 hover:bg-muted/50 transition-colors"
                  title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                >
                  {lockRatio ? (
                    <Lock className="h-4 w-4 text-primary" />
                  ) : (
                    <Unlock className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-xs text-muted-foreground">Height (in)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="12"
                    value={photoH}
                    onChange={(e) => changePhotoH(parseFloat(e.target.value) || photoH)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Photo size slider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Resize Photos</label>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.1"
                value={photoW}
                onChange={(e) => changePhotoW(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5 in</span>
                <span className="font-medium text-foreground">{photoW} × {photoH} in</span>
                <span>6 in</span>
              </div>
            </div>

            {/* Spacing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Gap (in)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={gapIn}
                  onChange={(e) => setGapIn(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Margin (in)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={padIn}
                  onChange={(e) => setPadIn(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Grid info */}
            {gridInfo.total > 0 && (
              <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {gridInfo.cols} × {gridInfo.rows} = {gridInfo.total} photos
                  </div>
                  <div className="text-xs text-muted-foreground">on {PAPER_SIZES[paper].label}</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={download}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Print Sheet (300 DPI)
              </button>
              <button
                onClick={() => { setHasImage(false); imgRef.current = null; }}
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Change image
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Preview</span>
              <span className="text-xs text-muted-foreground">Scaled to fit — download is full {DPI} DPI</span>
            </div>
            <div
              className="relative rounded-xl border border-border overflow-hidden flex items-center justify-center"
              style={{
                background: "repeating-conic-gradient(#e5e5e5 0% 25%, #f5f5f5 0% 50%) 0 0 / 20px 20px",
                minHeight: 320,
              }}
            >
              <canvas
                ref={previewRef}
                className="max-w-full max-h-[600px] object-contain shadow-xl rounded"
                style={{ display: "block" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">How it works:</strong> Upload any image — it&apos;s tiled across the sheet using cover-fit scaling (centered crop). Use the slider or dimension inputs to resize each photo, and adjust gap/margin to control spacing. Download at 300 DPI, then send to a home printer or photo lab.
      </div>
    </div>
  );
}
