import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Cpu,
  Database,
  HardDrive,
  Monitor,
  Network,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMetric, formatUptime, relativeTime } from "@/lib/device-format";

export const dynamic = "force-dynamic";

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!prisma)
    return (
      <main className="standalone-state">
        Database bağlantısı yapılandırılmamış.
      </main>
    );
  const { id } = await params;
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      store: true,
      metrics: { take: 30, orderBy: { createdAt: "desc" } },
      alerts: { take: 20, orderBy: { createdAt: "desc" } },
      events: { take: 20, orderBy: { createdAt: "desc" } },
    },
  });
  if (!device) notFound();
  const status = device.status.toLowerCase();
  return (
    <main className="device-detail-shell">
      <Link href="/devices" className="back-link">
        <ArrowLeft size={16} /> Cihazlara dön
      </Link>
      <header className="device-detail-hero">
        <span className="detail-device-icon">
          <Monitor />
        </span>
        <div>
          <p>CİHAZ DETAYI</p>
          <h1>
            {device.name}{" "}
            {device.agentManaged && (
              <em className="agent-table-badge">AGENT</em>
            )}
          </h1>
          <span>
            <i className={`table-status ${status}`} />
            {device.status} · {device.store?.name || "Atanmamış"}
          </span>
        </div>
        <div className="hero-meta">
          <b>{device.ipAddress}</b>
          <small>Son heartbeat: {relativeTime(device.lastSeen)}</small>
        </div>
      </header>
      <section className="detail-metric-grid">
        <Metric icon={Cpu} label="CPU" value={formatMetric(device.cpuUsage)} />
        <Metric
          icon={Database}
          label="RAM"
          value={formatMetric(device.ramUsage)}
        />
        <Metric
          icon={HardDrive}
          label="Disk"
          value={formatMetric(device.diskUsage)}
        />
        <Metric
          icon={Activity}
          label="Uptime"
          value={formatUptime(device.uptime)}
        />
      </section>
      <section className="detail-columns">
        <article className="panel detail-card">
          <h2>Sistem Bilgileri</h2>
          <Row label="Hostname" value={device.hostname} />
          <Row label="İşletim Sistemi" value={device.operatingSystem || "-"} />
          <Row label="Cihaz Tipi" value={device.type} />
          <Row label="IP Adresi" value={device.ipAddress} />
          <Row label="MAC Adresi" value={device.macAddress || "-"} />
          <Row label="Mağaza" value={device.store?.name || "Atanmamış"} />
        </article>
        <article className="panel detail-card">
          <h2>Agent Bilgileri</h2>
          <Row
            label="Agent Managed"
            value={device.agentManaged ? "Yes" : "No"}
          />
          <Row label="Agent ID" value={device.agentId || "-"} />
          <Row label="Agent Version" value={device.agentVersion || "-"} />
          <Row
            label="Last Heartbeat"
            value={
              device.lastSeen
                ? `${relativeTime(device.lastSeen)} · ${device.lastSeen.toLocaleString("tr-TR")}`
                : "-"
            }
          />
          <Row label="Durum" value={device.status} />
          <Row label="Uptime" value={formatUptime(device.uptime)} />
        </article>
      </section>
      <section className="panel detail-card metric-history">
        <h2>
          <Network size={17} /> Son Telemetri
        </h2>
        {device.metrics.length ? (
          <div className="metric-history-list">
            {device.metrics.slice(0, 8).map((m) => (
              <div key={m.id}>
                <time>{m.createdAt.toLocaleTimeString("tr-TR")}</time>
                <span>CPU {formatMetric(m.cpu)}</span>
                <span>RAM {formatMetric(m.ram)}</span>
                <span>Disk {formatMetric(m.disk)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>Henüz telemetri geçmişi yok.</p>
        )}
      </section>
    </main>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
}) {
  return (
    <article className="panel detail-metric">
      <Icon size={19} />
      <span>
        {label}
        <b>{value}</b>
      </span>
    </article>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
