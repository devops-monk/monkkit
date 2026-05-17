import type { ToolCategory } from "@/types/registry";

export const CATEGORIES: ToolCategory[] = [
  {
    id: "json",
    name: "JSON Tools",
    description: "Validate, format, convert, and transform JSON data",
    icon: "Braces",
    color: "amber",
    slug: "json",
    order: 1,
  },
  {
    id: "generators",
    name: "Generators",
    description: "Generate QR codes, barcodes, and other visual assets",
    icon: "QrCode",
    color: "violet",
    slug: "generators",
    order: 2,
  },
  {
    id: "encoding",
    name: "Encoding",
    description: "Encode, decode, and hash data in various formats",
    icon: "Lock",
    color: "blue",
    slug: "encoding",
    order: 3,
  },
  {
    id: "certificates",
    name: "Certificates",
    description: "Decode, generate, and convert SSL/TLS certificates and keys",
    icon: "ShieldCheck",
    color: "green",
    slug: "certificates",
    order: 4,
  },
];
