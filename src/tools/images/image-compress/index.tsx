"use client";

import { useState, useCallback } from "react";
import { ImageDropzone, downloadBlob, loadImageFromFile, canvasToBlob } from "@/components/tool-ui/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Download } from "lucide-react";
import type { ToolComponentProps } from "@/types/registry";

type Format = "jpeg" | "webp" | "png";

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageCompressTool({ toolMeta: _ }: ToolComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<Format>("jpeg");
  const [result, setResult] = useState<{ url: string; blob: Blob; origSize: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0);
      const mimeType = `image/${format}`;
      const blob = await canvasToBlob(canvas, mimeType, quality / 100);
      setResult({ url: URL.createObjectURL(blob), blob, origSize: file.size });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const ext = format === "jpeg" ? "jpg" : format;
    downloadBlob(result.blob, `compressed.${ext}`);
  };

  const savings = result ? Math.max(0, ((result.origSize - result.blob.size) / result.origSize) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <ImageDropzone onFile={handleFile} />

      {file && preview && (
        <>
          <div className="flex gap-4 items-start">
            <img src={preview} alt="Original" className="w-28 h-20 object-contain rounded-lg border border-border bg-muted/30" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{file.name}</p>
              <p>Original size: {fmtSize(file.size)}</p>
              <p>Type: {file.type}</p>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Output Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
                <SelectItem value="png">PNG (lossless)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Quality: {quality}%</Label>
            <Slider
              min={1}
              max={100}
              step={1}
              defaultValue={[80]}
              onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setQuality(arr[0] as number); }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 (smallest)</span><span>100 (best)</span>
            </div>
          </div>

          <Button onClick={handleProcess} disabled={processing} className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
            <Filter className="w-4 h-4" />
            {processing ? "Compressing…" : "Compress Image"}
          </Button>
        </>
      )}

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
      )}

      {result && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-pink-600">Compression Result</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-xs text-muted-foreground">Original</p>
              <p className="font-semibold">{fmtSize(result.origSize)}</p>
            </div>
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-xs text-muted-foreground">Compressed</p>
              <p className="font-semibold">{fmtSize(result.blob.size)}</p>
            </div>
            <div className="rounded-lg bg-pink-500/15 border border-pink-500/30 p-3">
              <p className="text-xs text-pink-600">Savings</p>
              <p className="font-semibold text-pink-600">{savings.toFixed(1)}%</p>
            </div>
          </div>
          <img src={result.url} alt="Compressed" className="max-h-48 object-contain rounded-lg border border-border bg-muted/30" />
          <Button variant="outline" onClick={handleDownload} className="gap-2 self-start">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      )}
    </div>
  );
}
