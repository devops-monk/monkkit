import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategory, getToolsByCategory, registry } from "@/registry";
import { Badge } from "@/components/ui/badge";
import type { CategoryId } from "@/types/registry";
import { getCategoryIcon } from "@/lib/category-icons";

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

  return (
    <div className="p-5 lg:p-8">
      {/* Category header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="rounded-xl bg-primary/10 p-3 shrink-0">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{cat.name}</h1>
          <p className="text-base text-muted-foreground mt-0.5">{cat.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.category}/${tool.slug}`}
            className="group rounded-xl border border-border/50 bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-base">{tool.name}</span>
              {tool.status !== "stable" && (
                <Badge variant="outline" className="text-xs capitalize shrink-0">
                  {tool.status}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {tool.shortDescription}
            </p>
          </Link>
        ))}
      </div>

      {tools.length === 0 && (
        <p className="text-muted-foreground text-base">
          No tools yet. Check back soon!
        </p>
      )}
    </div>
  );
}
