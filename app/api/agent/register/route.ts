import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { unavailable } from "@/lib/api";
import { hashAgentSecret } from "@/lib/agent-auth";

export async function GET() {
  if (!prisma) return unavailable();
  const [settings, agents] = await Promise.all([
    prisma.settings.upsert({
      where: { id: "system" },
      update: {},
      create: { id: "system" },
    }),
    prisma.device.findMany({
      where: { agentManaged: true },
      include: { store: true },
      orderBy: { lastSeen: "desc" },
    }),
  ]);
  return Response.json({
    configured: Boolean(settings.agentSecretHash),
    latestVersion: settings.agentVersion,
    heartbeatInterval: settings.heartbeatInterval,
    offlineThreshold: settings.offlineThreshold,
    agents: agents.map((d) => ({
      id: d.id,
      hostname: d.hostname,
      store: d.store?.name ?? "Atanmamış",
      ipAddress: d.ipAddress,
      agentId: d.agentId,
      agentVersion: d.agentVersion,
      status: d.status,
      lastHeartbeat: d.lastSeen,
    })),
  });
}

export async function POST() {
  if (!prisma) return unavailable();
  const secret = `hys_${randomBytes(32).toString("base64url")}`;
  const agentSecretHash = hashAgentSecret(secret).toString("hex");
  await prisma.settings.upsert({
    where: { id: "system" },
    update: { agentSecretHash },
    create: { id: "system", agentSecretHash },
  });
  return Response.json(
    {
      secret,
      message:
        "Bu secret yalnızca bir kez gösterilir. Güvenli bir yerde saklayın.",
    },
    { status: 201 },
  );
}
