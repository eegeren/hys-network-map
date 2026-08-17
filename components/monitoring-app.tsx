"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  ChevronRight,
  CircleGauge,
  Cpu,
  Database,
  HardDrive,
  LayoutDashboard,
  Menu,
  Monitor,
  Moon,
  Network,
  Printer,
  Radio,
  Router,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Store,
  Sun,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import {
  alerts,
  devices as seedDevices,
  stores,
  type Device,
  type DeviceType,
  type Status,
} from "@/lib/mock-data";
import { DevicesView } from "@/components/devices-view";
import { formatMetric } from "@/lib/device-format";

const statusLabel: Record<Status, string> = {
  online: "Çevrimiçi",
  warning: "Uyarı",
  offline: "Çevrimdışı",
  unknown: "Bilinmiyor",
};
const deviceIcon: Record<
  DeviceType,
  ComponentType<{ size?: number; strokeWidth?: number }>
> = {
  Router,
  Switch: Network,
  POS: Monitor,
  PC: Monitor,
  Printer,
  Server,
  NVR: Monitor,
  Tablet: Monitor,
  Other: Monitor,
};
const nav = [
  ["Dashboard", LayoutDashboard],
  ["Network Map", Network],
  ["Stores", Building2],
  ["Devices", Monitor],
  ["Alerts", AlertTriangle],
  ["Events", Activity],
  ["Settings", Settings],
] as const;

function DeviceNode({ data }: NodeProps<Node<Device>>) {
  const Icon = deviceIcon[data.type];
  return (
    <div className={`device-node ${data.status}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-head">
        <span className="node-icon">
          <Icon size={17} />
        </span>
        <span className={`status-dot ${data.status}`} />
      </div>
      <strong>{data.name}</strong>
      {data.agentManaged && <em className="agent-badge">AGENT</em>}
      <small>
        {data.type} · {data.ip}
      </small>
      <div className="node-foot">
        <span>{statusLabel[data.status]}</span>
        <b>{data.ping == null ? "-" : `${data.ping} ms`}</b>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
const nodeTypes = { device: DeviceNode };

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ size?: number }>;
  tone: string;
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

type AgentStatusData = {
  configured: boolean;
  latestVersion: string;
  heartbeatInterval: number;
  offlineThreshold: number;
  agents: Array<{
    id: string;
    hostname: string;
    store: string;
    ipAddress: string;
    agentVersion: string | null;
    status: string;
    lastHeartbeat: string | null;
  }>;
};
function AgentSettings() {
  const [data, setData] = useState<AgentStatusData | null>(null);
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(
    () =>
      fetch("/api/agent/register")
        .then((r) => (r.ok ? r.json() : null))
        .then(setData),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  async function generate() {
    const r = await fetch("/api/agent/register", { method: "POST" }),
      j = await r.json();
    if (r.ok) {
      setSecret(j.secret);
      setMessage(j.message);
      load();
    } else setMessage(j.error || "Secret oluşturulamadı.");
  }
  async function copy() {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setMessage("Secret panoya kopyalandı.");
    }
  }
  return (
    <div className="agent-settings">
      <div className="agent-summary">
        <span>
          <b>HYS Agent Status</b>
          <strong>{data?.configured ? "Hazır" : "Secret gerekli"}</strong>
        </span>
        <span>
          <b>Registered Agents</b>
          <strong>{data?.agents.length ?? "—"}</strong>
        </span>
        <span>
          <b>Latest Version</b>
          <strong>{data?.latestVersion ?? "—"}</strong>
        </span>
        <span>
          <b>Heartbeat / Offline</b>
          <strong>
            {data
              ? `${data.heartbeatInterval}s / ${data.offlineThreshold}s`
              : "—"}
          </strong>
        </span>
      </div>
      <Field label="API Endpoint" value="/api/agent/heartbeat" />
      <div className="secret-box">
        <span>Agent Secret</span>
        <code>
          {secret ||
            (data?.configured ? "••••••••••••••••••••" : "Henüz oluşturulmadı")}
        </code>
        <button type="button" onClick={generate}>
          {data?.configured ? "Regenerate" : "Generate"}
        </button>
        <button type="button" onClick={copy} disabled={!secret}>
          Copy
        </button>
      </div>
      {message && <p className="agent-message">{message}</p>}
      <small>
        Secret yalnızca üretildiği anda gösterilir; veritabanında yalnızca
        SHA-256 hash saklanır.
      </small>
      <h4>Registered Agents</h4>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hostname</th>
              <th>Store</th>
              <th>IP</th>
              <th>Agent Version</th>
              <th>Status</th>
              <th>Last Heartbeat</th>
            </tr>
          </thead>
          <tbody>
            {data?.agents.map((a) => (
              <tr key={a.id}>
                <td>
                  <b>{a.hostname}</b>
                </td>
                <td>{a.store}</td>
                <td>{a.ipAddress}</td>
                <td>{a.agentVersion || "—"}</td>
                <td>{a.status}</td>
                <td>
                  {a.lastHeartbeat
                    ? new Date(a.lastHeartbeat).toLocaleString("tr-TR")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManagementPage({
  page,
  onDevice,
}: {
  page: string;
  onDevice: (d: Device) => void;
}) {
  const [query, setQuery] = useState("");
  const [, setModal] = useState<string | null>(null);
  const [tab, setTab] = useState("General");
  const [, setNotice] = useState("");
  if (page === "Network Map")
    return (
      <>
        <PageTop
          title="Network Map"
          desc="Mağaza ağ topolojilerini canlı izleyin."
        />
        <div className="toolbar">
          <select>
            <option>Tüm Mağazalar</option>
            {stores.map((s) => (
              <option key={s.code}>{s.name}</option>
            ))}
          </select>
          <select>
            <option>Tüm Durumlar</option>
            <option>ONLINE</option>
            <option>WARNING</option>
            <option>OFFLINE</option>
          </select>
          <select>
            <option>Tüm Cihaz Tipleri</option>
            <option>Router</option>
            <option>Switch</option>
            <option>POS</option>
          </select>
          <label>
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hostname veya IP ara"
            />
          </label>
          <button>Fit View</button>
          <button>Tam Ekran</button>
        </div>
        <div className="panel full-map">
          <div className="map-placeholder">
            <Network size={38} />
            <h3>İnteraktif ağ topolojisi</h3>
            <p>
              Dashboard topolojisindeki zoom, pan, fit view ve cihaz detayları
              bu görünümde de aktiftir.
            </p>
            <a href="/">Canlı topolojiyi aç</a>
          </div>
        </div>
      </>
    );
  if (page === "Stores")
    return (
      <>
        <PageTop
          title="Mağazalar"
          desc="Tüm mağazaları, cihaz durumlarını ve bağlantı sağlığını yönetin."
          action="Mağaza Ekle"
          onAction={() => setModal("store")}
        />
        <Toolbar query={query} setQuery={setQuery} />
        <div className="store-grid directory">
          {stores
            .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
            .map((s) => (
              <a
                href={`/stores/${s.code.toLowerCase()}`}
                className="store-card"
                key={s.code}
              >
                <div className="store-head">
                  <span className="store-icon">
                    <Store size={19} />
                  </span>
                  <div>
                    <strong>{s.name}</strong>
                    <small>{s.code} · Balıkesir</small>
                  </div>
                  <span className={`badge ${s.status}`}>
                    {statusLabel[s.status]}
                  </span>
                </div>
                <div className="directory-metrics">
                  <span>
                    Cihaz <b>{s.devices}</b>
                  </span>
                  <span>
                    Online <b>{s.online}</b>
                  </span>
                  <span>
                    Ping <b>{s.ping} ms</b>
                  </span>
                </div>
              </a>
            ))}
        </div>
      </>
    );
  if (page === "Devices")
    return (
      <>
        <PageTop
          title="Cihazlar"
          desc="Merkezi cihaz envanteri ve anlık performans değerleri."
          action="Cihaz Ekle"
          onAction={() => setModal("device")}
        />
        <DevicesView onDevice={onDevice} />
      </>
    );
  if (page === "Alerts")
    return (
      <>
        <PageTop
          title="Uyarılar"
          desc="Aktif, onaylanmış ve çözümlenmiş sistem uyarıları."
        />
        <Toolbar query={query} setQuery={setQuery} filters />
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Önem</th>
                <th>Mesaj</th>
                <th>Cihaz</th>
                <th>Mağaza</th>
                <th>Başlangıç</th>
                <th>Süre</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.device}>
                  <td>
                    <span className={`severity-pill ${a.severity}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td>{a.message}</td>
                  <td>
                    <b>{a.device}</b>
                  </td>
                  <td>{a.store}</td>
                  <td>{a.time}</td>
                  <td>18 dk</td>
                  <td>ACTIVE</td>
                  <td>
                    <button className="row-action">Onayla</button>
                    <button className="row-action success">Çöz</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  if (page === "Events")
    return (
      <>
        <PageTop
          title="Olay Günlüğü"
          desc="Sistem, cihaz ve mağaza olaylarının değiştirilemez zaman çizelgesi."
        />
        <Toolbar query={query} setQuery={setQuery} filters />
        <div className="panel event-table">
          {[
            ["14:42", "DEVICE_ONLINE", "BND-POS-01 çevrimiçi oldu."],
            ["14:38", "DEVICE_OFFLINE", "ERDEK-POS-02 çevrimdışı oldu."],
            ["14:31", "HIGH_DISK", "BND-OFFICE-01 disk kullanımı %91 oldu."],
            ["14:25", "HIGH_PING", "BIGA Router gecikmesi normale döndü."],
          ].map((e) => (
            <div key={e[0]}>
              <time>{e[0]}</time>
              <span className="event-icon">
                <Activity size={15} />
              </span>
              <b>{e[1]}</b>
              <p>{e[2]}</p>
              <small>Bandırma Köroğlu</small>
            </div>
          ))}
        </div>
      </>
    );
  if (page === "Settings")
    return (
      <>
        <PageTop
          title="Ayarlar"
          desc="Monitoring eşikleri, agent güvenliği ve görünüm tercihleri."
        />
        <div className="settings-layout">
          <aside>
            {["General", "Monitoring", "Alerts", "Agent", "Appearance"].map(
              (x) => (
                <button
                  className={tab === x ? "active" : ""}
                  onClick={() => setTab(x)}
                  key={x}
                >
                  {x}
                </button>
              ),
            )}
          </aside>
          <form
            className="panel settings-form"
            onSubmit={(e) => {
              e.preventDefault();
              setNotice("Ayarlar kaydedildi.");
            }}
          >
            <h3>{tab}</h3>
            <p>
              {tab === "Monitoring"
                ? "Cihaz sağlığı ve performans eşiklerini yapılandırın."
                : "Sistem tercihlerini yönetin."}
            </p>
            {tab === "General" && (
              <>
                <Field label="Sistem Adı" value="HYS Network Map" />
                <Field label="Varsayılan Saat Dilimi" value="Europe/Istanbul" />
                <Field label="Otomatik Yenileme (sn)" value="30" />
              </>
            )}
            {tab === "Monitoring" && (
              <>
                <Field label="Heartbeat Aralığı (sn)" value="30" />
                <Field label="Offline Eşiği (sn)" value="90" />
                <Field label="Ping Uyarı / Kritik (ms)" value="100 / 250" />
                <Field
                  label="CPU / RAM / Disk Uyarı (%)"
                  value="85 / 90 / 90"
                />
              </>
            )}
            {tab === "Alerts" && (
              <>
                <Check label="Offline uyarıları" />
                <Check label="Performans uyarıları" />
                <Check label="Ping uyarıları" />
                <Field label="Uyarı bekleme süresi (sn)" value="300" />
              </>
            )}
            {tab === "Agent" && <AgentSettings />}
            {tab === "Appearance" && (
              <div className="appearance">
                <button type="button">Light</button>
                <button type="button">Dark</button>
                <button type="button">System</button>
              </div>
            )}
            <button className="primary-btn">Değişiklikleri Kaydet</button>
          </form>
        </div>
      </>
    );
  return (
    <>
      <PageTop title={page} desc="Detay görünümü" />
      <div className="panel detail-page">
        <h2>{page === "Store Details" ? "Bandırma Köroğlu" : "BND-POS-01"}</h2>
        <div className="detail-tabs">
          <button>Overview</button>
          <button>Network</button>
          <button>Devices</button>
          <button>Alerts</button>
          <button>Events</button>
        </div>
        <section className="stats">
          <StatCard
            label="Toplam Cihaz"
            value="12"
            detail="Envanter"
            icon={Monitor}
            tone="blue"
          />
          <StatCard
            label="Çevrimiçi"
            value="11"
            detail="%91.6"
            icon={Wifi}
            tone="green"
          />
          <StatCard
            label="Aktif Uyarı"
            value="1"
            detail="Kritik değil"
            icon={AlertTriangle}
            tone="amber"
          />
          <StatCard
            label="Ortalama Ping"
            value="14 ms"
            detail="Normal"
            icon={Activity}
            tone="blue"
          />
        </section>
      </div>
    </>
  );

  function overlay() {
    return null;
  }
  {
    overlay();
  }
}

function PageTop({
  title,
  desc,
  action,
  onAction,
}: {
  title: string;
  desc: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <section className="page-top">
      <div>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      {action && (
        <button className="primary-btn" onClick={onAction}>
          + {action}
        </button>
      )}
    </section>
  );
}
function Toolbar({
  query,
  setQuery,
  filters = false,
}: {
  query: string;
  setQuery: (s: string) => void;
  filters?: boolean;
}) {
  return (
    <div className="toolbar">
      <label>
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara..."
        />
      </label>
      {filters && (
        <>
          <select>
            <option>Tüm Mağazalar</option>
          </select>
          <select>
            <option>Tüm Durumlar</option>
            <option>ONLINE</option>
            <option>WARNING</option>
            <option>OFFLINE</option>
          </select>
          <select>
            <option>Tüm Tipler</option>
          </select>
        </>
      )}
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={label} defaultValue={value} />
    </label>
  );
}
function Check({ label }: { label: string }) {
  return (
    <label className="check">
      <input type="checkbox" defaultChecked />
      <span>{label}</span>
    </label>
  );
}

export function MonitoringApp({
  initialPage = "Dashboard",
}: {
  initialPage?: string;
}) {
  const [active, setActive] = useState(initialPage);
  const [dark, setDark] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState<Device | null>(null);
  const [devices, setDevices] = useState(seedDevices);
  const [sim, setSim] = useState(true);
  const [liveSummary, setLiveSummary] = useState<{
    stores: number;
    total: number;
    online: number;
    offline: number;
  } | null>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    Promise.all([
      fetch("/api/devices?limit=100", { cache: "no-store" }),
      fetch("/api/stores", { cache: "no-store" }),
    ])
      .then(async ([deviceResponse, storeResponse]) => {
        if (!deviceResponse.ok || !storeResponse.ok) return;
        const devicePayload: {
          items: Array<{ status: string }>;
          total: number;
        } = await deviceResponse.json();
        const storePayload: Array<{ code: string; name: string }> =
          await storeResponse.json();
        setLiveSummary({
          stores: storePayload.filter(
            (s) => s.code !== "UNASSIGNED" && s.name !== "Unassigned Devices",
          ).length,
          total: devicePayload.total,
          online: devicePayload.items.filter((d) => d.status === "ONLINE")
            .length,
          offline: devicePayload.items.filter((d) => d.status === "OFFLINE")
            .length,
        });
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!sim) return;
    const id = setInterval(
      () =>
        setDevices((ds) =>
          ds.map((d) =>
            d.id === "pos2"
              ? {
                  ...d,
                  ping:
                    Math.random() > 0.7
                      ? 124
                      : Math.floor(8 + Math.random() * 12),
                  status: Math.random() > 0.78 ? "warning" : "online",
                }
              : d,
          ),
        ),
      5000,
    );
    return () => clearInterval(id);
  }, [sim]);
  const nodes = useMemo<Node<Device>[]>(
    () =>
      devices.map((d, i) => ({
        id: d.id,
        type: "device",
        data: d,
        position: [
          { x: 390, y: 15 },
          { x: 390, y: 155 },
          { x: 390, y: 295 },
          { x: 20, y: 455 },
          { x: 210, y: 455 },
          { x: 400, y: 455 },
          { x: 590, y: 455 },
        ][i] || { x: 0, y: 0 },
      })),
    [devices],
  );
  const edges = useMemo<Edge[]>(
    () =>
      [
        { id: "e1", source: "internet", target: "router" },
        { id: "e2", source: "router", target: "switch" },
        ...devices
          .filter((d) => !["internet", "router", "switch"].includes(d.id))
          .map((d) => ({ id: `e-${d.id}`, source: "switch", target: d.id })),
      ].map((e) => ({
        ...e,
        animated: true,
        style: { stroke: "#9aa9bc", strokeWidth: 1.5 },
      })),
    [devices],
  );
  const onNodeClick = useCallback(
    (_: unknown, node: Node<Device>) => setSelected(node.data),
    [],
  );
  return (
    <div className="app-shell">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="brandmark">
            <Network size={21} />
          </div>
          <div>
            <strong>HYS</strong>
            <span>NETWORK MAP</span>
          </div>
          <button className="mobile-close" onClick={() => setMobile(false)}>
            <X size={20} />
          </button>
        </div>
        <nav>
          <p>ANA MENÜ</p>
          {nav.map(([label, Icon]) => (
            <a
              href={
                label === "Dashboard"
                  ? "/"
                  : `/${label.toLowerCase().replace(" ", "-")}`
              }
              key={label}
              className={active === label ? "active" : ""}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Alerts" && <b>6</b>}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system">
            <span className="pulse" />
            <div>
              <strong>Sistem Aktif</strong>
              <small>87 cihaz izleniyor</small>
            </div>
          </div>
          <div className="profile">
            <div className="avatar">EK</div>
            <div>
              <strong>Ege Köroğlu</strong>
              <small>Sistem Yöneticisi</small>
            </div>
            <ChevronRight size={16} />
          </div>
        </div>
      </aside>
      <main className="workspace">
        <header>
          <button className="menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div>
            <p>HYS KÖROĞLU / BT YÖNETİMİ</p>
            <h1>{active}</h1>
          </div>
          <div className="header-actions">
            <label className="search">
              <Search size={17} />
              <input placeholder="Cihaz veya mağaza ara..." />
              <kbd>⌘ K</kbd>
            </label>
            <button aria-label="Bildirimler" className="icon-btn">
              <Bell size={19} />
              <i />
            </button>
            <button
              aria-label="Tema"
              className="icon-btn"
              onClick={() => setDark((v) => !v)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="avatar top">EK</div>
          </div>
        </header>
        <div className="content">
          {active !== "Dashboard" ? (
            <ManagementPage page={active} onDevice={setSelected} />
          ) : (
            <>
              <section className="welcome">
                <div>
                  <h2>Merhaba, Ege</h2>
                  <p>
                    Ağ altyapınızın anlık durumunu buradan takip edebilirsiniz.
                  </p>
                </div>
                <div className="live">
                  <span className="pulse" />
                  CANLI · Son güncelleme şimdi
                </div>
              </section>
              <section className="stats">
                <StatCard
                  label="Toplam Mağaza"
                  value={String(liveSummary?.stores ?? 14)}
                  detail="Tüm lokasyonlar aktif"
                  icon={Store}
                  tone="blue"
                />
                <StatCard
                  label="Çevrimiçi Cihaz"
                  value={`${liveSummary?.online ?? 83} / ${liveSummary?.total ?? 87}`}
                  detail={
                    liveSummary?.total
                      ? `%${Math.round((liveSummary.online / liveSummary.total) * 1000) / 10} kullanılabilirlik`
                      : "%95.4 kullanılabilirlik"
                  }
                  icon={Wifi}
                  tone="green"
                />
                <StatCard
                  label="Çevrimdışı"
                  value={String(liveSummary?.offline ?? 4)}
                  detail="2 cihaz yeni çevrimdışı"
                  icon={Radio}
                  tone="red"
                />
                <StatCard
                  label="Aktif Uyarı"
                  value="6"
                  detail="1 kritik uyarı"
                  icon={AlertTriangle}
                  tone="amber"
                />
              </section>
              <section className="main-grid">
                <article className="panel map-panel">
                  <div className="panel-title">
                    <div>
                      <h3>Ağ Topolojisi</h3>
                      <p>Bandırma Köroğlu · Canlı görünüm</p>
                    </div>
                    <div className="legend">
                      <span>
                        <i className="online" />
                        Online
                      </span>
                      <span>
                        <i className="warning" />
                        Uyarı
                      </span>
                      <span>
                        <i className="offline" />
                        Offline
                      </span>
                      <button onClick={() => setActive("Network Map")}>
                        Tam ekran <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flow-wrap">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      nodeTypes={nodeTypes}
                      onNodeClick={onNodeClick}
                      fitView
                      minZoom={0.6}
                      maxZoom={1.4}
                      proOptions={{ hideAttribution: true }}
                    >
                      <Background gap={22} size={1} />
                      <Controls showInteractive={false} />
                    </ReactFlow>
                  </div>
                </article>
                <article className="panel alert-panel">
                  <div className="panel-title">
                    <div>
                      <h3>Aktif Uyarılar</h3>
                      <p>Öncelik sırasına göre</p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => setActive("Alerts")}
                    >
                      Tümünü gör
                    </button>
                  </div>
                  <div className="alert-list">
                    {alerts.map((a) => (
                      <div className="alert-row" key={a.device}>
                        <div className={`severity ${a.severity}`}>
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <div className="alert-meta">
                            <b>{a.severity.toUpperCase()}</b>
                            <time>{a.time}</time>
                          </div>
                          <strong>{a.device}</strong>
                          <p>{a.message}</p>
                          <span>{a.store} Köroğlu</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="alert-footer">
                    6 aktif uyarının tümünü görüntüle <ChevronRight size={15} />
                  </button>
                </article>
              </section>
              <section className="panel stores-panel">
                <div className="panel-title">
                  <div>
                    <h3>Mağaza Durumu</h3>
                    <p>Tüm lokasyonların genel sağlık görünümü</p>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => setActive("Stores")}
                  >
                    Tüm mağazalar
                  </button>
                </div>
                <div className="store-grid">
                  {stores.map((s) => (
                    <div className="store-card" key={s.code}>
                      <div className="store-head">
                        <span className="store-icon">
                          <Store size={19} />
                        </span>
                        <div>
                          <strong>{s.name}</strong>
                          <small>{s.code} · Balıkesir</small>
                        </div>
                        <span className={`badge ${s.status}`}>
                          {statusLabel[s.status]}
                        </span>
                      </div>
                      <div className="device-progress">
                        <div>
                          <span>Cihazlar</span>
                          <b>
                            {s.online} / {s.devices} aktif
                          </b>
                        </div>
                        <div>
                          <i
                            style={{
                              width: `${(s.online / s.devices) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="store-foot">
                        <span>
                          <Activity size={14} />
                          Ort. Ping <b>{s.ping} ms</b>
                        </span>
                        <span>
                          <Zap size={14} />
                          {s.issue}
                        </span>
                        <span>
                          Son iletişim <b>{s.seen}</b>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="events">
                <h3>Son Olaylar</h3>
                {[
                  ["14:42", "BND-POS-01 çevrimiçi oldu.", "online"],
                  ["14:38", "ERDEK-POS-02 çevrimdışı oldu.", "offline"],
                  [
                    "14:31",
                    "BND-OFFICE-01 disk kullanımı %91 oldu.",
                    "warning",
                  ],
                  ["14:25", "BIGA Router gecikmesi normale döndü.", "online"],
                ].map((e) => (
                  <div key={e[0]}>
                    <time>{e[0]}</time>
                    <i className={e[2]} />
                    <span>{e[1]}</span>
                  </div>
                ))}
              </section>
            </>
          )}
        </div>
      </main>
      {selected && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelected(null)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div className="device-big">
                <span>
                  <Monitor />
                </span>
                <div>
                  <small>CİHAZ DETAYI</small>
                  <h2>{selected.name}</h2>
                  <p>
                    <i className={selected.status} />
                    {statusLabel[selected.status]}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>
            <div className="drawer-body">
              <section className="quick">
                <div>
                  <Activity />
                  <span>
                    Ping
                    <strong>
                      {selected.ping == null ? "-" : `${selected.ping} ms`}
                    </strong>
                  </span>
                </div>
                <div>
                  <Cpu />
                  <span>
                    CPU<strong>{formatMetric(selected.cpu)}</strong>
                  </span>
                </div>
                <div>
                  <Database />
                  <span>
                    RAM<strong>{formatMetric(selected.ram)}</strong>
                  </span>
                </div>
                <div>
                  <HardDrive />
                  <span>
                    Disk<strong>{formatMetric(selected.disk)}</strong>
                  </span>
                </div>
              </section>
              <h3>Cihaz Bilgileri</h3>
              {[
                ["Hostname", selected.hostname],
                ["Mağaza", selected.store],
                ["Cihaz Tipi", selected.type],
                ["IP Adresi", selected.ip],
                ["MAC Adresi", selected.mac],
                ["İşletim Sistemi", selected.os],
              ].map((x) => (
                <div className="detail-row" key={x[0]}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </div>
              ))}
              <h3>Agent & Durum</h3>
              {[
                ["Agent Managed", selected.agentManaged ? "Yes" : "No"],
                ["Agent ID", selected.agentId || "—"],
                ["Uptime", selected.uptime],
                ["Last Heartbeat", selected.lastSeen],
                ["Agent Sürümü", selected.agent],
              ].map((x) => (
                <div className="detail-row" key={x[0]}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </div>
              ))}
            </div>
            <div className="drawer-footer">
              <ShieldCheck size={17} />
              <span>Bu cihaz güvenli bağlantı üzerinden izleniyor.</span>
            </div>
          </aside>
        </>
      )}
      <button
        className={sim ? "sim active" : "sim"}
        onClick={() => setSim((v) => !v)}
      >
        <CircleGauge size={16} />
        Demo simülasyon: {sim ? "Açık" : "Kapalı"}
      </button>
    </div>
  );
}
