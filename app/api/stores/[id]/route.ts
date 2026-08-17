import { prisma } from "@/lib/prisma";
import { errorResponse, text, unavailable } from "@/lib/api";
import { jsonResponse } from "@/lib/json";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!prisma) return unavailable();
  const { id } = await params;
  const s = await prisma.store.findUnique({
    where: { id },
    include: {
      devices: {
        include: { metrics: { take: 20, orderBy: { createdAt: "desc" } } },
      },
      alerts: true,
      events: { take: 100, orderBy: { createdAt: "desc" } },
    },
  });
  return s
    ? jsonResponse(s)
    : Response.json({ error: "Mağaza bulunamadı." }, { status: 404 });
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!prisma) return unavailable();
  try {
    const { id } = await params,
      b = await req.json();
    const data = {
      ...(b.name !== undefined && { name: text(b.name) }),
      ...(b.code !== undefined && { code: text(b.code).toUpperCase() }),
      ...(b.city !== undefined && { city: text(b.city) }),
      ...(b.address !== undefined && { address: text(b.address) || null }),
    };
    const s = await prisma.store.update({ where: { id }, data });
    await prisma.event.create({
      data: {
        type: "STORE_UPDATED",
        message: `${s.name} mağazası güncellendi.`,
        storeId: id,
      },
    });
    return jsonResponse(s);
  } catch (e) {
    return errorResponse(e);
  }
}
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!prisma) return unavailable();
  try {
    const { id } = await params;
    const count = await prisma.device.count({ where: { storeId: id } });
    if (count)
      return Response.json(
        {
          error: `Bu mağazaya bağlı ${count} cihaz var. Önce cihazları taşıyın veya silin.`,
        },
        { status: 409 },
      );
    await prisma.store.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
