"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ImageDropzone } from "@/components/tool-ui/ImageDropzone";
import { Download, Printer, RefreshCw, Check } from "lucide-react";

const FORMATS = {
  us: { label: "US / Canada (2×2 in)", w: 2, h: 2, unit: "in" as const, dpi: 300 },
  uk: { label: "UK (35×45 mm)", w: 35, h: 45, unit: "mm" as const, dpi: 300 },
  eu: { label: "EU / Schengen (35×45 mm)", w: 35, h: 45, unit: "mm" as const, dpi: 300 },
  india: { label: "India (51×51 mm)", w: 51, h: 51, unit: "mm" as const, dpi: 300 },
  australia: { label: "Australia (35×45 mm)", w: 35, h: 45, unit: "mm" as const, dpi: 300 },
  china: { label: "China (33×48 mm)", w: 33, h: 48, unit: "mm" as const, dpi: 300 },
  uae: { label: "UAE (40×60 mm)", w: 40, h: 60, unit: "mm" as const, dpi: 300 },
  japan: { label: "Japan (35×45 mm)", w: 35, h: 45, unit: "mm" as const, dpi: 300 },
} as const;

type FormatKey = keyof typeof FORMATS;

function toPixels(fmt: (typeof FORMATS)[FormatKey]) {
  if (fmt.unit === "in") return { w: Math.round(fmt.w * fmt.dpi), h: Math.round(fmt.h * fmt.dpi) };
  return { w: Math.round((fmt.w / 25.4) * fmt.dpi), h: Math.round((fmt.h / 25.4) * fmt.dpi) };
}

const BG_PRESETS = [
  { label: "White", color: "#ffffff" },
  { label: "Off-white", color: "#f5f5f0" },
  { label: "Light blue", color: "#c3d9f0" },
  { label: "Light grey", color: "#e0e0e0" },
];

type Crop = { x: number; y: number; w: number; h: number };
type DragMode = "move" | "nw" | "ne" | "sw" | "se" | null;

const HANDLE_RADIUS = 7;

function drawCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  crop: Crop
) {
  const ctx = canvas.getContext("2d")!;
  const { width: cw, height: ch } = canvas;

  ctx.drawImage(img, 0, 0, cw, ch);

  ctx.fillStyle = "rgba(0,0,0,0.48)";
  ctx.fillRect(0, 0, cw, ch);

  // Reveal crop area
  ctx.save();
  ctx.beginPath();
  ctx.rect(crop.x, crop.y, crop.w, crop.h);
  ctx.clip();
  ctx.drawImage(img, 0, 0, cw, ch);
  ctx.restore();

  // Crop border
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 2;
  ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

  // Rule of thirds
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 0.75;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(crop.x + (crop.w * i) / 3, crop.y);
    ctx.lineTo(crop.x + (crop.w * i) / 3, crop.y + crop.h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(crop.x, crop.y + (crop.h * i) / 3);
    ctx.lineTo(crop.x + crop.w, crop.y + (crop.h * i) / 3);
    ctx.stroke();
  }

  // Corner handles
  const corners = [
    { x: crop.x, y: crop.y },
    { x: crop.x + crop.w, y: crop.y },
    { x: crop.x, y: crop.y + crop.h },
    { x: crop.x + crop.w, y: crop.y + crop.h },
  ];
  corners.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#6366f1";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

export default function PassportPhotoTool() {
  const [hasImage, setHasImage] = useState(false);
  const [format, setFormat] = useState<FormatKey>("us");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [customBg, setCustomBg] = useState("#ffffff");
  const [downloaded, setDownloaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const cropRef = useRef<Crop | null>(null);
  const formatRef = useRef<FormatKey>("us");
  const bgRef = useRef("#ffffff");
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startCrop: Crop;
  } | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const crop = cropRef.current;
    if (!canvas || !img || !crop) return;
    drawCanvas(canvas, img, crop);
  }, []);

  const initCrop = useCallback(
    (img: HTMLImageElement, fmtKey: FormatKey) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const parent = canvas.parentElement;
      const maxW = parent ? parent.clientWidth : 640;
      const maxH = 500;
      const s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      canvas.width = Math.round(img.naturalWidth * s);
      canvas.height = Math.round(img.naturalHeight * s);

      const fmt = FORMATS[fmtKey];
      const aspect = fmt.w / fmt.h;
      const dw = canvas.width;
      const dh = canvas.height;

      let cw = dw * 0.68;
      let ch = cw / aspect;
      if (ch > dh * 0.88) {
        ch = dh * 0.88;
        cw = ch * aspect;
      }

      cropRef.current = {
        x: (dw - cw) / 2,
        y: (dh - ch) / 2,
        w: cw,
        h: ch,
      };
      redraw();
    },
    [redraw]
  );

  // Re-init crop aspect ratio when format changes (keep center)
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const prev = cropRef.current;
    if (!canvas || !img || !prev) return;

    formatRef.current = format;
    const fmt = FORMATS[format];
    const aspect = fmt.w / fmt.h;
    const cx = prev.x + prev.w / 2;
    const cy = prev.y + prev.h / 2;

    let cw = prev.w;
    let ch = cw / aspect;
    const dw = canvas.width;
    const dh = canvas.height;
    if (ch > dh) {
      ch = dh;
      cw = ch * aspect;
    }
    if (cw > dw) {
      cw = dw;
      ch = cw / aspect;
    }

    cropRef.current = {
      x: Math.max(0, Math.min(dw - cw, cx - cw / 2)),
      y: Math.max(0, Math.min(dh - ch, cy - ch / 2)),
      w: cw,
      h: ch,
    };
    redraw();
  }, [format, redraw]);

  // Pointer events for crop interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function canvasCoords(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const sx = canvas!.width / rect.width;
      const sy = canvas!.height / rect.height;
      return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
    }

    function hitMode(pos: { x: number; y: number }, crop: Crop): DragMode {
      const { x, y } = pos;
      const corners: { mode: DragMode; cx: number; cy: number }[] = [
        { mode: "nw", cx: crop.x, cy: crop.y },
        { mode: "ne", cx: crop.x + crop.w, cy: crop.y },
        { mode: "sw", cx: crop.x, cy: crop.y + crop.h },
        { mode: "se", cx: crop.x + crop.w, cy: crop.y + crop.h },
      ];
      for (const c of corners) {
        if (Math.hypot(x - c.cx, y - c.cy) < HANDLE_RADIUS * 2.2) return c.mode;
      }
      if (x >= crop.x && x <= crop.x + crop.w && y >= crop.y && y <= crop.y + crop.h)
        return "move";
      return null;
    }

    function onPointerDown(e: PointerEvent) {
      const crop = cropRef.current;
      if (!crop) return;
      const pos = canvasCoords(e);
      const mode = hitMode(pos, crop);
      if (!mode) return;
      e.preventDefault();
      canvas!.setPointerCapture(e.pointerId);
      dragRef.current = { mode, startX: pos.x, startY: pos.y, startCrop: { ...crop } };
    }

    function onPointerMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) {
        // Update cursor
        const crop = cropRef.current;
        if (!crop) return;
        const pos = canvasCoords(e);
        const mode = hitMode(pos, crop);
        const cursors: Record<string, string> = {
          nw: "nw-resize", ne: "ne-resize", sw: "sw-resize", se: "se-resize", move: "move",
        };
        canvas!.style.cursor = mode ? (cursors[mode] ?? "default") : "default";
        return;
      }

      const c = canvasRef.current!;
      const dw = c.width;
      const dh = c.height;
      const pos = canvasCoords(e);
      const { mode, startCrop: sc } = drag;
      const aspect = FORMATS[formatRef.current].w / FORMATS[formatRef.current].h;
      const MIN = 60;

      let newCrop: Crop;

      if (mode === "move") {
        newCrop = {
          x: Math.max(0, Math.min(dw - sc.w, sc.x + (pos.x - drag.startX))),
          y: Math.max(0, Math.min(dh - sc.h, sc.y + (pos.y - drag.startY))),
          w: sc.w,
          h: sc.h,
        };
      } else {
        // Resize from fixed opposite corner
        let fixedX: number, fixedY: number, curX: number, curY: number;
        if (mode === "se") { fixedX = sc.x; fixedY = sc.y; curX = pos.x; curY = pos.y; }
        else if (mode === "nw") { fixedX = sc.x + sc.w; fixedY = sc.y + sc.h; curX = pos.x; curY = pos.y; }
        else if (mode === "ne") { fixedX = sc.x; fixedY = sc.y + sc.h; curX = pos.x; curY = pos.y; }
        else { fixedX = sc.x + sc.w; fixedY = sc.y; curX = pos.x; curY = pos.y; }

        let newW = Math.abs(curX - fixedX);
        let newH = Math.abs(curY - fixedY);

        // Enforce aspect ratio (use whichever delta is larger)
        if (newW / aspect > newH) newH = newW / aspect;
        else newW = newH * aspect;
        newW = Math.max(MIN, newW);
        newH = newW / aspect;

        // Clamp to canvas
        newW = Math.min(newW, dw);
        newH = Math.min(newH, dh);
        newW = Math.min(newW, dh * aspect);
        newH = newW / aspect;

        const nx = mode === "se" || mode === "ne" ? fixedX : fixedX - newW;
        const ny = mode === "se" || mode === "sw" ? fixedY : fixedY - newH;

        newCrop = {
          x: Math.max(0, Math.min(dw - newW, nx)),
          y: Math.max(0, Math.min(dh - newH, ny)),
          w: newW,
          h: newH,
        };
      }

      cropRef.current = newCrop;
      redraw();
    }

    function onPointerUp() {
      dragRef.current = null;
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
    };
  }, [redraw]);

  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        imgRef.current = img;
        setHasImage(true);
        // Defer so canvas is in DOM
        requestAnimationFrame(() => initCrop(img, formatRef.current));
      };
      img.src = url;
    },
    [initCrop]
  );

  function generateOutputCanvas(): HTMLCanvasElement | null {
    const img = imgRef.current;
    const crop = cropRef.current;
    const display = canvasRef.current;
    if (!img || !crop || !display) return null;

    const fmt = FORMATS[formatRef.current];
    const { w: outW, h: outH } = toPixels(fmt);

    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext("2d")!;

    ctx.fillStyle = bgRef.current;
    ctx.fillRect(0, 0, outW, outH);

    const dw = display.width;
    const dh = display.height;
    const srcX = (crop.x / dw) * img.naturalWidth;
    const srcY = (crop.y / dh) * img.naturalHeight;
    const srcW = (crop.w / dw) * img.naturalWidth;
    const srcH = (crop.h / dh) * img.naturalHeight;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    return out;
  }

  const download = useCallback(() => {
    const out = generateOutputCanvas();
    if (!out) return;
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `passport-photo-${formatRef.current}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }, "image/png");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const downloadSheet = useCallback(() => {
    const photo = generateOutputCanvas();
    if (!photo) return;

    const sheetW = 4 * 300;
    const sheetH = 6 * 300;
    const sheet = document.createElement("canvas");
    sheet.width = sheetW;
    sheet.height = sheetH;
    const ctx = sheet.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, sheetW, sheetH);

    const { w: pw, h: ph } = toPixels(FORMATS[formatRef.current]);
    const cols = Math.floor(sheetW / pw);
    const rows = Math.floor(sheetH / ph);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.drawImage(photo, c * pw, r * ph);
      }
    }

    sheet.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `passport-photo-sheet-${formatRef.current}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function setBg(color: string) {
    setBgColor(color);
    bgRef.current = color;
  }

  return (
    <div className="flex flex-col gap-6">
      {!hasImage ? (
        <ImageDropzone
          onFile={handleFile}
          label="Drop your photo here, or click to browse"
          accept="image/*"
        />
      ) : (
        <div className="flex flex-col gap-5">
          {/* Controls row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Format selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Country / Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as FormatKey)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {(Object.keys(FORMATS) as FormatKey[]).map((key) => (
                  <option key={key} value={key}>
                    {FORMATS[key].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Background */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Background Color</label>
              <div className="flex items-center gap-2">
                {BG_PRESETS.map(({ label, color }) => (
                  <button
                    key={color}
                    onClick={() => setBg(color)}
                    title={label}
                    className={`h-8 w-8 rounded-lg border-2 transition-all flex-shrink-0 ${
                      bgColor === color ? "border-primary scale-110 shadow-sm" : "border-border hover:border-primary/40"
                    }`}
                    style={{ background: color }}
                  />
                ))}
                <div className="relative flex-shrink-0">
                  <input
                    type="color"
                    value={customBg}
                    onChange={(e) => {
                      setCustomBg(e.target.value);
                      setBg(e.target.value);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8 rounded-lg"
                    title="Custom color"
                  />
                  <div
                    className={`h-8 w-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      !BG_PRESETS.some((p) => p.color === bgColor)
                        ? "border-primary scale-110"
                        : "border-dashed border-border"
                    }`}
                    style={{ background: customBg }}
                  >
                    {BG_PRESETS.some((p) => p.color === bgColor) ? (
                      <span className="text-muted-foreground opacity-60">+</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Export</label>
              <div className="flex gap-2">
                <button
                  onClick={download}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {downloaded ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  PNG
                </button>
                <button
                  onClick={downloadSheet}
                  title="Download a 4×6 print sheet with multiple photos"
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Print Sheet
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Drag the crop box to move &bull; drag a corner to resize (aspect ratio locked) &bull; background color fills behind the photo
            </p>
            <div
              className="relative rounded-xl overflow-hidden border border-border"
              style={{
                background:
                  "repeating-conic-gradient(#e5e5e5 0% 25%, #f5f5f5 0% 50%) 0 0 / 20px 20px",
              }}
            >
              <canvas ref={canvasRef} className="w-full block touch-none select-none" />
            </div>
          </div>

          <button
            onClick={() => {
              setHasImage(false);
              imgRef.current = null;
              cropRef.current = null;
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
          >
            <RefreshCw className="h-4 w-4" />
            Use a different photo
          </button>
        </div>
      )}

      {/* Size reference table */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold mb-3">Supported Formats &amp; Output Dimensions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(FORMATS) as FormatKey[]).map((key) => {
            const fmt = FORMATS[key];
            const { w, h } = toPixels(fmt);
            return (
              <button
                key={key}
                onClick={() => setFormat(key)}
                className={`rounded-lg p-3 text-left text-xs transition-all border ${
                  format === key
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/30"
                }`}
              >
                <div className="font-semibold text-foreground">{fmt.label}</div>
                <div className="text-muted-foreground mt-0.5">
                  {w} × {h} px @ {fmt.dpi} DPI
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
        <strong>Print tip:</strong> &ldquo;Print Sheet&rdquo; generates a 4×6 inch layout (standard photo print size) with as many copies as fit — ready to print at a photo lab or at home.
      </div>
    </div>
  );
}
