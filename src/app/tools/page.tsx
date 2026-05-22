"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { registry } from "@/registry";
import { Badge } from "@/components/ui/badge";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryColors } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

export default function ToolsPage() {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="p-5 lg:p-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-1">All Tools</h1>
      <p className="text-base text-muted-foreground mb-8">
        {registry.tools.length} tools across {registry.categories.length} categories
      </p>

      <div className="flex flex-col gap-3">
        {registry.categories.map((category) => {
          const tools = registry.tools.filter((t) => t.category === category.id);
          if (!tools.length) return null;
          const isOpen = open[category.id] ?? false;
          const Icon = getCategoryIcon(category.icon);
          const colors = getCategoryColors(category.color);

          return (
            <div key={category.id} className="rounded-xl border border-border overflow-hidden shadow-sm">
              <button
                onClick={() => toggle(category.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 transition-colors text-left",
                  isOpen ? "bg-muted/40" : "bg-card hover:bg-muted/30"
                )}
              >
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", colors.iconBg)}>
                  <Icon className={cn("h-5 w-5", colors.iconText)} />
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-base">{category.name}</span>
                  <span className="hidden sm:inline text-sm text-muted-foreground ml-2">{category.description}</span>
                </div>
                <Badge variant="secondary" className="text-sm shrink-0">
                  {tools.length}
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen && (
                <div className="border-t border-border bg-muted/10 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tools.map((tool) => {
                      const ToolIcon = getCategoryIcon(tool.icon);
                      return (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.category}/${tool.slug}`}
                        className="group rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colors.iconBg)}>
                            <ToolIcon className={cn("h-4 w-4", colors.iconText)} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-semibold text-base leading-snug">{tool.name}</span>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5" />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {tool.shortDescription}
                        </p>
                        {tool.status !== "stable" && (
                          <Badge variant="outline" className="text-xs capitalize mt-2">{tool.status}</Badge>
                        )}
                      </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
