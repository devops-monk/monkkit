import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserApiKeys } from "@/lib/api-key";
import { getUsageToday } from "@/lib/rate-limit";
import { CATEGORIES } from "@/registry/categories";
import { DashboardClient } from "./DashboardClient";

export const metadata = { title: "Dashboard | MonkKit" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const rawKeys = await getUserApiKeys(session.user.id);

  // Attach today's usage to each key
  const keys = await Promise.all(
    rawKeys.map(async (k) => {
      const { total } = await getUsageToday(k.id);
      return { ...k, usageToday: total };
    })
  );

  return (
    <DashboardClient
      keys={keys}
      categories={CATEGORIES}
      userName={session.user.name ?? ""}
      userImage={session.user.image ?? null}
    />
  );
}
