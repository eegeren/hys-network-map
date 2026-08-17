const endpoint = process.env.HYS_AGENT_ENDPOINT || "http://localhost:3000/api/agent/heartbeat";
const secret = process.env.HYS_AGENT_SECRET;
if (!secret) throw new Error("HYS_AGENT_SECRET environment variable is required");

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
  body: JSON.stringify({
    agentId:"DEV-PC-01", hostname:"DEV-PC-01", ipAddress:"192.168.1.250",
    macAddress:"AA:BB:CC:DD:EE:FF", operatingSystem:"Windows 11 Pro",
    cpuUsage:18.5, ramUsage:62.1, diskUsage:71.4, uptimeSeconds:345600,
    agentVersion:"0.1.0",
  }),
});
const result = await response.json();
console.log(`Heartbeat response: ${response.status}`, result);
if (!response.ok) process.exitCode = 1;
