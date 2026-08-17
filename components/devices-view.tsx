"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import type { Device, DeviceType, Status } from "@/lib/device-types";
import { formatMetric, formatUptime, relativeTime } from "@/lib/device-format";

export type ApiDevice = {
  id: string;
  name: string;
  hostname: string;
  status: string;
  type: string;
  ipAddress: string;
  macAddress: string | null;
  operatingSystem: string | null;
  ping: number | null;
  cpuUsage: number | null;
  ramUsage: number | null;
  diskUsage: number | null;
  uptime: string | null;
  lastSeen: string | null;
  agentManaged: boolean;
  agentId: string | null;
  agentVersion: string | null;
  assetTag: string | null;
  storeId: string | null;
  store: { id: string; name: string; code: string } | null;
};
type DevicesResponse = {
  items: ApiDevice[];
  total: number;
  page: number;
  pages: number;
};
const typeLabels: Record<string, DeviceType> = {
  ROUTER: "Router",
  SWITCH: "Switch",
  POS: "POS",
  PC: "PC",
  PRINTER: "Printer",
  SERVER: "Server",
  NVR: "NVR",
  TABLET: "Tablet",
  OTHER: "Other",
};

export function apiDeviceToUiDevice(d: ApiDevice): Device {
  return {
    id: d.id,
    name: d.name,
    hostname: d.hostname,
    store: d.store?.name || "Atanmamış",
    type: typeLabels[d.type] || "Other",
    ip: d.ipAddress,
    mac: d.macAddress || "-",
    os: d.operatingSystem || "-",
    status: d.status.toLowerCase() as Status,
    ping: d.ping,
    cpu: d.cpuUsage,
    ram: d.ramUsage,
    disk: d.diskUsage,
    uptime: formatUptime(d.uptime),
    lastSeen: relativeTime(d.lastSeen),
    agent: d.agentVersion || "-",
    agentManaged: d.agentManaged,
    agentId: d.agentId || undefined,
  };
}

export function DevicesView({
  onDevice,
}: {
  onDevice: (device: Device) => void;
}) {
  const [data, setData] = useState<DevicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [store, setStore] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/devices?limit=100", { cache: "no-store" });
      if (!r.ok)
        throw new Error((await r.json()).error || "Cihazlar alınamadı.");
      const result: DevicesResponse = await r.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cihazlar alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  const stores = useMemo(
    () =>
      Array.from(
        new Set((data?.items || []).map((d) => d.store?.name || "Atanmamış")),
      ).sort(),
    [data],
  );
  const devices = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    return (data?.items || []).filter((d) => {
      const storeName = d.store?.name || "Atanmamış";
      const matchesSearch =
        !q ||
        [d.name, d.hostname, d.ipAddress, d.macAddress, d.assetTag].some((v) =>
          v?.toLocaleLowerCase("tr-TR").includes(q),
        );
      return (
        matchesSearch &&
        (!store || storeName === store) &&
        (!status || d.status === status) &&
        (!type || d.type === type)
      );
    });
  }, [data, search, store, status, type]);
  return (
    <>
      <div className="toolbar devices-toolbar">
        <label>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, hostname, IP, MAC veya asset tag ara"
          />
        </label>
        <select value={store} onChange={(e) => setStore(e.target.value)}>
          <option value="">Tüm Mağazalar</option>
          {stores.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tüm Durumlar</option>
          <option>ONLINE</option>
          <option>WARNING</option>
          <option>OFFLINE</option>
          <option>UNKNOWN</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tüm Tipler</option>
          {Object.keys(typeLabels).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button onClick={load} aria-label="Yenile">
          <RefreshCw size={15} />
        </button>
      </div>
      <div className="panel table-wrap">
        {loading ? (
          <div className="data-state">Cihazlar yükleniyor…</div>
        ) : error ? (
          <div className="data-state error">
            <b>Cihazlar yüklenemedi</b>
            <span>{error}</span>
            <button onClick={load}>Tekrar dene</button>
          </div>
        ) : devices.length === 0 ? (
          <div className="data-state">
            <b>Cihaz bulunamadı</b>
            <span>Filtreleri temizleyip tekrar deneyin.</span>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Durum</th>
                  <th>Cihaz</th>
                  <th>Hostname</th>
                  <th>Mağaza</th>
                  <th>Tip</th>
                  <th>IP</th>
                  <th>OS</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th>Disk</th>
                  <th>Uptime</th>
                  <th>Son Görülme</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => onDevice(apiDeviceToUiDevice(d))}
                  >
                    <td>
                      <span
                        className={`table-status ${d.status.toLowerCase()}`}
                      />
                      {d.status}
                    </td>
                    <td>
                      <b>{d.name}</b>
                      {d.agentManaged && (
                        <span className="agent-table-badge">AGENT</span>
                      )}
                    </td>
                    <td>{d.hostname}</td>
                    <td>{d.store?.name || "Atanmamış"}</td>
                    <td>{typeLabels[d.type] || d.type}</td>
                    <td className="mono">{d.ipAddress}</td>
                    <td>{d.operatingSystem || "-"}</td>
                    <td>{formatMetric(d.cpuUsage)}</td>
                    <td>{formatMetric(d.ramUsage)}</td>
                    <td>{formatMetric(d.diskUsage)}</td>
                    <td>{formatUptime(d.uptime)}</td>
                    <td
                      title={
                        d.lastSeen
                          ? new Date(d.lastSeen).toLocaleString("tr-TR")
                          : ""
                      }
                    >
                      {relativeTime(d.lastSeen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              {devices.length} / {data?.total || 0} cihaz
            </div>
          </>
        )}
      </div>
    </>
  );
}
