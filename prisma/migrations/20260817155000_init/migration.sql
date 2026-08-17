-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('ONLINE', 'WARNING', 'OFFLINE');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('PC', 'POS', 'PRINTER', 'ROUTER', 'SWITCH', 'SERVER', 'NVR', 'TABLET', 'OTHER');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'WARNING', 'OFFLINE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "status" "StoreStatus" NOT NULL DEFAULT 'ONLINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "macAddress" TEXT,
    "operatingSystem" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'UNKNOWN',
    "ping" INTEGER,
    "cpuUsage" DOUBLE PRECISION,
    "ramUsage" DOUBLE PRECISION,
    "diskUsage" DOUBLE PRECISION,
    "uptime" BIGINT,
    "lastSeen" TIMESTAMP(3),
    "agentVersion" TEXT,
    "agentManaged" BOOLEAN NOT NULL DEFAULT false,
    "agentId" TEXT,
    "description" TEXT,
    "location" TEXT,
    "serialNumber" TEXT,
    "assetTag" TEXT,
    "gateway" TEXT,
    "dns" TEXT,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "deviceId" TEXT,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'system',
    "systemName" TEXT NOT NULL DEFAULT 'HYS Network Map',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD.MM.YYYY HH:mm',
    "autoRefresh" INTEGER NOT NULL DEFAULT 30,
    "heartbeatInterval" INTEGER NOT NULL DEFAULT 30,
    "offlineThreshold" INTEGER NOT NULL DEFAULT 90,
    "pingWarning" INTEGER NOT NULL DEFAULT 100,
    "pingCritical" INTEGER NOT NULL DEFAULT 250,
    "cpuWarning" INTEGER NOT NULL DEFAULT 85,
    "ramWarning" INTEGER NOT NULL DEFAULT 90,
    "diskWarning" INTEGER NOT NULL DEFAULT 90,
    "offlineAlerts" BOOLEAN NOT NULL DEFAULT true,
    "performanceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "pingAlerts" BOOLEAN NOT NULL DEFAULT true,
    "alertCooldown" INTEGER NOT NULL DEFAULT 300,
    "agentVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "agentSecretHash" TEXT,
    "appearance" TEXT NOT NULL DEFAULT 'SYSTEM',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "deviceId" TEXT,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceMetric" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ping" INTEGER,
    "cpu" DOUBLE PRECISION,
    "ram" DOUBLE PRECISION,
    "disk" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_code_key" ON "Store"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Device_name_key" ON "Device"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Device_agentId_key" ON "Device"("agentId");

-- CreateIndex
CREATE INDEX "DeviceMetric_deviceId_createdAt_idx" ON "DeviceMetric"("deviceId", "createdAt");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceMetric" ADD CONSTRAINT "DeviceMetric_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

