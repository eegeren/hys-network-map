ALTER TABLE "Device"
ADD COLUMN "agentManaged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "agentId" TEXT;

CREATE UNIQUE INDEX "Device_agentId_key" ON "Device"("agentId");
