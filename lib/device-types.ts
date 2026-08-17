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
