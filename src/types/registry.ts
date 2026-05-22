import type { ComponentType } from "react";

export type CategoryId =
  | "json"
  | "generators"
  | "encoding"
  | "certificates"
  | "cryptography"
  | "network"
  | "text"
  | "datetime"
  | "images";

export interface ToolCategory {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  color: string;
  slug: string;
  order: number;
}

export interface ToolMeta {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: CategoryId;
  tags: string[];
  keywords: string[];
  icon: string;
  status: "stable" | "beta" | "new";
}

export interface ToolDefinition extends ToolMeta {
  component: () => Promise<{ default: ComponentType<ToolComponentProps> }>;
  // process() is imported directly at registry build time so the bundler can tree-shake it
  process: (input: unknown) => unknown | Promise<unknown>;
}

export interface ToolComponentProps {
  toolMeta: ToolMeta;
}

export interface ToolRegistry {
  categories: ToolCategory[];
  tools: ToolDefinition[];
}
