import { CATEGORIES } from "./categories";
import { jsonTools } from "./tools/json";
import { generatorTools } from "./tools/generators";
import { encodingTools } from "./tools/encoding";
import { certificateTools } from "./tools/certificates";
import { cryptographyTools } from "./tools/cryptography";
import { networkTools } from "./tools/network";
import { textTools } from "./tools/text";
import { datetimeTools } from "./tools/datetime";
import type { ToolRegistry, ToolDefinition, CategoryId } from "@/types/registry";

export const registry: ToolRegistry = {
  categories: CATEGORIES,
  tools: [
    ...jsonTools,
    ...generatorTools,
    ...encodingTools,
    ...cryptographyTools,
    ...networkTools,
    ...textTools,
    ...datetimeTools,
    ...certificateTools,
  ],
};

export function getAllTools(): ToolDefinition[] {
  return registry.tools;
}

export function getToolsByCategory(categoryId: CategoryId): ToolDefinition[] {
  return registry.tools.filter((t) => t.category === categoryId);
}

export function getToolBySlug(
  category: string,
  slug: string
): ToolDefinition | undefined {
  return registry.tools.find(
    (t) => t.category === category && t.slug === slug
  );
}

export function getAllToolSlugs(): { category: string; tool: string }[] {
  return registry.tools.map((t) => ({ category: t.category, tool: t.slug }));
}

export function getCategory(id: CategoryId) {
  return registry.categories.find((c) => c.id === id);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase();
  return registry.tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q)) ||
      t.shortDescription.toLowerCase().includes(q)
  );
}
