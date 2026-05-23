import { prisma } from "@/lib/db";

export const DAILY_LIMIT = 100;

export async function checkRateLimit(
  apiKeyId: string,
  userId: string,
  tool: string
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Record this call
  await prisma.apiUsage.upsert({
    where: { apiKeyId_tool_date: { apiKeyId, tool, date: today } },
    update: { count: { increment: 1 } },
    create: { apiKeyId, tool, date: today, count: 1 },
  });

  // Count total usage today across ALL keys for this account
  const userKeyIds = await prisma.apiKey
    .findMany({ where: { userId }, select: { id: true } })
    .then((keys) => keys.map((k) => k.id));

  const rows = await prisma.apiUsage.findMany({
    where: { apiKeyId: { in: userKeyIds }, date: today },
  });

  const accountTotal = rows.reduce((sum, r) => sum + r.count, 0);
  return accountTotal <= DAILY_LIMIT;
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

export async function getAccountUsageToday(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const userKeyIds = await prisma.apiKey
    .findMany({ where: { userId }, select: { id: true } })
    .then((keys) => keys.map((k) => k.id));

  const rows = await prisma.apiUsage.findMany({
    where: { apiKeyId: { in: userKeyIds }, date: today },
  });

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return { total, limit: DAILY_LIMIT };
}
