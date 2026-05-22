"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { registry } from "@/registry";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";

function parsePath(pathname: string): { category: string | null; tool: string | null } {
  const m = pathname.match(/^\/tools\/([^/]+)(?:\/([^/]+))?/);
  if (!m) return { category: null, tool: null };
  return { category: m[1], tool: m[2] ?? null };
}

export function AppSidebar() {
  const pathname = usePathname();
  const { category: activeCategory, tool: activeTool } = parsePath(pathname);

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-border/50 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <nav className="flex flex-col py-3 px-2">
        {registry.categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const isCategoryActive = activeCategory === category.id;
          const tools = registry.tools.filter((t) => t.category === category.id);

          return (
            <div key={category.id}>
              {/* Category link */}
              <Link
                href={`/tools/${category.slug}`}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isCategoryActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{category.name}</span>
                <span className="text-xs tabular-nums opacity-50">{tools.length}</span>
              </Link>

              {/* Show this category's tools only when it's active */}
              {isCategoryActive && tools.length > 0 && (
                <div className="mt-0.5 mb-1 ml-2 pl-3 border-l border-border/50 flex flex-col gap-0.5">
                  {tools.map((tool) => {
                    const href = `/tools/${tool.category}/${tool.slug}`;
                    const isActive = activeTool === tool.slug;
                    return (
                      <Link
                        key={tool.id}
                        href={href}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-sm transition-colors leading-tight",
                          isActive
                            ? "bg-primary/15 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                        )}
                      >
                        {tool.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
