import { prisma } from "@/lib/prisma";
import { errorResponse, text, unavailable } from "@/lib/api";
import { jsonResponse } from "@/lib/json";
export async function GET() {
  if (!prisma) return unavailable();
  const stores = await prisma.store.findMany({
    include: {
      devices: true,
      alerts: { where: { status: { not: "RESOLVED" } } },
    },
    orderBy: { name: "asc" },
  });
  return jsonResponse(stores);
}
export async function POST(req: Request) {
  if (!prisma) return unavailable();
  try {
    const b = await req.json();
    const name = text(b.name),
      code = text(b.code).toUpperCase(),
      city = text(b.city);
    if (!name || !code || !city)
      return Response.json(
        { error: "Mağaza adı, kodu ve şehir zorunludur." },
        { status: 422 },
      );
    const store = await prisma.store.create({
      data: { name, code, city, address: text(b.address) || null },
    });
    await prisma.event.create({
      data: {
        type: "STORE_CREATED",
        message: `${name} mağazası oluşturuldu.`,
        storeId: store.id,
      },
    });
    return jsonResponse(store, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
