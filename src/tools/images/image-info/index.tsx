"use client";

import { useState, useCallback } from "react";
import { ImageDropzone, loadImageFromFile } from "@/components/tool-ui/ImageDropzone";
import { FileSearch } from "lucide-react";
import type { ToolComponentProps } from "@/types/registry";

interface ImageInfo {
  filename: string;
  fileSize: string;
  type: string;
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: string;
  lastModified: string;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageInfoTool({ toolMeta: _ }: ToolComponentProps) {
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setInfo(null);
    setPreview(URL.createObjectURL(f));
    try {
      const img = await loadImageFromFile(f);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const d = gcd(w, h);
      const aspectRatio = `${w / d}:${h / d}`;
      const megapixels = ((w * h) / 1_000_000).toFixed(2);
      setInfo({
        filename: f.name,
        fileSize: fmtSize(f.size),
        type: f.type || "unknown",
        width: w,
        height: h,
        aspectRatio,
        megapixels,
        lastModified: f.lastModified ? new Date(f.lastModified).toLocaleString() : "Unknown",
      });
    } catch {
      setError("Failed to read image metadata");
    }
  }, []);

  const rows: { label: string; value: string | number }[] = info ? [
    { label: "Filename", value: info.filename },
    { label: "File Size", value: info.fileSize },
    { label: "Type / MIME", value: info.type },
    { label: "Width", value: `${info.width} px` },
    { label: "Height", value: `${info.height} px` },
    { label: "Dimensions", value: `${info.width} × ${info.height}` },
    { label: "Aspect Ratio", value: info.aspectRatio },
    { label: "Megapixels", value: `${info.megapixels} MP` },
    { label: "Last Modified", value: info.lastModified },
  ] : [];

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <ImageDropzone onFile={handleFile} />

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
      )}

      {preview && info && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <img src={preview} alt="Preview" className="w-28 h-20 object-contain rounded-lg border border-border bg-muted/30" />
            <div>
              <p className="font-medium">{info.filename}</p>
              <p className="text-sm text-muted-foreground">{info.width} × {info.height} px · {info.fileSize}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-muted/20" : "bg-background"}`}
              >
                <div className="flex items-center gap-2 w-36 shrink-0">
                  <FileSearch className="w-4 h-4 text-pink-600 shrink-0" />
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                </div>
                <span className="text-sm font-medium break-all">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!info && !error && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
          <FileSearch className="w-12 h-12 opacity-20" />
          <p className="text-sm">Drop an image above to see its metadata</p>
        </div>
      )}
    </div>
  );
}
