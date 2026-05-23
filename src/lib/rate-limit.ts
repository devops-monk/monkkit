import { prisma } from "@/lib/db";

const DAILY_LIMIT = 100;

export async function checkRateLimit(
  apiKeyId: string,
  tool: string
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upsert daily counter
  const usage = await prisma.apiUsage.upsert({
    where: { apiKeyId_tool_date: { apiKeyId, tool, date: today } },
    update: { count: { increment: 1 } },
    create: { apiKeyId, tool, date: today, count: 1 },
  });

  return usage.count <= DAILY_LIMIT;
}

export async function getUsageToday(apiKeyId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = await prisma.apiUsage.findMany({
    where: { apiKeyId, date: today },
  });

  const total = rows.reduce((sum: number, r: { count: number }) => sum + r.count, 0);
  return { total, limit: DAILY_LIMIT, rows };
}
