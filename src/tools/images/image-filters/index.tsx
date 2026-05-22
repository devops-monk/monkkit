"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageDropzone, downloadBlob, loadImageFromFile, canvasToBlob } from "@/components/tool-ui/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings, Download } from "lucide-react";
import type { ToolComponentProps } from "@/types/registry";

type Preset = "original" | "grayscale" | "sepia" | "invert" | "warm" | "cool" | "high-contrast";

interface FilterState {
  preset: Preset;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

const PRESETS: { id: Preset; label: string; brightness: number; contrast: number; saturation: number; blur: number }[] = [
  { id: "original", label: "Original", brightness: 0, contrast: 0, saturation: 0, blur: 0 },
  { id: "grayscale", label: "Grayscale", brightness: 0, contrast: 10, saturation: -100, blur: 0 },
  { id: "sepia", label: "Sepia", brightness: 5, contrast: 10, saturation: -60, blur: 0 },
  { id: "invert", label: "Invert", brightness: 0, contrast: 0, saturation: 0, blur: 0 },
  { id: "warm", label: "Warm", brightness: 10, contrast: 5, saturation: 20, blur: 0 },
  { id: "cool", label: "Cool", brightness: 5, contrast: 5, saturation: 10, blur: 0 },
  { id: "high-contrast", label: "High Contrast", brightness: 0, contrast: 60, saturation: 20, blur: 0 },
];

function buildFilterString(f: FilterState): string {
  const b = 1 + f.brightness / 100;
  const c = 1 + f.contrast / 100;
  const s = f.preset === "grayscale" ? "grayscale(100%)" :
            f.preset === "sepia" ? "sepia(80%)" :
            f.preset === "invert" ? "invert(100%)" :
            `saturate(${Math.max(0, 1 + f.saturation / 100)})`;
  return `brightness(${b}) contrast(${c}) ${s} blur(${f.blur}px)`;
}

export default function ImageFiltersTool({ toolMeta: _ }: ToolComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    preset: "original", brightness: 0, contrast: 0, saturation: 0, blur: 0,
  });
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    try {
      const loaded = await loadImageFromFile(f);
      setImg(loaded);
    } catch {
      setError("Failed to load image");
    }
  }, []);

  // Live preview via CSS filter on an img element
  const applyPreset = (presetId: Preset) => {
    const p = PRESETS.find((x) => x.id === presetId)!;
    setFilters({ preset: presetId, brightness: p.brightness, contrast: p.contrast, saturation: p.saturation, blur: p.blur });
  };

  const handleProcess = async () => {
    if (!file || !img) return;
    setProcessing(true);
    setError(null);
    try {
      const offscreen = document.createElement("canvas");
      offscreen.width = img.naturalWidth;
      offscreen.height = img.naturalHeight;
      const ctx = offscreen.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.filter = buildFilterString(filters);
      ctx.drawImage(img, 0, 0);
      const mimeType = file.type || "image/png";
      const blob = await canvasToBlob(offscreen, mimeType, 0.92);
      setResult({ url: URL.createObjectURL(blob), blob });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const ext = file.name.split(".").pop() ?? "png";
    downloadBlob(result.blob, `filtered.${ext}`);
  };

  const previewSrc = img ? img.src : null;

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <ImageDropzone onFile={handleFile} />

      {file && img && (
        <>
          {/* Live preview */}
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground mb-2">Live Preview</p>
            {previewSrc && (
              <img
                src={previewSrc}
                alt="Preview"
                style={{ filter: buildFilterString(filters) }}
                className="max-h-48 object-contain rounded-lg w-full"
              />
            )}
          </div>

          {/* Preset buttons */}
          <div>
            <Label className="mb-2 block">Filter Presets</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${filters.preset === p.id ? "bg-pink-500 text-white border-pink-500" : "border-border hover:border-pink-500/50"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Individual sliders */}
          <div className="flex flex-col gap-4">
            <div>
              <Label className="mb-2 block">Brightness: {filters.brightness}</Label>
              <Slider min={-100} max={100} step={1} value={[filters.brightness]}
                onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setFilters((f) => ({ ...f, brightness: arr[0] as number, preset: "original" })); }} />
            </div>
            <div>
              <Label className="mb-2 block">Contrast: {filters.contrast}</Label>
              <Slider min={-100} max={100} step={1} value={[filters.contrast]}
                onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setFilters((f) => ({ ...f, contrast: arr[0] as number, preset: "original" })); }} />
            </div>
            <div>
              <Label className="mb-2 block">Saturation: {filters.saturation}</Label>
              <Slider min={-100} max={100} step={1} value={[filters.saturation]}
                onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setFilters((f) => ({ ...f, saturation: arr[0] as number, preset: "original" })); }} />
            </div>
            <div>
              <Label className="mb-2 block">Blur: {filters.blur}px</Label>
              <Slider min={0} max={20} step={0.5} value={[filters.blur]}
                onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setFilters((f) => ({ ...f, blur: arr[0] as number, preset: "original" })); }} />
            </div>
          </div>

          <Button onClick={handleProcess} disabled={processing} className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
            <Settings className="w-4 h-4" />
            {processing ? "Applying…" : "Apply Filters"}
          </Button>
        </>
      )}

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
      )}

      {result && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-pink-600">Filtered Image</p>
          <img src={result.url} alt="Filtered" className="max-h-60 object-contain rounded-lg border border-border bg-muted/30" />
          <Button variant="outline" onClick={handleDownload} className="gap-2 self-start">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      )}
    </div>
  );
}
