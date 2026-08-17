import { authenticateAgent } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

type Heartbeat = {
  agentId: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  operatingSystem: string;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  uptimeSeconds: number;
  agentVersion: string;
};

function validPercent(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

export async function POST(request: Request) {
  if (!prisma)
    return Response.json(
      { error: "Database bağlantısı yapılandırılmamış." },
      { status: 503 },
    );
  if (!(await authenticateAgent(request)))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Heartbeat;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Geçersiz JSON." }, { status: 400 });
  }
  if (
    !body.agentId?.trim() ||
    !body.hostname?.trim() ||
    !body.ipAddress?.trim() ||
    !body.agentVersion?.trim()
  )
    return Response.json(
      { error: "agentId, hostname, ipAddress ve agentVersion zorunludur." },
      { status: 422 },
    );
  if (
    ![body.cpuUsage, body.ramUsage, body.diskUsage].every(validPercent) ||
    !Number.isFinite(body.uptimeSeconds) ||
    body.uptimeSeconds < 0
  )
    return Response.json(
      { error: "Telemetri değerleri geçersiz." },
      { status: 422 },
    );

  const now = new Date();
  let previous = await prisma.device.findFirst({
    where: { OR: [{ agentId: body.agentId }, { hostname: body.hostname }] },
  });
  let autoRegistered = false;
  if (!previous) {
    previous = await prisma.device.create({
      data: {
        name: body.hostname,
        hostname: body.hostname,
        agentId: body.agentId,
        agentManaged: true,
        type: "PC",
        status: "ONLINE",
        ipAddress: body.ipAddress,
        macAddress: body.macAddress,
        operatingSystem: body.operatingSystem,
        cpuUsage: body.cpuUsage,
        ramUsage: body.ramUsage,
        diskUsage: body.diskUsage,
        uptime: BigInt(Math.floor(body.uptimeSeconds)),
        agentVersion: body.agentVersion,
        lastSeen: now,
        storeId: null,
      },
    });
    await prisma.event.create({
      data: {
        type: "DEVICE_CREATED",
        message: `${body.hostname} agent tarafından otomatik kaydedildi.`,
        deviceId: previous.id,
        storeId: null,
      },
    });
    autoRegistered = true;
  }

  const wasOffline = previous.status === "OFFLINE";
  const device = await prisma.device.update({
    where: { id: previous.id },
    data: {
      agentId: body.agentId,
      agentManaged: true,
      hostname: body.hostname,
      ipAddress: body.ipAddress,
      macAddress: body.macAddress,
      operatingSystem: body.operatingSystem,
      cpuUsage: body.cpuUsage,
      ramUsage: body.ramUsage,
      diskUsage: body.diskUsage,
      uptime: BigInt(Math.floor(body.uptimeSeconds)),
      agentVersion: body.agentVersion,
      status: "ONLINE",
      lastSeen: now,
      metrics: {
        create: {
          cpu: body.cpuUsage,
          ram: body.ramUsage,
          disk: body.diskUsage,
        },
      },
    },
  });

  if (wasOffline) {
    await prisma.$transaction([
      prisma.event.create({
        data: {
          type: "DEVICE_ONLINE",
          message: `${device.hostname} yeniden çevrimiçi.`,
          deviceId: device.id,
          storeId: device.storeId,
        },
      }),
      prisma.alert.updateMany({
        where: {
          deviceId: device.id,
          status: { in: ["ACTIVE", "ACKNOWLEDGED"] },
          message: { contains: "çevrimdışı" },
        },
        data: { status: "RESOLVED", resolvedAt: now },
      }),
    ]);
  }
  return Response.json(
    {
      accepted: true,
      autoRegistered,
      deviceId: device.id,
      status: device.status,
      receivedAt: now,
    },
    { status: autoRegistered ? 201 : 200 },
  );
}
