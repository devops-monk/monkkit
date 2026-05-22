// Tailwind color classes for each category (icon bg, icon color, badge bg, badge text)
export interface CategoryColors {
  iconBg: string;
  iconText: string;
  badgeBg: string;
  badgeText: string;
  activeBg: string;
  activeText: string;
  border: string;
}

const MAP: Record<string, CategoryColors> = {
  amber: {
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-700 dark:text-amber-300",
    activeBg: "bg-amber-500/10",
    activeText: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
  },
  violet: {
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-600 dark:text-violet-400",
    badgeBg: "bg-violet-500/15",
    badgeText: "text-violet-700 dark:text-violet-300",
    activeBg: "bg-violet-500/10",
    activeText: "text-violet-700 dark:text-violet-300",
    border: "border-violet-500/30",
  },
  blue: {
    iconBg: "bg-blue-500/15",
    iconText: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-700 dark:text-blue-300",
    activeBg: "bg-blue-500/10",
    activeText: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
  },
  red: {
    iconBg: "bg-red-500/15",
    iconText: "text-red-600 dark:text-red-400",
    badgeBg: "bg-red-500/15",
    badgeText: "text-red-700 dark:text-red-300",
    activeBg: "bg-red-500/10",
    activeText: "text-red-700 dark:text-red-300",
    border: "border-red-500/30",
  },
  cyan: {
    iconBg: "bg-cyan-500/15",
    iconText: "text-cyan-600 dark:text-cyan-400",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    activeBg: "bg-cyan-500/10",
    activeText: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/30",
  },
  indigo: {
    iconBg: "bg-indigo-500/15",
    iconText: "text-indigo-600 dark:text-indigo-400",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    activeBg: "bg-indigo-500/10",
    activeText: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
  },
  orange: {
    iconBg: "bg-orange-500/15",
    iconText: "text-orange-600 dark:text-orange-400",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-700 dark:text-orange-300",
    activeBg: "bg-orange-500/10",
    activeText: "text-orange-700 dark:text-orange-300",
    border: "border-orange-500/30",
  },
  teal: {
    iconBg: "bg-teal-500/15",
    iconText: "text-teal-600 dark:text-teal-400",
    badgeBg: "bg-teal-500/15",
    badgeText: "text-teal-700 dark:text-teal-300",
    activeBg: "bg-teal-500/10",
    activeText: "text-teal-700 dark:text-teal-300",
    border: "border-teal-500/30",
  },
  green: {
    iconBg: "bg-green-500/15",
    iconText: "text-green-600 dark:text-green-400",
    badgeBg: "bg-green-500/15",
    badgeText: "text-green-700 dark:text-green-300",
    activeBg: "bg-green-500/10",
    activeText: "text-green-700 dark:text-green-300",
    border: "border-green-500/30",
  },
};

const FALLBACK: CategoryColors = {
  iconBg: "bg-primary/15",
  iconText: "text-primary",
  badgeBg: "bg-primary/15",
  badgeText: "text-primary",
  activeBg: "bg-primary/10",
  activeText: "text-primary",
  border: "border-primary/30",
};

export function getCategoryColors(color: string): CategoryColors {
  return MAP[color] ?? FALLBACK;
}
