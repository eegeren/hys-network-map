import { prisma } from "@/lib/prisma";
import { unavailable } from "@/lib/api";
import { jsonResponse } from "@/lib/json";
export async function GET(req: Request) {
  if (!prisma) return unavailable();
  const q = new URL(req.url).searchParams;
  const where = {
    ...(q.get("storeId") && { storeId: q.get("storeId")! }),
    ...(q.get("deviceId") && { deviceId: q.get("deviceId")! }),
    ...(q.get("type") && { type: q.get("type")! }),
  };
  return jsonResponse(
    await prisma.event.findMany({
      where,
      include: { device: true, store: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  );
}
