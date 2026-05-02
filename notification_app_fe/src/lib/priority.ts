import { Notification, ScoredNotification } from "./types";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 300,
  Result: 200,
  Event: 100,
};

function parseTimestamp(ts: string): number {
  const d = new Date(ts.replace(" ", "T"));
  return isNaN(d.getTime()) ? 0 : Math.floor(d.getTime() / 1000);
}

export function computePriority(notifications: Notification[]): ScoredNotification[] {
  if (notifications.length === 0) return [];

  const epochs = notifications.map((n) => parseTimestamp(n.Timestamp));
  const minEpoch = Math.min(...epochs);
  const maxEpoch = Math.max(...epochs);
  const range = maxEpoch - minEpoch || 1;

  return notifications.map((n, i) => {
    const typeWeight = TYPE_WEIGHT[n.Type] ?? 0;
    const recency = ((epochs[i] - minEpoch) / range) * 99;
    return {
      ...n,
      _priority: parseFloat((typeWeight + recency).toFixed(4)),
      _viewed: false,
    };
  });
}

export function getTopN(scored: ScoredNotification[], n: number): ScoredNotification[] {
  return [...scored].sort((a, b) => b._priority - a._priority).slice(0, n);
}
