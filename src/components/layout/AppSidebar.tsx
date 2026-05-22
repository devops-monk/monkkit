"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { registry } from "@/registry";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryColors } from "@/lib/category-colors";

function parsePath(pathname: string): { category: string | null; tool: string | null } {
  const m = pathname.match(/^\/tools\/([^/]+)(?:\/([^/]+))?/);
  if (!m) return { category: null, tool: null };
  return { category: m[1], tool: m[2] ?? null };
}

export function AppSidebar() {
  const pathname = usePathname();
  const { category: activeCategory, tool: activeTool } = parsePath(pathname);

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-border bg-sidebar h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {/* Category label */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Categories
        </p>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 pb-4">
        {registry.categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const colors = getCategoryColors(category.color);
          const isCategoryActive = activeCategory === category.id;
          const tools = registry.tools.filter((t) => t.category === category.id);

          return (
            <div key={category.id}>
              {/* Category nav item */}
              <Link
                href={`/tools/${category.slug}`}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isCategoryActive
                    ? `${colors.activeBg} ${colors.activeText}`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", colors.iconBg)}>
                  <Icon className={cn("h-4 w-4", colors.iconText)} />
                </span>
                <span className="flex-1 truncate">{category.name}</span>
                <span className={cn(
                  "text-xs tabular-nums font-medium px-1.5 py-0.5 rounded-md",
                  isCategoryActive ? colors.badgeBg : "bg-muted text-muted-foreground"
                )}>
                  {tools.length}
                </span>
              </Link>

              {/* Tool list — only shown for active category */}
              {isCategoryActive && tools.length > 0 && (
                <div className="mt-1 mb-2 ml-5 pl-4 border-l-2 border-border flex flex-col gap-0.5">
                  {tools.map((tool) => {
                    const href = `/tools/${tool.category}/${tool.slug}`;
                    const isActive = activeTool === tool.slug;
                    return (
                      <Link
                        key={tool.id}
                        href={href}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-sm transition-colors leading-snug",
                          isActive
                            ? `${colors.activeBg} ${colors.activeText} font-semibold`
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
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
