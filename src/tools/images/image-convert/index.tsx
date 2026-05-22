"use client";

import { useState, useCallback } from "react";
import { ImageDropzone, downloadBlob, loadImageFromFile, canvasToBlob } from "@/components/tool-ui/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download } from "lucide-react";
import type { ToolComponentProps } from "@/types/registry";

type TargetFormat = "jpeg" | "png" | "webp";

const FORMAT_LABELS: Record<TargetFormat, string> = {
  jpeg: "JPEG (.jpg)",
  png: "PNG (.png)",
  webp: "WebP (.webp)",
};

export default function ImageConvertTool({ toolMeta: _ }: ToolComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("png");
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
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
      // Fill white background for JPEG (no transparency)
      if (targetFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const mimeType = `image/${targetFormat}`;
      const blob = await canvasToBlob(canvas, mimeType, 0.92);
      setResult({ url: URL.createObjectURL(blob), blob });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
    const baseName = file?.name.replace(/\.[^.]+$/, "") ?? "image";
    downloadBlob(result.blob, `${baseName}.${ext}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <ImageDropzone onFile={handleFile} />

      {file && preview && (
        <>
          <div className="flex gap-4 items-start">
            <img src={preview} alt="Original" className="w-28 h-20 object-contain rounded-lg border border-border bg-muted/30" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{file.name}</p>
              <p>Type: {file.type || "unknown"}</p>
              <p>Size: {(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Convert to</Label>
            <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as TargetFormat)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(FORMAT_LABELS) as TargetFormat[]).map((f) => (
                  <SelectItem key={f} value={f}>{FORMAT_LABELS[f]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleProcess} disabled={processing} className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
            <RefreshCw className="w-4 h-4" />
            {processing ? "Converting…" : "Convert Image"}
          </Button>
        </>
      )}

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
      )}

      {result && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-pink-600">Converted Image ({FORMAT_LABELS[targetFormat]})</p>
          <img src={result.url} alt="Converted" className="max-h-60 object-contain rounded-lg border border-border bg-muted/30" />
          <p className="text-xs text-muted-foreground">{(result.blob.size / 1024).toFixed(1)} KB</p>
          <Button variant="outline" onClick={handleDownload} className="gap-2 self-start">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      )}
    </div>
  );
}
