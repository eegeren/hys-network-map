import { prisma } from "@/lib/prisma";
import { errorResponse, unavailable } from "@/lib/api";
import { AlertStatus } from "@prisma/client";
import { jsonResponse } from "@/lib/json";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!prisma) return unavailable();
  const { id } = await params;
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: { device: true, store: true },
  });
  return alert
    ? jsonResponse(alert)
    : Response.json({ error: "Uyarı bulunamadı." }, { status: 404 });
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!prisma) return unavailable();
  try {
    const { id } = await params,
      { status } = await req.json();
    if (!["ACKNOWLEDGED", "RESOLVED"].includes(status))
      return Response.json({ error: "Geçersiz durum." }, { status: 422 });
    const a = await prisma.alert.update({
      where: { id },
      data: {
        status: status as AlertStatus,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
    });
    if (status === "RESOLVED")
      await prisma.event.create({
        data: {
          type: "ALERT_RESOLVED",
          message: `Uyarı çözüldü: ${a.message}`,
          deviceId: a.deviceId,
          storeId: a.storeId,
        },
      });
    return jsonResponse(a);
  } catch (e) {
    return errorResponse(e);
  }
}
