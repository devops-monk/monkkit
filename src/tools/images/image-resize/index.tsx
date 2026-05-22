"use client";

import { useState, useCallback } from "react";
import { ImageDropzone, downloadBlob, loadImageFromFile, canvasToBlob } from "@/components/tool-ui/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Layers, Download } from "lucide-react";
import type { ToolComponentProps } from "@/types/registry";

export default function ImageResizeTool({ toolMeta: _ }: ToolComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintain, setMaintain] = useState(true);
  const [byPercent, setByPercent] = useState(false);
  const [percent, setPercent] = useState(100);
  const [result, setResult] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setResultBlob(null);
    setError(null);
    try {
      const img = await loadImageFromFile(f);
      setOrigDims({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      const url = URL.createObjectURL(f);
      setPreview(url);
    } catch {
      setError("Failed to load image");
    }
  }, []);

  const handleWidthChange = (v: number) => {
    setWidth(v);
    if (maintain && origDims) {
      setHeight(Math.round(v * (origDims.h / origDims.w)));
    }
  };

  const handleHeightChange = (v: number) => {
    setHeight(v);
    if (maintain && origDims) {
      setWidth(Math.round(v * (origDims.w / origDims.h)));
    }
  };

  const handleProcess = async () => {
    if (!file || !origDims) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImageFromFile(file);
      let targetW = width;
      let targetH = height;
      if (byPercent) {
        targetW = Math.round(origDims.w * (percent / 100));
        targetH = Math.round(origDims.h * (percent / 100));
      }
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const mimeType = file.type || "image/png";
      const blob = await canvasToBlob(canvas, mimeType, 0.92);
      setResultBlob(blob);
      setResult(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const ext = file.name.split(".").pop() ?? "png";
    downloadBlob(resultBlob, `resized.${ext}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <ImageDropzone onFile={handleFile} />

      {preview && origDims && (
        <>
          <div className="flex gap-4 items-start">
            <img src={preview} alt="Original" className="w-28 h-20 object-contain rounded-lg border border-border bg-muted/30" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{file?.name}</p>
              <p>Original: {origDims.w} × {origDims.h} px</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={byPercent} onCheckedChange={setByPercent} id="by-percent" />
            <Label htmlFor="by-percent">Resize by percentage</Label>
          </div>

          {byPercent ? (
            <div>
              <Label className="mb-2 block">Percentage: {percent}%</Label>
              <Slider min={1} max={400} step={1} defaultValue={[100]} onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setPercent(arr[0] as number); }} />
              <p className="text-xs text-muted-foreground mt-1">
                Output: {Math.round(origDims.w * percent / 100)} × {Math.round(origDims.h * percent / 100)} px
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Width (px)</Label>
                <Input type="number" min={1} value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} />
              </div>
              <div>
                <Label className="mb-1.5 block">Height (px)</Label>
                <Input type="number" min={1} value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch checked={maintain} onCheckedChange={setMaintain} id="maintain-ar" />
            <Label htmlFor="maintain-ar">Maintain aspect ratio</Label>
          </div>

          <Button onClick={handleProcess} disabled={processing} className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
            <Layers className="w-4 h-4" />
            {processing ? "Resizing…" : "Resize Image"}
          </Button>
        </>
      )}

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
      )}

      {result && resultBlob && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-pink-600">Result</p>
          <img src={result} alt="Resized" className="max-h-60 object-contain rounded-lg border border-border bg-muted/30" />
          <p className="text-xs text-muted-foreground">{(resultBlob.size / 1024).toFixed(1)} KB</p>
          <Button variant="outline" onClick={handleDownload} className="gap-2 self-start">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      )}
    </div>
  );
}
