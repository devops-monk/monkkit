import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategory, getToolsByCategory, registry } from "@/registry";
import { Badge } from "@/components/ui/badge";
import type { CategoryId } from "@/types/registry";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryColors } from "@/lib/category-colors";
import { ArrowRight } from "lucide-react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export async function generateStaticParams() {
  return registry.categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category as CategoryId);
  if (!cat) return {};
  return {
    title: `${cat.name} | MonkKit`,
    description: cat.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category as CategoryId);
  if (!cat) notFound();

  const tools = getToolsByCategory(cat.id);
  const Icon = getCategoryIcon(cat.icon);
  const colors = getCategoryColors(cat.color);

  return (
    <div className="p-5 lg:p-8 max-w-5xl">
      {/* Category header */}
      <div className={cn("rounded-2xl border p-6 mb-8 flex items-center gap-5", colors.border, colors.iconBg + "/40")}>
        <div className={cn("rounded-2xl p-4 shrink-0", colors.iconBg)}>
          <Icon className={cn("h-10 w-10", colors.iconText)} />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">{cat.name}</h1>
          <p className="text-base text-muted-foreground">{cat.description}</p>
          <p className="text-sm text-muted-foreground mt-1">{tools.length} tools available</p>
        </div>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const ToolIcon = getCategoryIcon(tool.icon);
          return (
          <Link
            key={tool.id}
            href={`/tools/${tool.category}/${tool.slug}`}
            className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colors.iconBg)}>
                <ToolIcon className={cn("h-4.5 w-4.5", colors.iconText)} />
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start justify-between gap-1">
                  <span className="font-semibold text-base leading-snug">{tool.name}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5" />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {tool.shortDescription}
            </p>
            {tool.status !== "stable" && (
              <Badge variant="outline" className="text-xs capitalize mt-2">
                {tool.status}
              </Badge>
            )}
          </Link>
          );
        })}
      </div>

      {tools.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-base">No tools yet — check back soon!</p>
        </div>
      )}
    </div>
  );
}
