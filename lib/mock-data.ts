export type Status = "online" | "warning" | "offline" | "unknown";
export type DeviceType =
  | "Router"
  | "Switch"
  | "POS"
  | "PC"
  | "Printer"
  | "Server"
  | "NVR"
  | "Tablet"
  | "Other";
export type Device = {
  id: string;
  name: string;
  hostname: string;
  store: string;
  type: DeviceType;
  ip: string;
  mac: string;
  os: string;
  status: Status;
  ping: number | null;
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  uptime: string;
  lastSeen: string;
  agent: string;
  agentManaged?: boolean;
  agentId?: string;
};

export const devices: Device[] = [
  {
    id: "internet",
    name: "Internet",
    hostname: "WAN",
    store: "Bandırma Köroğlu",
    type: "Server",
    ip: "88.255.40.12",
    mac: "—",
    os: "Türk Telekom Fiber",
    status: "online",
    ping: 4,
    cpu: 0,
    ram: 0,
    disk: 0,
    uptime: "31g 8s",
    lastSeen: "Şimdi",
    agent: "—",
  },
  {
    id: "router",
    name: "BND-ROUTER-01",
    hostname: "BND-ROUTER-01",
    store: "Bandırma Köroğlu",
    type: "Router",
    ip: "192.168.1.1",
    mac: "A4:2B:8C:10:00:01",
    os: "RouterOS 7.15",
    status: "online",
    ping: 5,
    cpu: 18,
    ram: 42,
    disk: 12,
    uptime: "18g 2s",
    lastSeen: "3 sn önce",
    agent: "SNMP",
  },
  {
    id: "switch",
    name: "BND-SWITCH-01",
    hostname: "BND-SWITCH-01",
    store: "Bandırma Köroğlu",
    type: "Switch",
    ip: "192.168.1.2",
    mac: "A4:2B:8C:10:00:02",
    os: "UniFi OS",
    status: "online",
    ping: 6,
    cpu: 12,
    ram: 38,
    disk: 8,
    uptime: "18g 2s",
    lastSeen: "4 sn önce",
    agent: "SNMP",
  },
  {
    id: "pos1",
    name: "BND-POS-01",
    hostname: "BND-KASA-01",
    store: "Bandırma Köroğlu",
    type: "POS",
    ip: "192.168.1.21",
    mac: "54:E1:AD:21:4C:01",
    os: "Windows 11 Pro",
    status: "online",
    ping: 8,
    cpu: 24,
    ram: 61,
    disk: 72,
    uptime: "4g 12s",
    lastSeen: "8 sn önce",
    agent: "1.0.0",
    agentManaged: true,
    agentId: "BND-POS-01",
  },
  {
    id: "pos2",
    name: "BND-POS-02",
    hostname: "BND-KASA-02",
    store: "Bandırma Köroğlu",
    type: "POS",
    ip: "192.168.1.22",
    mac: "54:E1:AD:21:4C:02",
    os: "Windows 11 Pro",
    status: "online",
    ping: 11,
    cpu: 31,
    ram: 58,
    disk: 64,
    uptime: "2g 7s",
    lastSeen: "11 sn önce",
    agent: "1.0.0",
  },
  {
    id: "pc",
    name: "BND-OFFICE-01",
    hostname: "BND-OFFICE-01",
    store: "Bandırma Köroğlu",
    type: "PC",
    ip: "192.168.1.31",
    mac: "10:7B:44:19:3A:11",
    os: "Windows 11 Pro",
    status: "warning",
    ping: 18,
    cpu: 42,
    ram: 73,
    disk: 91,
    uptime: "6g 4s",
    lastSeen: "14 sn önce",
    agent: "1.0.0",
    agentManaged: true,
    agentId: "BND-PC-01",
  },
  {
    id: "printer",
    name: "BND-PRINTER-01",
    hostname: "BND-PRINTER-01",
    store: "Bandırma Köroğlu",
    type: "Printer",
    ip: "192.168.1.41",
    mac: "38:22:E2:13:5B:01",
    os: "HP FutureSmart",
    status: "online",
    ping: 14,
    cpu: 0,
    ram: 22,
    disk: 0,
    uptime: "23g 9s",
    lastSeen: "19 sn önce",
    agent: "SNMP",
  },
];

export const stores = [
  {
    name: "Bandırma Köroğlu",
    code: "BND",
    status: "online" as Status,
    devices: 12,
    online: 11,
    issue: "1 Uyarı",
    ping: 14,
    seen: "8 sn önce",
  },
  {
    name: "Biga Köroğlu",
    code: "BIGA",
    status: "online" as Status,
    devices: 9,
    online: 9,
    issue: "Sorun yok",
    ping: 19,
    seen: "12 sn önce",
  },
  {
    name: "Erdek Köroğlu",
    code: "ERD",
    status: "warning" as Status,
    devices: 8,
    online: 7,
    issue: "1 Çevrimdışı",
    ping: 32,
    seen: "1 dk önce",
  },
];

export const alerts = [
  {
    severity: "critical",
    device: "ERDEK-POS-02",
    store: "Erdek",
    message: "Cihaz 18 dakikadır çevrimdışı.",
    time: "14:38",
  },
  {
    severity: "warning",
    device: "BND-OFFICE-01",
    store: "Bandırma",
    message: "Disk kullanımı %91 seviyesine ulaştı.",
    time: "14:31",
  },
  {
    severity: "warning",
    device: "BIGA-PRINTER-01",
    store: "Biga",
    message: "Ping 182 ms seviyesine ulaştı.",
    time: "14:18",
  },
];
