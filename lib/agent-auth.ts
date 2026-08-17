import { createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function hashAgentSecret(secret: string) {
  return createHash("sha256").update(secret, "utf8").digest();
}

export async function authenticateAgent(request: Request) {
  if (!prisma) return false;
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;
  const secret = authorization.slice(7).trim();
  if (!secret) return false;
  const settings = await prisma.settings.findUnique({ where: { id: "system" }, select: { agentSecretHash: true } });
  if (!settings?.agentSecretHash) return false;
  const actual = hashAgentSecret(secret);
  const expected = Buffer.from(settings.agentSecretHash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
