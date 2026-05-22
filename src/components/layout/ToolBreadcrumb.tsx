import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ToolMeta } from "@/types/registry";
import { getCategory } from "@/registry";

interface Props {
  tool: ToolMeta;
}

export function ToolBreadcrumb({ tool }: Props) {
  const category = getCategory(tool.category);
  return (
    <nav className="flex items-center gap-1 text-base text-muted-foreground mb-2">
      <Link href="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <Link
        href={`/tools/${tool.category}`}
        className="hover:text-foreground transition-colors"
      >
        {category?.name ?? tool.category}
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="text-foreground font-medium">{tool.name}</span>
    </nav>
  );
}
