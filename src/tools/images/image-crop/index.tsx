"use client";

import { useState, useCallback } from "react";
import { ImageDropzone, downloadBlob, loadImageFromFile, canvasToBlob } from "@/components/tool-ui/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Download } from "lucide-react";
import type { ToolComponentProps } from "@/types/registry";

export default function ImageCropTool({ toolMeta: _ }: ToolComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(100);
  const [cropH, setCropH] = useState(100);
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    try {
      const img = await loadImageFromFile(f);
      setOrigDims({ w: img.naturalWidth, h: img.naturalHeight });
      setCropX(0);
      setCropY(0);
      setCropW(img.naturalWidth);
      setCropH(img.naturalHeight);
      setPreview(URL.createObjectURL(f));
    } catch {
      setError("Failed to load image");
    }
  }, []);

  const handleProcess = async () => {
    if (!file || !origDims) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImageFromFile(file);
      const x = Math.max(0, Math.min(cropX, origDims.w - 1));
      const y = Math.max(0, Math.min(cropY, origDims.h - 1));
      const w = Math.max(1, Math.min(cropW, origDims.w - x));
      const h = Math.max(1, Math.min(cropH, origDims.h - y));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      const mimeType = file.type || "image/png";
      const blob = await canvasToBlob(canvas, mimeType, 0.92);
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
    downloadBlob(result.blob, `cropped.${ext}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <ImageDropzone onFile={handleFile} />

      {file && preview && origDims && (
        <>
          <div className="flex gap-4 items-start">
            <img src={preview} alt="Original" className="w-28 h-20 object-contain rounded-lg border border-border bg-muted/30" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{file.name}</p>
              <p>Dimensions: {origDims.w} × {origDims.h} px</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-4">
            <p className="text-sm font-medium">Crop Region (pixels)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">X (left offset)</Label>
                <Input type="number" min={0} max={origDims.w - 1} value={cropX} onChange={(e) => setCropX(Number(e.target.value))} />
              </div>
              <div>
                <Label className="mb-1.5 block">Y (top offset)</Label>
                <Input type="number" min={0} max={origDims.h - 1} value={cropY} onChange={(e) => setCropY(Number(e.target.value))} />
              </div>
              <div>
                <Label className="mb-1.5 block">Width</Label>
                <Input type="number" min={1} max={origDims.w} value={cropW} onChange={(e) => setCropW(Number(e.target.value))} />
              </div>
              <div>
                <Label className="mb-1.5 block">Height</Label>
                <Input type="number" min={1} max={origDims.h} value={cropH} onChange={(e) => setCropH(Number(e.target.value))} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Output: {Math.min(cropW, origDims.w - cropX)} × {Math.min(cropH, origDims.h - cropY)} px</p>
          </div>

          <Button onClick={handleProcess} disabled={processing} className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
            <ImageIcon className="w-4 h-4" />
            {processing ? "Cropping…" : "Crop Image"}
          </Button>
        </>
      )}

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
      )}

      {result && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-pink-600">Cropped Image</p>
          <img src={result.url} alt="Cropped" className="max-h-60 object-contain rounded-lg border border-border bg-muted/30" />
          <p className="text-xs text-muted-foreground">{(result.blob.size / 1024).toFixed(1)} KB</p>
          <Button variant="outline" onClick={handleDownload} className="gap-2 self-start">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      )}
    </div>
  );
}
