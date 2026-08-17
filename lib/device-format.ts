export function formatMetric(value: number | null | undefined) {
  return value == null ? "-" : `%${Math.round(value * 10) / 10}`;
}

export function formatUptime(
  value: string | bigint | number | null | undefined,
) {
  if (value == null) return "-";
  const seconds = typeof value === "bigint" ? Number(value) : Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return "-";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [days && `${days}g`, hours && `${hours}s`, `${minutes}dk`]
    .filter(Boolean)
    .join(" ");
}

export function relativeTime(value: string | Date | null | undefined) {
  if (!value) return "-";
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 10) return "Şimdi";
  if (seconds < 60) return `${seconds} sn önce`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}
