import { prisma } from "@/lib/prisma";
import { unavailable } from "@/lib/api";
export async function POST() {
  if (!prisma) return unavailable();
  const s = await prisma.settings.upsert({
      where: { id: "system" },
      update: {},
      create: { id: "system" },
    }),
    cutoff = new Date(Date.now() - s.offlineThreshold * 1000);
  const stale = await prisma.device.findMany({
    where: {
      agentManaged: true,
      status: { not: "OFFLINE" },
      lastSeen: { not: null, lt: cutoff },
    },
  });
  for (const d of stale) {
    await prisma.$transaction([
      prisma.device.update({
        where: { id: d.id },
        data: { status: "OFFLINE" },
      }),
      prisma.event.create({
        data: {
          type: "DEVICE_OFFLINE",
          message: `${d.name} heartbeat zaman aşımına uğradı.`,
          deviceId: d.id,
          storeId: d.storeId,
        },
      }),
    ]);
    if (
      s.offlineAlerts &&
      !(await prisma.alert.findFirst({
        where: {
          deviceId: d.id,
          status: { in: ["ACTIVE", "ACKNOWLEDGED"] },
          message: { contains: "çevrimdışı" },
        },
      }))
    )
      await prisma.alert.create({
        data: {
          severity: "CRITICAL",
          status: "ACTIVE",
          message: `${d.name} çevrimdışı.`,
          deviceId: d.id,
          storeId: d.storeId,
        },
      });
  }
  return Response.json({
    checkedAt: new Date(),
    thresholdSeconds: s.offlineThreshold,
    offlineCount: stale.length,
  });
}
