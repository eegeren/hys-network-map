import { prisma } from "@/lib/prisma";
import { errorResponse, text, unavailable } from "@/lib/api";
import { DeviceStatus, DeviceType } from "@prisma/client";
import { jsonResponse } from "@/lib/json";
export async function GET(req: Request) {
  if (!prisma) return unavailable();
  const q = new URL(req.url).searchParams;
  const where = {
    ...(q.get("storeId") && { storeId: q.get("storeId")! }),
    ...(q.get("status") && { status: q.get("status") as DeviceStatus }),
    ...(q.get("type") && { type: q.get("type") as DeviceType }),
    ...(q.get("search") && {
      OR: ["name", "hostname", "ipAddress", "macAddress", "assetTag"].map(
        (k) => ({
          [k]: { contains: q.get("search")!, mode: "insensitive" as const },
        }),
      ),
    }),
  };
  const page = Math.max(1, Number(q.get("page")) || 1),
    take = Math.min(100, Number(q.get("limit")) || 25);
  const [items, total] = await Promise.all([
    prisma.device.findMany({
      where,
      include: { store: true },
      skip: (page - 1) * take,
      take,
      orderBy: { name: "asc" },
    }),
    prisma.device.count({ where }),
  ]);
  return jsonResponse({ items, total, page, pages: Math.ceil(total / take) });
}
export async function POST(req: Request) {
  if (!prisma) return unavailable();
  try {
    const b = await req.json(),
      name = text(b.name),
      hostname = text(b.hostname),
      ipAddress = text(b.ipAddress),
      storeId = text(b.storeId);
    if (!name || !hostname || !ipAddress || !storeId || !b.type)
      return Response.json(
        { error: "Ad, hostname, mağaza, tip ve IP zorunludur." },
        { status: 422 },
      );
    const d = await prisma.device.create({
      data: {
        name,
        hostname,
        storeId,
        type: b.type as DeviceType,
        ipAddress,
        macAddress: text(b.macAddress) || null,
        operatingSystem: text(b.operatingSystem) || null,
        description: text(b.description) || null,
        location: text(b.location) || null,
        serialNumber: text(b.serialNumber) || null,
        assetTag: text(b.assetTag) || null,
      },
    });
    await prisma.event.create({
      data: {
        type: "DEVICE_CREATED",
        message: `${name} cihazı oluşturuldu.`,
        deviceId: d.id,
        storeId,
      },
    });
    return jsonResponse(d, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
