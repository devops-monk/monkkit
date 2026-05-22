"use client";

import { useRef, useState } from "react";
import { Upload, ImageIcon } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
}

export function ImageDropzone({ onFile, accept = "image/*", label = "Drop an image here, or click to browse" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File | undefined) => {
    if (f && f.type.startsWith("image/")) onFile(f);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-12 px-6
        ${dragging ? "border-primary bg-primary/8 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
    >
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
        <ImageIcon className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-base font-medium">{label}</p>
        <p className="text-sm text-muted-foreground mt-1">JPG, PNG, WebP, GIF, SVG — up to 20 MB</p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary">
        <Upload className="h-4 w-4" /> Choose file
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Canvas export failed")), type, quality);
  });
}
